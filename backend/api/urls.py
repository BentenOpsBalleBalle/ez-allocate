from api import views
from django.urls import include, path
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"subjects", views.SubjectViewSet, basename="subjects")

urlpatterns = [
    path("", include(router.urls)),
    # path("subjects/", views.SubjectsListView.as_view()),
    path("teachers/", views.TeacherListView.as_view()),
]
