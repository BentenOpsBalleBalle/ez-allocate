from django.contrib import admin

from .models import Allotment, CeleryFileResults, Choices, Subject, Teacher

# Register your models here.
admin.site.register(Allotment)
admin.site.register(CeleryFileResults)
admin.site.register(Choices)
admin.site.register(Subject)
admin.site.register(Teacher)
