"""Admin registration for Detection app."""
from django.contrib import admin
from .models import DetectionRecord


@admin.register(DetectionRecord)
class DetectionRecordAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "predicted_label",
        "confidence",
        "grade",
        "detection_method",
        "processing_time",
        "timestamp",
    ]
    list_filter = ["predicted_label", "grade", "detection_method"]
    search_fields = ["predicted_label"]
    readonly_fields = ["timestamp"]
