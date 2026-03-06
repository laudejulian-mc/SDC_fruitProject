from django.contrib import admin

from .models import AppSettings, Detection


@admin.register(Detection)
class DetectionAdmin(admin.ModelAdmin):
    list_display = ("id", "condition", "confidence", "grade", "created_at", "user")
    list_filter = ("condition", "grade", "created_at")
    search_fields = ("id", "condition", "grade", "user__username")


@admin.register(AppSettings)
class AppSettingsAdmin(admin.ModelAdmin):
    list_display = ("id", "confidence_threshold", "updated_at")
