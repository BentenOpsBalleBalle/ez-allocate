"""
Contains tasks that are better of run from the shell, meant to be run from the
shell.

meant to be run as:
$ USE_MOCK_DB=true python manage.py shell
>>> from tasks import shell_tasks
>>> data = shell_tasks.load_hjson("../new.json")
>>> shell_tasks.create_mock_db_subjects(data)
"""

from os import getenv
from typing import List, OrderedDict

from common_models.serializers import SubjectSerializer


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


def create_mock_db_subjects(data: List[OrderedDict]):
    assert getenv(
        "USE_MOCK_DB", False
    ).lower() in ('true', '1'), "can only create mock db when USE_MOCK_DB is true"

    sanitized = []
    for entry in data:
        sanitized.append(mock_to_backend_schema_converter(entry))
    serializer = SubjectSerializer(data=sanitized, many=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
