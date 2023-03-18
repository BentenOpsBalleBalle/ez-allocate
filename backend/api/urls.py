from api import views
from django.urls import include, path
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"subjects", views.SubjectViewSet, basename="subjects")
router.register(r"teachers", views.TeacherViewSet, basename="teachers")
router.register(r"search", views.SearchViewSet, basename="search")

urlpatterns = [
    path("", include(router.urls)),
]
