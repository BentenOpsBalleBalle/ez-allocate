from common_models import serializers
from common_models.models import Subject, Teacher
from rest_framework import generics, viewsets

# Create your views here.


class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = serializers.SubjectSerializer

    def list(self, request, *args, **kwargs):
        old = self.serializer_class
        self.serializer_class = serializers.SubjectListSerializer

        response = super().list(request, *args, **kwargs)

        self.serializer_class = old
        return response


class SubjectsListView(generics.ListAPIView):
    queryset = Subject.objects.all()
    serializer_class = serializers.SubjectSerializer


class TeacherListView(generics.ListAPIView):
    queryset = Teacher.objects.all()
    serializer_class = serializers.TeacherSerializer
