from common_models.models import Allotment, Choices, Subject, Teacher
from django.conf import settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


# Create your tests here.
class SubjectChoicesTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.subject1 = Subject(
            name="subject1",
            course_code="sub1",
            credits=5,
            course_type=Subject.CourseType.CORE,
            original_lecture_hours=3,
            original_tutorial_hours=1,
            original_practical_hours=2,
            number_of_lecture_batches=2,
            number_of_practical_or_tutorial_batches=6
        )

        cls.teacher1 = Teacher(name="john")

        cls.subject1.save()
        cls.teacher1.save()

    def test_manually_adding_a_teacher_to_subjects_choice_set(self):
        """
        Test that we can manually add a teacher for a subject's choices
        this test also mainly checks the functionality is working
        """
        url = reverse(
            "subjects-choices-modify", args=["1", "1"]
        )  # subject & teacher have the argument 1

        response = self.client.post(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Choices.objects.count(), 1)

        choice: Choices = self.subject1.choices_set.get(teacher__pk=1)
        manual_choice_number = settings.CUSTOM_SETTINGS["MANUAL_CHOICE_NUMBER"]
        print(manual_choice_number)
        self.assertEqual(choice.choice_number, manual_choice_number)

    def test_manually_adding_a_teacher_to_subjects_choice_set_twice(self):
        """
        Test that manually adding a teacher to a subject's choices two or more times, doesn't actually duplicate the
        entry in Choice set for that subject
        """
        url = reverse(
            "subjects-choices-modify", args=["1", "1"]
        )  # subject & teacher have the argument 1

        response = self.client.post(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Choices.objects.count(), 1)

        response = self.client.post(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Choices.objects.count(), 1)

    def test_manually_adding_a_teacher_that_is_already_added_but_not_manually(self):
        Choices.objects.create(
            subject=self.subject1, teacher=self.teacher1, choice_number=1
        )

        url = reverse(
            "subjects-choices-modify", args=["1", "1"]
        )  # subject & teacher have the argument 1

        response = self.client.post(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Choices.objects.count(), 1)
        instance = Choices.objects.get(subject=self.subject1, teacher=self.teacher1)
        self.assertEqual(instance.choice_number, 1)

    def test_deleting_a_teacher_that_is_manually_added(self):
        url = reverse(
            "subjects-choices-modify", args=["1", "1"]
        )  # subject & teacher have the argument 1

        self.client.post(url, format="json")
        self.assertEqual(Choices.objects.count(), 1)

        response = self.client.delete(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Choices.objects.count(), 0)

    def test_not_being_able_to_delete_a_teacher_not_manually_added(self):
        """
        You should not be able to delete a teacher that was not manually added to the choice set
        """
        Choices.objects.create(
            subject=self.subject1, teacher=self.teacher1, choice_number=1
        )

        url = reverse(
            "subjects-choices-modify", args=["1", "1"]
        )  # subject & teacher have the argument 1

        response = self.client.delete(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Choices.objects.count(), 1)

    def test_deleting_a_teacher_that_does_not_exist(self):
        url = reverse(
            "subjects-choices-modify", args=["1", "1"]
        )  # subject & teacher have the argument 1

        response = self.client.delete(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class CommitLTPValidatorTest(APITestCase):
    """
    inputs:
        - L, T, P hours
    Stuff to test:
        - L, T, P hours should be less than the subject's limits
        - L, T, P hours feasible by teacher
        - L, T, P hours feasible by the subject
        - first L teacher should be allotted T:1, P:1 hours too
        - if L, T, P hours are 0 remove the entry from db or on a DELETE
          request
    """

    @classmethod
    def setUpTestData(cls):
        cls.teacher1 = Teacher(name="john")
        cls.teacher1.save()

    def call_api(
        self, teacher=1, allotted_lecture=0, allotted_tutorial=0, allotted_practical=0
    ):
        url = reverse(
            "subjects-commit-ltp", args=["1"]
        )  # subject & teacher have the argument 1
        data = {
            "teacher": teacher,
            "allotted_lecture_hours": allotted_lecture,
            "allotted_tutorial_hours": allotted_tutorial,
            "allotted_practical_hours": allotted_practical
        }
        response = self.client.post(url, format="json", data=data)
        # print(response.data)
        return response

    def test_subject_specific_ltp_limits_are_checked(self):
        subject1 = Subject(
            name="subject1",
            course_code="sub1",
            credits=3,
            course_type=Subject.CourseType.CORE,
            original_lecture_hours=1,
            original_tutorial_hours=1,
            original_practical_hours=2,
            number_of_lecture_batches=2,
            number_of_practical_or_tutorial_batches=6
        )
        subject1.save()
        response = self.call_api(allotted_lecture=3)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.call_api(allotted_tutorial=7)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.call_api(allotted_practical=13)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_ltp_hours_feasible_by_teacher(self):
        subject1 = Subject(
            name="subject1",
            course_code="sub1",
            credits=3,
            course_type=Subject.CourseType.CORE,
            original_lecture_hours=1,
            original_tutorial_hours=1,
            original_practical_hours=2,
            number_of_lecture_batches=2,
            number_of_practical_or_tutorial_batches=6
        )
        subject1.save()

        subject2 = Subject(
            name="subject2",
            course_code="sub2",
            credits=3,
            course_type=Subject.CourseType.CORE,
            original_lecture_hours=1,
            original_tutorial_hours=1,
            original_practical_hours=2,
            number_of_lecture_batches=2,
            number_of_practical_or_tutorial_batches=6
        )
        subject2.save()

        Allotment.objects.create(
            subject=subject2, teacher=self.teacher1, allotted_practical_hours=12
        )

        response = self.call_api(allotted_lecture=2, allotted_tutorial=1)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_first_lecture_teacher_should_be_given_tut_and_prac(self):
        subject1 = Subject(
            name="subject1",
            course_code="sub1",
            credits=3,
            course_type=Subject.CourseType.CORE,
            original_lecture_hours=1,
            original_tutorial_hours=1,
            original_practical_hours=2,
            number_of_lecture_batches=2,
            number_of_practical_or_tutorial_batches=6
        )
        subject1.save()

        response = self.call_api(allotted_lecture=1)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.call_api(
            allotted_lecture=1, allotted_tutorial=1, allotted_practical=1
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_ltp_feasible_by_subject(self):
        subject1 = Subject(
            name="subject1",
            course_code="sub1",
            credits=3,
            course_type=Subject.CourseType.CORE,
            original_lecture_hours=1,
            original_tutorial_hours=1,
            original_practical_hours=2,
            number_of_lecture_batches=2,
            number_of_practical_or_tutorial_batches=6
        )
        subject1.save()

        teacher2 = Teacher(name="bob doe")
        teacher2.save()

        Allotment.objects.create(
            subject=subject1,
            teacher=teacher2,
            allotted_lecture_hours=1,
            allotted_tutorial_hours=3,
            allotted_practical_hours=6
        )

        # test lecture
        response = self.call_api(allotted_lecture=2)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # test tutorial
        response = self.call_api(allotted_tutorial=4)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # test practical
        response = self.call_api(allotted_practical=7)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # legit response
        response = self.call_api(
            allotted_lecture=1, allotted_tutorial=2, allotted_practical=6
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_on_request_or_all_ltp_0(self):
        subject1 = Subject(
            name="subject1",
            course_code="sub1",
            credits=3,
            course_type=Subject.CourseType.CORE,
            original_lecture_hours=1,
            original_tutorial_hours=1,
            original_practical_hours=2,
            number_of_lecture_batches=2,
            number_of_practical_or_tutorial_batches=6
        )
        subject1.save()

        Allotment.objects.create(
            subject=subject1,
            teacher=self.teacher1,
            allotted_lecture_hours=1,
            allotted_tutorial_hours=3,
            allotted_practical_hours=6
        )

        # by sending all 0 response
        response = self.call_api()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Allotment.objects.count(), 0)

        # by making a delete request
        Allotment.objects.create(
            subject=subject1,
            teacher=self.teacher1,
            allotted_lecture_hours=1,
            allotted_tutorial_hours=3,
            allotted_practical_hours=6
        )
        url = reverse("subjects-commit-ltp", args=["1", "1"])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Allotment.objects.count(), 0)
