from common_models.models import Choices, Subject, Teacher
from django.conf import settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


# Create your tests here.
class SubjectChoicesTest(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.subject1 = Subject(name="subject1", course_code="sub1", credits=5, course_type=Subject.CourseType.CORE,
                               original_lecture_hours=3, original_tutorial_hours=1, original_practical_hours=2,
                               number_of_lecture_batches=2, number_of_practical_or_tutorial_batches=6)

        cls.teacher1 = Teacher(name="john")

        cls.subject1.save()
        cls.teacher1.save()

    def test_manually_adding_a_teacher_to_subjects_choice_set(self):
        """
        Test that we can manually add a teacher for a subject's choices
        this test also mainly checks the functionality is working
        """
        url = reverse("subjects-choices-modify",
                      args=["1", "1"])  # subject & teacher have the argument 1

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
        url = reverse("subjects-choices-modify",
                      args=["1", "1"])  # subject & teacher have the argument 1

        response = self.client.post(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Choices.objects.count(), 1)

        response = self.client.post(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Choices.objects.count(), 1)

    def test_manually_adding_a_teacher_that_is_already_added_but_not_manually(self):
        Choices.objects.create(subject=self.subject1,
                               teacher=self.teacher1, choice_number=1)

        url = reverse("subjects-choices-modify",
                      args=["1", "1"])  # subject & teacher have the argument 1

        response = self.client.post(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Choices.objects.count(), 1)
        instance = Choices.objects.get(
            subject=self.subject1, teacher=self.teacher1)
        self.assertEqual(instance.choice_number, 1)

    def test_deleting_a_teacher_that_is_manually_added(self):
        url = reverse("subjects-choices-modify",
                      args=["1", "1"])  # subject & teacher have the argument 1

        self.client.post(url, format="json")
        self.assertEqual(Choices.objects.count(), 1)

        response = self.client.delete(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Choices.objects.count(), 0)

    def test_not_being_able_to_delete_a_teacher_not_manually_added(self):
        """
        You should not be able to delete a teacher that was not manually added to the choice set
        """
        Choices.objects.create(subject=self.subject1,
                               teacher=self.teacher1, choice_number=1)

        url = reverse("subjects-choices-modify",
                      args=["1", "1"])  # subject & teacher have the argument 1

        response = self.client.delete(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Choices.objects.count(), 1)

    def test_deleting_a_teacher_that_does_not_exist(self):
        url = reverse("subjects-choices-modify",
                      args=["1", "1"])  # subject & teacher have the argument 1

        response = self.client.delete(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
