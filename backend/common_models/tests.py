from django.test import TestCase

from .models import Allotment, Subject, Teacher


# TODO: create tests for (future) computed *_status'
# Create your tests here.


class AllotmentModelRelationShipTest(TestCase):
    """
    to test:
        - allotted ltp is correct:
            - for 0 teacher
            - for 1 teacher
            - 2 teacher
        - on the teacher side, current_load is correct for:
            - 0 subs
            - 1 subs
            - 2 subs
    """

    @classmethod
    def setUpTestData(cls):
        cls.subject1 = Subject(name="subject1", course_code="sub1", credits=5, course_type=Subject.CourseType.CORE,
                               original_lecture_hours=3, original_tutorial_hours=1, original_practical_hours=1,
                               number_of_lecture_batches=2, number_of_practical_or_tutorial_batches=6)

        cls.subject2 = Subject(name="subject3", course_code="sub3", credits=4, course_type=Subject.CourseType.ELECTIVE,
                               original_lecture_hours=2, original_tutorial_hours=0, original_practical_hours=4,
                               number_of_lecture_batches=2, number_of_practical_or_tutorial_batches=6)

        cls.subject1.save()
        cls.subject2.save()

        cls.teacher1 = Teacher(name="john")
        cls.teacher2 = Teacher(name="doe")
        cls.teacher1.save()
        cls.teacher2.save()

    def test_subject_computed_values_sanity_checks(self):
        # total lecture hours
        self.assertEqual(self.subject1.total_lecture_hours, 6)
        # total tutorial & practical hours
        self.assertEqual(self.subject1.total_tutorial_hours, 6)
        self.assertEqual(self.subject1.total_practical_hours, 6)
        self.assertNotEqual(self.subject1.course_code,
                            self.subject2.course_code)

    def test_subject_allotment_ltp_0_teacher(self):
        self.assertEqual(self.subject1.allotted_lecture_hours, 0)
        self.assertEqual(self.subject1.allotted_tutorial_hours, 0)
        self.assertEqual(self.subject1.allotted_practical_hours, 0)

    def test_subject_allotment_ltp_1_teacher(self):
        self.subject1.allotted_teachers.add(self.teacher1, through_defaults={'allotted_lecture_hours': 3,
                                                                             'allotted_tutorial_hours': 4,
                                                                             'allotted_practical_hours': 5})

        self.assertEqual(self.subject1.allotted_lecture_hours, 3)
        self.assertEqual(self.subject1.allotted_tutorial_hours, 4)
        self.assertEqual(self.subject1.allotted_practical_hours, 5)

    def test_subject_allotment_ltp_2_teacher(self):
        self.subject1.allotted_teachers.add(self.teacher1, through_defaults={'allotted_lecture_hours': 3,
                                                                             'allotted_tutorial_hours': 4,
                                                                             'allotted_practical_hours': 5})
        self.subject1.allotted_teachers.add(self.teacher2, through_defaults={'allotted_lecture_hours': 3,
                                                                             'allotted_tutorial_hours': 4,
                                                                             'allotted_practical_hours': 5})

        self.assertEqual(self.subject1.allotted_lecture_hours, 6)
        self.assertEqual(self.subject1.allotted_tutorial_hours, 4 + 4)
        self.assertEqual(self.subject1.allotted_practical_hours, 5 + 5)

    def test_teacher_current_load_0_subs(self):
        self.assertEqual(self.teacher1.current_load, 0)

    def test_teacher_current_load_1_subs(self):
        Allotment.objects.create(subject=self.subject1, teacher=self.teacher1, **{'allotted_lecture_hours': 0,
                                                                                  'allotted_tutorial_hours': 4,
                                                                                  'allotted_practical_hours': 5})
        self.assertEqual(self.teacher1.current_load, 9)

    def test_teacher_current_load_2_subs(self):
        Allotment.objects.create(subject=self.subject1, teacher=self.teacher1, **{'allotted_lecture_hours': 0,
                                                                                  'allotted_tutorial_hours': 4,
                                                                                  'allotted_practical_hours': 5})
        Allotment.objects.create(subject=self.subject2, teacher=self.teacher1, **{'allotted_lecture_hours': 1,
                                                                                  'allotted_tutorial_hours': 4,
                                                                                  'allotted_practical_hours': 5})

        self.assertEqual(self.teacher1.current_load, 4 + 5 + 1 + 4 + 5)
