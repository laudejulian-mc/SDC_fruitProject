"""Detection app models."""
from django.db import models
from django.contrib.auth.models import User


class DetectionRecord(models.Model):
    """Stores each fruit quality detection result."""

    FRUIT_TYPES = [
        ("apple", "Apple"),
        ("orange", "Orange"),
        ("mango", "Mango"),
        ("grapes", "Grapes"),
        ("banana", "Banana"),
    ]

    DETECTION_METHODS = [
        ("upload", "Single Upload"),
        ("batch", "Batch Upload"),
        ("live", "Live Detection"),
        ("capture", "Manual Capture"),
    ]

    LABEL_CHOICES = [
        ("Fresh", "Fresh"),
        ("Rotten", "Rotten"),
    ]

    GRADE_CHOICES = [
        ("Grade A", "Grade A"),
        ("Grade B", "Grade B"),
        ("Grade C", "Grade C"),
        ("Reject", "Reject"),
    ]

    fruit_type = models.CharField(max_length=10, choices=FRUIT_TYPES, default="apple")
    image = models.ImageField(upload_to="detections/%Y/%m/%d/")
    predicted_label = models.CharField(max_length=20, choices=LABEL_CHOICES)
    confidence = models.FloatField(help_text="Confidence score 0-1")
    grade = models.CharField(max_length=10, choices=GRADE_CHOICES)
    detection_method = models.CharField(max_length=10, choices=DETECTION_METHODS)
    processing_time = models.FloatField(help_text="Processing time in seconds")
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="detections"
    )

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["predicted_label"]),
            models.Index(fields=["grade"]),
            models.Index(fields=["detection_method"]),
            models.Index(fields=["fruit_type"]),
        ]

    def __str__(self):
        return f"[{self.fruit_type}] {self.predicted_label} ({self.confidence:.1%}) - {self.timestamp:%Y-%m-%d %H:%M}"
