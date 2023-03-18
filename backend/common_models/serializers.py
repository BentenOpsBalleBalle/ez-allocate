import logging
from typing import OrderedDict

from django.conf import settings
from django.core import validators
from drf_spectacular.utils import extend_schema_serializer
from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator

from .models import Allotment, Choices, Subject, Teacher

# TODO: add unit tests to make sure all properties are returned in the response

logger = logging.getLogger(__name__)


class _ExtraFieldModelSerializer(serializers.ModelSerializer):
    """
    Allows to add extra fields so reverse relations and model properties can also be added
    https://stackoverflow.com/a/41063577
    """

    def get_field_names(self, declared_fields, info):
        expanded_fields = super().get_field_names(declared_fields, info)

        if getattr(self.Meta, 'extra_fields', None):
            return expanded_fields + self.Meta.extra_fields
        else:
            return expanded_fields


class SubjectSerializer(_ExtraFieldModelSerializer):

    class Meta:
        model = Subject
        exclude = ["_allotment_status"]
        extra_fields = [
            "total_lecture_hours", "total_tutorial_hours", "total_practical_hours",
            "allotted_lecture_hours", "allotted_tutorial_hours", "allotted_practical_hours",
            "allotment_status"
        ]


class SubjectListSerializer(_ExtraFieldModelSerializer):

    class Meta:
        model = Subject
        fields = ["id", "name", "course_code", "course_type", "programme", "credits"]
        extra_fields = ["allotment_status"]


class TeacherSerializer(_ExtraFieldModelSerializer):

    class Meta:
        model = Teacher
        exclude = ["_assigned_status", "subject_choices"]
        extra_fields = ['current_load', 'assigned_status']


class ChoiceSerializer(serializers.ModelSerializer):

    class Meta:
        model = Choices
        exclude = ["id"]


class SubjectChoicesSetSerializer(ChoiceSerializer):
    teacher = TeacherSerializer(read_only=True)

    class Meta(ChoiceSerializer.Meta):
        exclude = ChoiceSerializer.Meta.exclude + ["subject"]


@extend_schema_serializer(exclude_fields=('choice_number', ))
class SubjectChoicesPOSTSerializer(ChoiceSerializer):
    teacher = serializers.PrimaryKeyRelatedField(queryset=Teacher.objects.all())
    __default_choice_number = settings.CUSTOM_SETTINGS["MANUAL_CHOICE_NUMBER"] or 0
    choice_number = serializers.IntegerField(
        default=0,
        validators=[
            validators.MinValueValidator(__default_choice_number),
            validators.MaxValueValidator(__default_choice_number)
        ],
        required=False
    )

    class Meta(ChoiceSerializer.Meta):
        validators = [
            UniqueTogetherValidator(
                queryset=Choices.objects.all(),
                fields=['subject', 'teacher'],
                message="this teacher has already been added to this subject's choice set"
            )
        ]


class ChoicesCeleryImportSerialiser(ChoiceSerializer):
    """
    This serialiser is meant to be used in celery/import function to directly
    add choices to db. has the unique together validator
    """

    class Meta(SubjectChoicesPOSTSerializer.Meta):
        pass


class TeacherChoicesSetSerializer(ChoiceSerializer):
    subject = SubjectListSerializer(read_only=True)

    class Meta(ChoiceSerializer.Meta):
        exclude = ChoiceSerializer.Meta.exclude + ["teacher"]


class AllotmentSerializer(serializers.ModelSerializer):
    # TODO: add validators for allotted hours
    class Meta:
        model = Allotment
        exclude = ["id"]


class SubjectAllotmentSetSerializer(AllotmentSerializer):
    teacher = TeacherSerializer(read_only=True)

    class Meta(AllotmentSerializer.Meta):
        exclude = AllotmentSerializer.Meta.exclude + ["subject"]


class TeacherAllotmentSetSerializer(AllotmentSerializer):
    subject = SubjectListSerializer(read_only=True)

    class Meta(AllotmentSerializer.Meta):
        exclude = AllotmentSerializer.Meta.exclude + ["teacher"]


@extend_schema_serializer(exclude_fields=('subject', ))
class CommitLTPSerializer(AllotmentSerializer):
    # teacher = serializers.PrimaryKeyRelatedField(queryset=Teacher.objects.all())
    # subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all())

    class Meta(AllotmentSerializer.Meta):
        pass

    def validate(self, data: OrderedDict):
        """
        Validates whether the submitted LTP hours are:
            - feasible for teacher
            - feasible for the subject
        also conditions to check:
            - the first teacher getting assigned lecture, should also be
              allotted tutorial and practical 1 hour each
        """
        # print(data)
        teacher: Teacher = data["teacher"]
        subject: Subject = data["subject"]
        allotted_lecture_hours: int = data.setdefault("allotted_lecture_hours", 0)
        allotted_tutorial_hours: int = data.setdefault("allotted_tutorial_hours", 0)
        allotted_practical_hours: int = data.setdefault("allotted_practical_hours", 0)

        if len(
            instance_list := Allotment.objects.filter(subject=subject, teacher=teacher)
        ) == 1:
            __current_instance = instance_list[0]

            current_instance_hours = {
                "allotted_lecture_hours": __current_instance.allotted_lecture_hours,
                "allotted_tutorial_hours": __current_instance.allotted_tutorial_hours,
                "allotted_practical_hours": __current_instance.allotted_practical_hours
            }
        else:
            current_instance_hours = {
                "allotted_lecture_hours": 0,
                "allotted_tutorial_hours": 0,
                "allotted_practical_hours": 0
            }

        total_hours = (
            allotted_lecture_hours + allotted_practical_hours + allotted_tutorial_hours +
            # subtract current instance's hours from the total hours
            -sum(current_instance_hours.values())
        )

        # validate if hours are feasible by the teacher
        if teacher.hours_left() < total_hours:
            raise serializers.ValidationError(
                "exceeded maximum weekly workload! "
                f"Teacher workload is already at {teacher.current_load} hours!"
            )

        # validate hours feasible by the subject
        # allotted L, T, P should be less than the subject's limits
        keys = ("_lecture_hours", "_tutorial_hours", "_practical_hours")

        # get available subject hours
        for key in keys:
            available_hours = (
                subject.__getattribute__("total" + key) +
                current_instance_hours.get("allotted" + key) -
                subject.__getattribute__("allotted" + key)
            )

            if data["allotted" + key] > available_hours:
                raise serializers.ValidationError(
                    {
                        "allotted" + key:
                        f"exceeded available {key[1:]}. remaining hours: {available_hours}"
                        f"""\n{current_instance_hours.get("allotted" + key)} | {subject.__getattribute__("allotted" + key)}"""
                    }
                )

        # first teacher given Lecture should be given T, P hours too, if they exist
        if allotted_lecture_hours != 0 and (
            Allotment.objects.filter(subject=subject).count() == 0
        ):
            for key in keys[1:]:  # over tutorial and practical hours
                allotted_key = "allotted" + key
                if data[allotted_key] == 0 and (
                    # only if Tut or Prac's total hours aren't 0
                    subject.__getattribute__('total' + key) != 0
                ):
                    raise serializers.ValidationError(
                        {
                            allotted_key:
                            "The first teacher allotted lecture hours should also be allotted"
                            f" at least 1 hour of {(tut_or_prac := key[1:].rstrip('_hours').capitalize())}."
                            f"\n remaining {tut_or_prac} hours: {subject.__getattribute__('total' + key)}"
                        }
                    )
        return data

    def is_empty_allotment(self) -> bool:
        """
        returns if the given allotment is empty aka LTP are at 0
        """

        return (
            self.validated_data["allotted_lecture_hours"] +
            self.validated_data["allotted_tutorial_hours"] +
            self.validated_data["allotted_practical_hours"]
        ) == 0

    def update_or_save(self):
        instance_list = Allotment.objects.filter(
            subject=self.validated_data["subject"], teacher=self.validated_data["teacher"]
        )
        if len(instance_list) == 1:
            self.update(instance_list[0], self.validated_data)
        elif len(instance_list) == 0:
            self.save()
        else:
            logger.critical(
                "this should not be possible!! have %d instances of "
                "Allotment for subject: \"%s\" & teacher: \"%s\"", len(instance_list),
                self.validated_data["subject"], self.validated_data["teacher"]
            )
