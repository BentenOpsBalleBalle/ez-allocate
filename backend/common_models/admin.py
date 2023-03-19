from django.contrib import admin

from .models import Allotment, Choices, Subject, Teacher

# Register your models here.
admin.site.register(Allotment)
admin.site.register(Choices)
admin.site.register(Subject)
admin.site.register(Teacher)
