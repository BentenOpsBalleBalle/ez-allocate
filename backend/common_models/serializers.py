from rest_framework import serializers

from .models import Subject, Teacher

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
        fields = "__all__"
        extra_fields = ["total_lecture_hours",  "total_tutorial_hours", "total_practical_hours",
                        "allotted_lecture_hours", "allotted_tutorial_hours", "allotted_practical_hours"]


class TeacherSerializer(_ExtraFieldModelSerializer):
    class Meta:
        model = Teacher
        fields = "__all__"
        extra_fields = ['current_load', 'allotment_set']
