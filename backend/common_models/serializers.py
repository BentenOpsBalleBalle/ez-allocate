from django.conf import settings
from django.core import validators
from drf_spectacular.utils import extend_schema_serializer
from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator

from .models import Allotment, Choices, Subject, Teacher

# TODO: add unit tests to make sure all properties are returned in the response


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
        extra_fields = ["total_lecture_hours",  "total_tutorial_hours", "total_practical_hours",
                        "allotted_lecture_hours", "allotted_tutorial_hours", "allotted_practical_hours", "allotment_status"]


class SubjectListSerializer(_ExtraFieldModelSerializer):
    class Meta:
        model = Subject
        fields = ["id", "name", "course_code", "programme", "credits"]
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


@extend_schema_serializer(exclude_fields=('choice_number',))
class SubjectChoicesPOSTSerializer(ChoiceSerializer):
    teacher = serializers.PrimaryKeyRelatedField(
        queryset=Teacher.objects.all())
    __default_choice_number = settings.CUSTOM_SETTINGS["MANUAL_CHOICE_NUMBER"] or 0
    choice_number = serializers.IntegerField(default=0,
                                             validators=[
                                                 validators.MinValueValidator(
                                                     __default_choice_number),
                                                 validators.MaxValueValidator(__default_choice_number)],
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


class TeacherChoicesSetSerializer(ChoiceSerializer):
    subject = SubjectListSerializer(
        read_only=True)

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
