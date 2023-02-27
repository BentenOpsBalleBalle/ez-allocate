from common_models.models import Subject, Teacher
from common_models.serializers import SubjectSerializer, TeacherSerializer
from rest_framework import generics

# Create your views here.


class SubjectsListView(generics.ListAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer


class TeacherListView(generics.ListAPIView):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
