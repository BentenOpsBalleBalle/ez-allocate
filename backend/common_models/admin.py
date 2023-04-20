from django.contrib import admin

from .models import Allotment, CeleryFileResults, Choices, Subject, Teacher


class CeleryFileResultAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'filename',
        'file_size',
        'created_at',
        'has_been_downloaded_yet',
    )

    date_hierarchy = "created_at"
    readonly_fields = [
        "file",
        "created_at",
    ]

    def file_size(self, obj):
        return len(obj.file)


# Register your models here.
admin.site.register(Allotment)
admin.site.register(CeleryFileResults, CeleryFileResultAdmin)
admin.site.register(Choices)
admin.site.register(Subject)
admin.site.register(Teacher)
