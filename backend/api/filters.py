from common_models.models import Subject
from django_filters import rest_framework as filters


class CourseTypeINFilter(filters.BaseInFilter, filters.ChoiceFilter):
    pass


class SubjectFilter(filters.FilterSet):
    course_type = CourseTypeINFilter(
        field_name="course_type", choices=Subject.CourseType.choices
    )
    _choices = Subject.objects.values_list('programme', flat=True).distinct()
    programme = CourseTypeINFilter(choices=[(i, i) for i in _choices])

    class Meta:
        model = Subject
        fields = ['course_type', 'programme']
