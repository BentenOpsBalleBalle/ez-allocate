"""
Contains tasks that are better of run from the shell, meant to be run from the
shell.

meant to be run as:
$ USE_MOCK_DB=true python manage.py shell
>>> from tasks import shell_tasks

>>> data = shell_tasks.load_hjson("../new.json")
>>> shell_tasks.create_mock_db_subjects(data)

>>> data = shell_tasks.load_hjson("../auth/temporary/teach.json")
>>> shell_tasks.create_mock_db_teachers(data)
"""

from os import getenv
from typing import List, OrderedDict, Tuple

from common_models.models import Choices, Subject, Teacher
from common_models.serializers import (
    ChoicesCeleryImportSerialiser, SubjectSerializer, TeacherSerializer
)


def mock_to_backend_schema_converter(data: dict) -> dict:
    mock_to_backend_conversion_mapping = {
        "id": "course_code",
        "type": "course_type",
        (key := "original_lecture"): key + "_hours",
        (key := "original_tutorial"): key + "_hours",
        (key := "original_practical"): key + "_hours",
        "lecture_batches": "number_of_lecture_batches",
        "tutorial_batches": "number_of_practical_or_tutorial_batches"
    }
    converted = dict()
    for key in data:
        value = data[key]
        key = mock_to_backend_conversion_mapping.get(key, key)
        converted[key] = value

    # fixes
    fix_course_type(converted)

    return converted


def fix_course_type(data: dict):
    data["course_type"] = data.get("course_type")[:4].upper()


def load_hjson(file: str):
    import hjson
    with open(file) as f:
        data = hjson.loads(f.read())

    return data


def assert_mock_db():
    assert getenv(
        "USE_MOCK_DB", "0"
    ).lower() in ('true', '1'), "can only create mock db when USE_MOCK_DB is true"


def create_mock_db_subjects(data: List[OrderedDict]):
    assert_mock_db()

    sanitized = []
    for entry in data:
        sanitized.append(mock_to_backend_schema_converter(entry))
    serializer = SubjectSerializer(data=sanitized, many=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()


def get_preferred_subjects(data: OrderedDict) -> Tuple[int, str]:
    preferred = []
    for pref_order in (data.get("core_subjects", []), data.get("elective_subjects", [])):
        preferred.extend(list(enumerate(pref_order, start=1)))

    return tuple(preferred)


def add_preferred_choices_in_db(teacher: Teacher, data: OrderedDict):
    # NOTE: can do bulk queries here
    for choice in get_preferred_subjects(data):
        choice_number, code = choice
        try:
            serializer = ChoicesCeleryImportSerialiser(
                data={
                    'teacher': teacher.id,
                    'subject': Subject.objects.get(course_code__iexact=code).id,
                    'choice_number': choice_number
                }
            )
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            print(e, "subjectcode:", code, "teacher name:", teacher.name)
        else:
            serializer.save()


def create_mock_db_teachers(data: List[OrderedDict]):
    assert_mock_db()

    for teach in data:
        serializer = TeacherSerializer(data=teach)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        add_preferred_choices_in_db(serializer.instance, teach)

    print("added:", Choices.objects.count(), "items")
