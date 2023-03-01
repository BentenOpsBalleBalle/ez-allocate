from django.db import models
from django.utils.functional import cached_property
from django.utils.translation import gettext_lazy as _

from .utils.validators import teacher_model_validate_ltp_preference

# Create your models here.

# TODO: test these out aka write unit tests maybe
# TODO: define max/min values for integer field
# TODO: add multi field validation https://stackoverflow.com/a/43168682
# TODO: create Subjects.programme a list of choices


# CONSTANTS
MAXIMUM_TEACHER_WORKLOAD_hrs = 14


class AllotmentStatus(models.TextChoices):
    NONE = "NONE"
    PARTIAL = "PART", _('Partial')
    FULL = "FULL"

    @classmethod
    def compute_partial_or_full(cls, current_value: int, maximum_value: int):
        """
        Given the current value of a field, and the maximum it can reach,
        This function outputs:
            - None
            - Partial
            - Full
        as a form of a computed value
        """
        if current_value == 0:
            return cls.NONE
        elif current_value == maximum_value:
            return cls.FULL
        else:
            return cls.PARTIAL


# NOTE: can add custom QuerySet as managers to filter computed fields
# source: https://stackoverflow.com/a/36996962
# remember:
#   - properties -> row-level functionality
#   - manager methods -> table-level functionality
class Subject(models.Model):
    class CourseType(models.TextChoices):
        CORE = "CORE"
        ELECTIVE = "ELEC"

    name = models.CharField(max_length=128)
    course_code = models.SlugField(max_length=10, unique=True)
    credits = models.SmallIntegerField()  # maybe add max length?
    course_type = models.CharField(max_length=4, choices=CourseType.choices)
    programme = models.CharField(max_length=20)

    original_lecture_hours = models.SmallIntegerField()
    original_tutorial_hours = models.SmallIntegerField()
    original_practical_hours = models.SmallIntegerField()

    number_of_lecture_batches = models.SmallIntegerField()
    number_of_practical_or_tutorial_batches = models.SmallIntegerField()

    _allotment_status = models.CharField(
        max_length=4, choices=AllotmentStatus.choices, default=AllotmentStatus.NONE)
    allotted_teachers = models.ManyToManyField("Teacher", through="Allotment")

    def __str__(self):
        return f"{self.course_code}: {self.name}"

    @property
    def allotment_status(self):
        current = AllotmentStatus.compute_partial_or_full(
            current_value=(self.allotted_lecture_hours +
                           self.allotted_practical_hours+self.allotted_tutorial_hours),
            maximum_value=(self.total_lecture_hours +
                           self.total_practical_hours + self.allotted_tutorial_hours)
        )
        if current != self._allotment_status:
            self._allotment_status = current
            self.save()
        return self._allotment_status

    @property
    def total_lecture_hours(self):
        return self.original_lecture_hours * self.number_of_lecture_batches

    @property
    def total_tutorial_hours(self):
        return self.original_tutorial_hours * self.number_of_practical_or_tutorial_batches

    @property
    def total_practical_hours(self):
        return self.original_practical_hours * self.number_of_practical_or_tutorial_batches

    @cached_property
    def __allotted_hours_computed(self):
        return self.allotment_set.aggregate(lecture=models.Sum('allotted_lecture_hours'),
                                            tutorial=models.Sum(
                                                'allotted_tutorial_hours'),
                                            practical=models.Sum('allotted_practical_hours'))

    @property
    def allotted_lecture_hours(self):
        return self.__allotted_hours_computed["lecture"] or 0

    @property
    def allotted_tutorial_hours(self):
        return self.__allotted_hours_computed["tutorial"] or 0

    @property
    def allotted_practical_hours(self):
        return self.__allotted_hours_computed["practical"] or 0


class Teacher(models.Model):

    name = models.CharField(max_length=128)

    preferred_mode = models.CharField(
        max_length=3, validators=[teacher_model_validate_ltp_preference], default="LTP")
    _assigned_status = models.CharField(
        max_length=4, choices=AllotmentStatus.choices, default=AllotmentStatus.NONE)

    subject_choices = models.ManyToManyField(Subject, through="Choices")

    def __str__(self):
        return self.name

    @cached_property
    def current_load(self):
        return self.allotment_set.aggregate(load=models.Sum('allotted_lecture_hours') +
                                            models.Sum('allotted_tutorial_hours') +
                                            models.Sum('allotted_practical_hours'))['load'] or 0

    @property
    def assigned_status(self):
        current = AllotmentStatus.compute_partial_or_full(
            current_value=self.current_load,
            maximum_value=MAXIMUM_TEACHER_WORKLOAD_hrs
        )
        if current != self._assigned_status:
            self._assigned_status = current
            self.save()
        return self._assigned_status

    def save(self, *args, **kwargs):
        self.preferred_mode = self.preferred_mode.upper()
        super().save(*args, **kwargs)


class Choices(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    choice_number = models.SmallIntegerField()

    def __str__(self):
        return f"teacher={self.teacher.name}, subject={self.subject}, choice={self.choice_number}"


class Allotment(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

    allotted_lecture_hours = models.SmallIntegerField(default=0)
    allotted_tutorial_hours = models.SmallIntegerField(default=0)
    allotted_practical_hours = models.SmallIntegerField(default=0)

    def __str__(self):
        return f"teacher={self.teacher.name}, subject={self.subject.name}, lecture={self.allotted_lecture_hours}, " \
               f"tutorial={self.allotted_tutorial_hours}, practical={self.allotted_practical_hours}"
