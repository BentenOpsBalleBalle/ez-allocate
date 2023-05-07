from typing import Union

from common_models import serializers
from common_models.models import (Allotment, CeleryFileResults, Choices, Subject, Teacher)
from django.db.models import Q
from django.http import Http404
from django.shortcuts import get_object_or_404
from django_filters import rest_framework as filters
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import (OpenApiParameter, extend_schema, inline_serializer)
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, authentication_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.request import Request
from rest_framework.response import Response

from .auth import JWTAuth
from .filters import SubjectFilter

# Create your views here.


class CustomPagination(PageNumberPagination):
    page_size = 8


class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    authentication_classes = [JWTAuth]
    queryset = Subject.objects.all()
    serializer_class = serializers.SubjectSerializer
    pagination_class = CustomPagination
    filter_backends = (filters.DjangoFilterBackend, )
    filterset_class = SubjectFilter

    @extend_schema(responses={200: serializers.SubjectListSerializer})
    def list(self, request, *args, **kwargs):
        # TODO: add pagination
        old = self.serializer_class
        self.serializer_class = serializers.SubjectListSerializer

        response = super().list(request, *args, **kwargs)

        self.serializer_class = old
        return response

    @extend_schema(
        responses={
            200: (
                filter_choices_serializer := inline_serializer(
                    name="CourseTypeOptions",
                    fields={
                        "name": serializers.serializers.CharField(),
                        "param_value": serializers.serializers.CharField(max_length=4)
                    },
                    many=True
                )
            )
        }
    )
    @action(detail=False, pagination_class=None, filterset_class=None)
    def get_course_type_choices(self, request):
        """
        Returns the available `course_type` choices
        """
        return Response(
            [dict(zip(('param_value', 'name'), i)) for i in Subject.CourseType.choices]
        )

    @extend_schema(responses={200: filter_choices_serializer})
    @action(detail=False, pagination_class=None, filterset_class=None)
    def get_programme_choices(self, request):
        """
        Returns all the available `programme` choices based on database entries
        """
        return Response(
            [dict(zip(('param_value', 'name'), (i, i))) for i in SubjectFilter._choices]
        )

    @extend_schema(responses={200: serializers.SubjectChoicesSetSerializer(many=True)})
    @action(detail=True, pagination_class=None, filterset_class=None)
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
        pagination_class=None,
        filterset_class=None
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
            # also delete allotment if it exists
            try:
                self.commit_ltp_delete(request, pk=pk, teacher_id=teacher)
            except Http404:
                pass

        return self.choices(request, pk=pk)

    @extend_schema(responses={200: serializers.SubjectAllotmentSetSerializer})
    @action(detail=True, pagination_class=None, filterset_class=None)
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
    @action(detail=True, methods=["POST"], pagination_class=None, filterset_class=None)
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

        serializer.update_or_save()

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
        pagination_class=None,
        filterset_class=None
    )
    def commit_ltp_delete(self, request, pk=None, teacher_id=None):
        allottment_instance = get_object_or_404(
            Allotment, subject__pk=pk, teacher__pk=teacher_id
        )
        allottment_instance.delete()
        return self.allotments(request, pk=pk)


class TeacherViewSet(viewsets.ReadOnlyModelViewSet):
    authentication_classes = [JWTAuth]
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


class SearchViewSet(viewsets.ViewSet):
    """
    This viewset provides a search API for teachers and subjects models
    """
    authentication_classes = [JWTAuth]

    def __search(self, model: Union[Teacher, Subject], query="", fields=[], limit=10):
        """
        An internal abstracted method that provides the filter based on the fields
        to search on and returns the query result

        search is done using `icontains` filter and OR-ed with all the other
        fields provided
        """
        q_args = []
        for field in fields:
            q = Q(**{field + "__icontains": query})
            if not q_args:
                q_args.append(q)
            else:
                q_args[0] |= q  # OR-ing the Q() object conditions

        return model.objects.filter(*[q_args[0]])[:limit]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='q',
                description='the search query',
                required=True,
                type=str,
                location="query"
            )
        ],
        responses=serializers.SubjectListSerializer(many=True)
    )
    @action(detail=False)
    def subjects(self, request):
        """
        returns a set of results on subjects that match the query provided.

        Searches over the fields: `name`, `course_code`
        """
        query = request.query_params.get("q", "")
        data = self.__search(model=Subject, query=query, fields=["name", "course_code"])
        serializer = serializers.SubjectListSerializer(data, many=True)
        return Response(serializer.data)

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='q',
                description='the search query',
                required=True,
                type=str,
            )
        ],
        responses=serializers.TeacherSerializer(many=True)
    )
    @action(detail=False)
    def teachers(self, request):
        """
        returns a set of results on teachers that match the query provided.

        Searches over the fields: `name`, `email`
        """
        query = request.query_params.get("q", "")
        data = self.__search(Teacher, query, ["name", "email"], limit=None)
        sorted_by_remaining = data.prefetch_related('allotment_set').order_by(
            'allotment__allotted_lecture_hours',
            'allotment__allotted_tutorial_hours',
            'allotment__allotted_practical_hours',
        )[:10]
        serializer = serializers.TeacherSerializer(sorted_by_remaining, many=True)
        return Response(serializer.data)


class FileResultsViewSet(viewsets.ReadOnlyModelViewSet):
    authentication_classes = [JWTAuth]
    queryset = CeleryFileResults.objects.all()
    serializer_class = serializers.CeleryFileResultsSerializer

    @extend_schema(
        responses={
            (200, 'text/csv'): OpenApiTypes.BINARY,
        },
    )
    @action(detail=True)
    def download(self, request, pk=None):
        """
        returns the binary content of the file (assuming default of csv)
        """
        file: CeleryFileResults = self.get_object()

        file.has_been_downloaded_yet = True
        file.save()

        response = Response(
            headers={
                "Content-Disposition": f"attachment; filename={file.filename}",
                "Content-Type": "text/csv; charset=utf-8"
            }
        )
        response.content = file.file

        return response
