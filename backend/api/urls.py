from api import views
from django.urls import path

urlpatterns = [
    path("subjects/", views.SubjectsListView.as_view()),
    path("teachers/", views.TeacherListView.as_view())
]
