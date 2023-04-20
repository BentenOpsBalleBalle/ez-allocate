from abc import ABC, abstractmethod
from typing import Union

import tasks.tasks as celery_tasks
from celery import Task
from celery.local import PromiseProxy
from celery.result import AsyncResult
from common_models.models import CeleryFileResults
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

task_status_serializer = inline_serializer(
    name="CeleryTaskStatusResponse",
    fields={
        "task_id":
        serializers.UUIDField(),
        "status":
        serializers.ChoiceField(
            choices=["SUCCESS", "FAILURE", "RETRY", "STARTED", "PENDING"]
        )
    }
)
task_not_found_serializer = inline_serializer(
    name="TaskNotFoundResponse", fields={"msg": serializers.CharField()}
)

# https://ihateregex.io/expr/uuid/
TASK_ID_PARAM = r"?P<task_id>[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}"


class AbstractCeleryTaskViewSet(viewsets.GenericViewSet, ABC):
    """
    This abstract viewset provides a common interface for future celery tasks to
    implement so they only implement how to create the specific task and how to
    fetch it's results
    """
    # TODO: store the Asyncresult in a property

    @property
    @abstractmethod
    def task(self) -> Union[PromiseProxy, Task]:  # https://stackoverflow.com/q/63714223
        """
        define the celery task that will be used throughout the viewset and is
        also associated with

        example:
            def task(self):
                return tasks.export_to_csv_v1
        """
        pass

    @property
    def task_name(self) -> str:
        """
        Task name will be used to verify that the provided task id corresponds
        with the task it was started from. and also in the url routes
        """
        return self.task.__name__

    @abstractmethod
    def start_task(self, *args, **kwargs) -> AsyncResult:
        """
        This method is responsible for initiating/calling the task.

        returns the AsyncResult object so the calling methods can handle cases
        when task is PENDING or complete
        """
        pass

    @abstractmethod
    def get_result(self, task_id: str) -> Response:
        """
        given a `task_id` this method is responsible for fetching the result,
        doing other db transactions and creating and returning a Response
        """
        pass

    @extend_schema(responses={200: task_status_serializer, 404: task_not_found_serializer})
    @action(detail=False, url_path=f"status/({TASK_ID_PARAM})")
    def status(self, request, task_id=None, bypass_verification=False):
        """
        Returns the status of the passed in task id
        """
        if bypass_verification is False and (
            self.__assert_id_belongs_to_task(task_id) is False
        ):
            return Response(
                {"msg": f"this task id is not valid for '{self.task_name}' task"},
                status=status.HTTP_404_NOT_FOUND
            )

        result = AsyncResult(task_id)
        return Response({
            "task_id": result.id,
            "status": result.state,
        })

    @extend_schema(description="creates a task instance and returns its id")
    @extend_schema(responses={200: task_status_serializer})
    @action(detail=False)
    def create_task(self, request, *args, **kwargs):
        """
        This method will be inherited by all the child viewsets and is
        responsible for creating a task and returning the task's id to the
        client
        """
        # TODO: in future prevent the same user from creating the task if that
        # task is already created and not completed
        result = self.start_task(*args, **kwargs)
        return self.status(request, result.task_id)

    @action(detail=False, url_path=f"results/({TASK_ID_PARAM})")
    def results(self, request, task_id=None):
        """
        This method will be used to call the get_result of child classes.
            - if the task is in progress, a `202` code will be returned along
              with the task's status,
            - if the result is ready then the response object will be sent
              verbatim

        in order to specify the custom response schema for spectacular, it is
        reccommended for child classes to override this method and call the
        super method but specify the documentation there
        """
        if self.__assert_id_belongs_to_task(task_id) is not True:
            response = self.status(request, task_id, bypass_verification=True)
            response.status_code = 202
            return response

        return self.get_result(task_id)

    def __assert_id_belongs_to_task(self, task_id):
        """
        Asserts that the given task id is associated with the current celery
        function

        Sometimes when the task state is PENDING, we dont know if the id is a
        legit task or not. In that case we'll let respond with None.
        """
        result = AsyncResult(task_id)
        if result.name is None:
            return None
        return result.name.endswith(self.task_name)


class ExportAllotmentsToCSVViewSet(AbstractCeleryTaskViewSet):

    @property
    def task(self) -> Union[PromiseProxy, Task]:
        return celery_tasks.export_allotments_csv

    def start_task(self, *args, **kwargs) -> AsyncResult:
        return self.task.delay()

    @extend_schema(
        description="this endpoint fetches the result for the task"
        " and returns it. If the task is in progress, returns its status"
    )
    @extend_schema(
        responses={
            (200, 'text/csv'): OpenApiTypes.BINARY,
            202: task_status_serializer
        },
    )
    @action(detail=False, url_path=f"results/({TASK_ID_PARAM})")
    def results(self, request, task_id=None):
        return super().results(request, task_id)

    def get_result(self, task_id: str) -> Response:
        result = AsyncResult(task_id)
        file_id = result.result
        file = CeleryFileResults.objects.get(id=file_id)
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


class ExportAllotmentsTeacherSideToCSVViewSet(ExportAllotmentsToCSVViewSet):
    # OOP magik :)
    # i love OOP, when it works the intended way :)))))
    @property
    def task(self) -> Union[PromiseProxy, Task]:
        return celery_tasks.export_teacher_allotments_csv
