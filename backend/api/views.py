from common_models import serializers
from common_models.models import Allotment, Choices, Subject, Teacher
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

# Create your views here.


class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = serializers.SubjectSerializer

    def list(self, request, *args, **kwargs):
        # TODO: add pagination
        old = self.serializer_class
        self.serializer_class = serializers.SubjectListSerializer

        response = super().list(request, *args, **kwargs)

        self.serializer_class = old
        return response

    @action(detail=True)
    def choices(self, request, pk=None):
        """
        Returns the list of teachers that have selected the current subject
        in their preferences, sorted by `choice_number`
        """
        subject: Subject = self.get_object()
        serializer = serializers.SubjectChoicesSetSerializer(
            subject.choices_set.all().order_by("choice_number"), many=True)
        return Response(serializer.data)

    @action(detail=True)
    def allotments(self, request, pk=None):
        """
        Returns the list of teachers that have been allotted to the current subject
        alongwith the LTP hours
        """
        queryset = Allotment.objects.filter(subject__pk=pk)
        serialzer = serializers.SubjectAllotmentSetSerializer(
            queryset, many=True)
        return Response(serialzer.data)


class TeacherViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = serializers.TeacherSerializer

    @action(detail=True)
    def choices(self, request, pk=None):
        """
        Returns the list of subjects that have been chosen by the current
        teacher, sorted by `choice_number`
        """
        teacher: Teacher = self.get_object()
        serializer = serializers.TeacherChoicesSetSerializer(
            Choices.objects.filter(teacher=teacher).order_by("choice_number"), many=True)
        return Response(serializer.data)

    @action(detail=True)
    def allotments(self, request, pk=None):
        """
        Returns the list of subjects a particular teacher has been alloted
        alongwith their LTP hours
        """
        queryset = Allotment.objects.filter(teacher__pk=pk)
        serializer = serializers.TeacherAllotmentSetSerializer(
            queryset, many=True)
        return Response(serializer.data)
