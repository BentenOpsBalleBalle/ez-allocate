from common_models import serializers
from common_models.models import Allotment, Choices, Subject, Teacher
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.request import Request
from rest_framework.response import Response

# Create your views here.


class CustomPagination(PageNumberPagination):
    page_size = 8


class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = serializers.SubjectSerializer
    pagination_class = CustomPagination

    @extend_schema(responses={200: serializers.SubjectListSerializer})
    def list(self, request, *args, **kwargs):
        # TODO: add pagination
        old = self.serializer_class
        self.serializer_class = serializers.SubjectListSerializer

        response = super().list(request, *args, **kwargs)

        self.serializer_class = old
        return response

    @extend_schema(responses={200: serializers.SubjectChoicesSetSerializer(many=True)})
    @action(detail=True, pagination_class=None)
    def choices(self, request, pk=None):
        """
        Returns the list of teachers that have selected the current subject
        in their preferences, sorted by `choice_number`
        """
        subject: Subject = self.get_object()
        serializer = serializers.SubjectChoicesSetSerializer(
            subject.choices_set.all().order_by("choice_number"), many=True
        )
        return Response(serializer.data)

    @extend_schema(
        description="adds a teacher into a subject's choices manually. raises a `400`"
        " response if the teacher is already added in the set",
        request=None,
        methods=["POST"]
    )
    @extend_schema(
        description="Deletes a manually added teacher from the choices set",
        methods=["DELETE"]
    )
    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='teacher',
                description='the Teacher\'s id',
                required=True,
                type=int,
                location="path"
            )
        ],
        responses={200: serializers.SubjectChoicesSetSerializer(many=True)}
    )
    @action(
        detail=True,
        methods=["POST", "DELETE"],
        url_path=r'choices/modify/(?P<teacher>\w+)',
        pagination_class=None
    )
    def choices_modify(self, request: Request, pk=None, teacher=None):
        subject = self.get_object()

        if request.method == "POST":
            serializer = serializers.SubjectChoicesPOSTSerializer(
                data={
                    'teacher': teacher,
                    'subject': subject.id
                }
            )
            serializer.is_valid(raise_exception=True)
            instance = Choices.objects.create(
                teacher=serializer.validated_data["teacher"],
                subject=subject,
                choice_number=serializer.validated_data["choice_number"]
            )
            instance.save()

        elif request.method == "DELETE":
            instance = get_object_or_404(Choices, teacher__pk=teacher, subject__pk=pk)
            if instance.manually_added is False:
                return Response(
                    "cannot remove a teacher that is not manually added",
                    status=status.HTTP_403_FORBIDDEN
                )
            instance.delete()

        return self.choices(request, pk=pk)

    @extend_schema(responses={200: serializers.SubjectAllotmentSetSerializer})
    @action(detail=True, pagination_class=None)
    def allotments(self, request, pk=None):
        """
        Returns the list of teachers that have been allotted to the current subject
        alongwith the LTP hours
        """
        queryset = Allotment.objects.filter(subject__pk=pk)
        serialzer = serializers.SubjectAllotmentSetSerializer(queryset, many=True)
        return Response(serialzer.data)

    @extend_schema(
        request=serializers.CommitLTPSerializer,
        responses={200: serializers.SubjectAllotmentSetSerializer(many=True)}
    )
    @action(detail=True, methods=["POST"], pagination_class=None)
    def commit_ltp(self, request, pk=None):
        """
        modifies the allotment entries for the given subject
        """
        # fix for unit tests. for some reason dict is passed instead of QueryDict
        if isinstance(request.data, dict):
            data = request.data.copy()
        else:
            data = request.data.dict()
        data['subject'] = pk
        serializer = serializers.CommitLTPSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        if serializer.is_empty_allotment():
            return self.commit_ltp_delete(
                request, pk, teacher_id=serializer.data["teacher"]
            )

        serializer.save()

        return self.allotments(request, pk=pk)

    @extend_schema(
        description="Removes the `teacher_id`'s allotment entry, if found",
        parameters=[
            OpenApiParameter(
                name='teacher_id',
                description='the Teacher\'s id',
                required=True,
                type=int,
                location="path"
            )
        ],
        responses={
            200: serializers.SubjectChoicesSetSerializer(many=True),
            404: None
        },
        methods=["DELETE"]
    )
    @action(
        detail=True,
        methods=["DELETE"],
        url_path=r"commit_ltp/(?P<teacher_id>\w+)",
        pagination_class=None
    )
    def commit_ltp_delete(self, request, pk=None, teacher_id=None):
        allottment_instance = get_object_or_404(
            Allotment, subject__pk=pk, teacher__pk=teacher_id
        )
        allottment_instance.delete()
        return self.allotments(request, pk=pk)


class TeacherViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = serializers.TeacherSerializer
    pagination_class = CustomPagination

    @extend_schema(responses={200: serializers.TeacherChoicesSetSerializer})
    @action(detail=True)
    def choices(self, request, pk=None):
        """
        Returns the list of subjects that have been chosen by the current
        teacher, sorted by `choice_number`
        """
        teacher: Teacher = self.get_object()
        serializer = serializers.TeacherChoicesSetSerializer(
            Choices.objects.filter(teacher=teacher).order_by("choice_number"), many=True
        )
        return Response(serializer.data)

    @extend_schema(responses={200: serializers.TeacherAllotmentSetSerializer})
    @action(detail=True)
    def allotments(self, request, pk=None):
        """
        Returns the list of subjects a particular teacher has been alloted
        alongwith their LTP hours
        """
        queryset = Allotment.objects.filter(teacher__pk=pk)
        serializer = serializers.TeacherAllotmentSetSerializer(queryset, many=True)
        return Response(serializer.data)
