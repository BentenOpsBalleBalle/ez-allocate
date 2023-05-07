from typing import List

import tasks.views as celery_task_views
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from tasks.views import AbstractCeleryTaskViewSet

router = DefaultRouter()

# Celery tasks registration
# to add more tasks, just add their viewsets in this list
enabled_viewsets: List[AbstractCeleryTaskViewSet] = [
    celery_task_views.ExportAllotmentsToCSVViewSet,
    celery_task_views.ExportAllotmentsTeacherSideToCSVViewSet,
]
for task_viewset in enabled_viewsets:
    task_name = task_viewset().task_name
    router.register(
        task_name,
        task_viewset,
        basename=f"tasks-{task_name}",
    )

urlpatterns = [
    path("", include(router.urls)),
]
