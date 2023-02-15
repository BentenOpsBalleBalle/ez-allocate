from django.db import models
from django.utils.translation import gettext_lazy as _


# Create your models here.

# TODO: create computed fields
# TODO: define max/min values for integer field


class AllotmentStatus(models.TextChoices):
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
        max_length=4, choices=AllotmentStatus.choices, default=AllotmentStatus.NONE)
    allotted_teachers = models.ManyToManyField("Teacher", through="Allotment")

    def __str__(self):
        return f"{self.course_code}: {self.name}"


class Teacher(models.Model):
    class PreferredMode(models.TextChoices):
        LECTURE = "LEC", _('Lecture')
        TUTORIAL = "TUT", _('Tutorial')
        PRACTICAL = "LAB", _("Practical/Lab")
        ANY = "ANY", _("Any")

    name = models.CharField(max_length=128)

    preferred_mode = models.CharField(
        max_length=3, choices=PreferredMode.choices, default=PreferredMode.ANY)
    assigned_status = models.CharField(
        max_length=4, choices=AllotmentStatus.choices, default=AllotmentStatus.NONE)

    subject_choices = models.ManyToManyField(Subject, through="Choices")

    def __str__(self):
        return self.name


class Choices(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    choice_number = models.SmallIntegerField()

    def __str__(self):
        return f"teacher={self.teacher.name}, subject={self.subject}, choice={self.choice_number}"


class Allotment(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

    allotted_lectures_hours = models.SmallIntegerField()
    allotted_tutorial_hours = models.SmallIntegerField()
    allotted_practical_hours = models.SmallIntegerField()

    def __str__(self):
        return f"teacher={self.teacher.name}, subject={self.subject.name}, lecture={self.allotted_lectures_hours}, " \
               f"tutorial={self.allotted_tutorial_hours}, practical={self.allotted_practical_hours}"
