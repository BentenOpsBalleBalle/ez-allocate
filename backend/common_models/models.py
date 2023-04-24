from typing import Tuple

from django.conf import settings
from django.core.validators import (
    MaxValueValidator, MinValueValidator, int_list_validator
)
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
MAXIMUM_TEACHER_WORKLOAD_hrs = settings.CUSTOM_SETTINGS["MAX_TEACHER_WORKLOAD_HOURS"] or 14


class AllotmentStatus(models.TextChoices):
    NONE = "NONE"
    PARTIAL = "PART", _('Partial')
    FULL = "FULL"
    ERROR = "OVER", _('Extra Full')

    @classmethod
    def compute_partial_or_full(
        cls, current_value: Tuple[int, ...], maximum_value: Tuple[int, ...]
    ):
        """
        Given the current value of a field, and the maximum it can reach,
        This function outputs:
            - None
            - Partial
            - Full
            - Error
        as a form of a computed value

        The function does that by maintaining the state of difference between current value and the maximum allowed
        value.
        - If the current values are all 0, we track that and store 0 then at the end if all the values have been 0, we
          know that nothing has been allotted yet
        - If the current value matches its maximum, then we will have an empty list at the end
        - while doing that, if somehow the current value is greater than the maximum allowed, we set the state to an
          error and hope that someone will take a look at it
        - otherwise, partial state
        """
        assert len(current_value) == len(maximum_value), "Tuple pairs are of different length\n" + \
                                                         f"{len(current_value)} != {len(maximum_value)} "
        status = []
        for current, max_ in zip(current_value, maximum_value):
            if current == 0 and max_ != 0:
                status.append(0)
            elif current == max_:
                pass
            elif current > max_:
                return cls.ERROR
            else:
                status.append(0.5)

        all_fields_status = sum(status)
        if len(status) == 0:
            return cls.FULL
        elif all_fields_status == 0:
            return cls.NONE
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
        max_length=4, choices=AllotmentStatus.choices, default=AllotmentStatus.NONE
    )
    allotted_teachers = models.ManyToManyField("Teacher", through="Allotment")

    def __str__(self):
        return f"{self.course_code}: {self.name}"

    def repr_csv(self):
        credits_repr = (
            f"{self.original_lecture_hours}-"
            f"{self.original_tutorial_hours}-"
            f"{self.original_practical_hours}"
        )
        return f"{self.name.title()} ({self.programme.capitalize()})({credits_repr})"

    @property
    def allotment_status(self) -> AllotmentStatus:
        current = AllotmentStatus.compute_partial_or_full(
            current_value=(
                self.allotted_lecture_hours, self.allotted_practical_hours,
                self.allotted_tutorial_hours
            ),
            maximum_value=(
                self.total_lecture_hours, self.total_practical_hours,
                self.total_tutorial_hours
            )
        )
        if current != self._allotment_status:
            self._allotment_status = current
            self.save()
        return self._allotment_status

    @property
    def total_lecture_hours(self) -> int:
        return self.original_lecture_hours * self.number_of_lecture_batches

    @property
    def total_tutorial_hours(self) -> int:
        return self.original_tutorial_hours * self.number_of_practical_or_tutorial_batches

    @property
    def total_practical_hours(self) -> int:
        return self.original_practical_hours * self.number_of_practical_or_tutorial_batches

    @cached_property
    def __allotted_hours_computed(self):
        return self.allotment_set.aggregate(
            lecture=models.Sum('allotted_lecture_hours'),
            tutorial=models.Sum('allotted_tutorial_hours'),
            practical=models.Sum('allotted_practical_hours')
        )

    @property
    def allotted_lecture_hours(self) -> int:
        return self.__allotted_hours_computed["lecture"] or 0

    @property
    def allotted_tutorial_hours(self) -> int:
        return self.__allotted_hours_computed["tutorial"] or 0

    @property
    def allotted_practical_hours(self) -> int:
        return self.__allotted_hours_computed["practical"] or 0


class Teacher(models.Model):

    name = models.CharField(max_length=128)
    email = models.EmailField(unique=True)

    preferred_mode = models.CharField(
        max_length=3, validators=[teacher_model_validate_ltp_preference], default="LTP"
    )
    _assigned_status = models.CharField(
        max_length=4, choices=AllotmentStatus.choices, default=AllotmentStatus.NONE
    )

    subject_choices = models.ManyToManyField(Subject, through="Choices")

    def __str__(self):
        return self.name

    @cached_property
    def current_load(self) -> int:
        return self.allotment_set.aggregate(
            load=models.Sum('allotted_lecture_hours') +
            models.Sum('allotted_tutorial_hours') + models.Sum('allotted_practical_hours')
        )['load'] or 0

    @property
    def assigned_status(self) -> AllotmentStatus:
        current = AllotmentStatus.compute_partial_or_full(
            current_value=(self.current_load, ),
            maximum_value=(MAXIMUM_TEACHER_WORKLOAD_hrs, )
        )
        if current != self._assigned_status:
            self._assigned_status = current
            self.save()
        return self._assigned_status

    def save(self, *args, **kwargs):
        self.preferred_mode = self.preferred_mode.upper()
        super().save(*args, **kwargs)

    def hours_left(self) -> int:
        return MAXIMUM_TEACHER_WORKLOAD_hrs - self.current_load


class Choices(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    choice_number = models.SmallIntegerField()

    def __str__(self):
        return f"teacher={self.teacher.name}, subject={self.subject}, choice={self.choice_number}"

    @property
    def manually_added(self) -> bool:
        return self.choice_number == settings.CUSTOM_SETTINGS["MANUAL_CHOICE_NUMBER"]


class Allotment(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

    __validators = [
        int_list_validator(sep="", code="number contains decimals"),
        MinValueValidator(0)
    ]
    __validators_tut_and_prac = __validators + \
        [MaxValueValidator(MAXIMUM_TEACHER_WORKLOAD_hrs)]

    allotted_lecture_hours = models.SmallIntegerField(
        default=0,
        validators=__validators + [MaxValueValidator(MAXIMUM_TEACHER_WORKLOAD_hrs - 2)]
    )
    allotted_tutorial_hours = models.SmallIntegerField(
        default=0, validators=__validators_tut_and_prac
    )
    allotted_practical_hours = models.SmallIntegerField(
        default=0, validators=__validators_tut_and_prac
    )

    def __str__(self):
        return f"teacher={self.teacher.name}, subject={self.subject.name}, lecture={self.allotted_lecture_hours}, " \
               f"tutorial={self.allotted_tutorial_hours}, practical={self.allotted_practical_hours}"

    def get_allotment_total_hours(self):
        return (
            self.allotted_lecture_hours + self.allotted_tutorial_hours +
            self.allotted_practical_hours
        )


class CeleryFileResults(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    filename = models.SlugField(max_length=80)
    file = models.BinaryField()
    created_at = models.DateTimeField(auto_now_add=True)
    has_been_downloaded_yet = models.BooleanField(default=False)

    def __str__(self) -> str:
        return (
            f"file_id={self.id}, filename={self.filename}, created_at={self.created_at}, "
            f"downloaded={self.has_been_downloaded_yet}"
        )
