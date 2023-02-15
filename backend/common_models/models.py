from django.db import models
from django.utils.translation import gettext_lazy as _

# Create your models here.

# TODO: create computed fields
# TODO: add many to many relationships
# TODO: define max/min values for integer field


class AllottmentStatus(models.TextChoices):
    NONE = "NONE"
    PARTIAL = "PART", _('Partial')
    FULL = "FULL"


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

    allotment_status = models.CharField(
        max_length=4, choices=AllottmentStatus.choices, default=AllottmentStatus.NONE)


class Teacher(models.Model):

    class PrefferredMode(models.TextChoices):
        LECTURE = "LEC", _('Lecture')
        TUTORIAL = "TUT", _('Tutorial')
        PRACTICAL = "LAB", _("Practical/Lab")
        ANY = "ANY", _("Any")

    name = models.CharField(max_length=128)

    prefferred_mode = models.CharField(
        max_length=3, choices=PrefferredMode.choices, default=PrefferredMode.ANY)
    assigned_status = models.CharField(
        max_length=4, choices=AllottmentStatus.choices, default=AllottmentStatus.NONE)
