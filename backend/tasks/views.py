from abc import ABC, abstractmethod
from typing import Union

from celery import Task
from celery.local import PromiseProxy
from celery.result import AsyncResult
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

import tasks.tasks as celery_tasks

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
        pass
