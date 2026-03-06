from django.conf import settings
from django.db import models


class Detection(models.Model):
    CONDITION_FRESH = "Fresh"
    CONDITION_BRUISED = "Bruised"
    CONDITION_ROTTEN = "Rotten"

    CONDITION_CHOICES = (
        (CONDITION_FRESH, "Fresh"),
        (CONDITION_BRUISED, "Bruised"),
        (CONDITION_ROTTEN, "Rotten"),
    )

    GRADE_A = "A"
    GRADE_B = "B"
    GRADE_C = "C"
    GRADE_REJECT = "Reject"

    GRADE_CHOICES = (
        (GRADE_A, "A"),
        (GRADE_B, "B"),
        (GRADE_C, "C"),
        (GRADE_REJECT, "Reject"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    image = models.ImageField(upload_to="detections/%Y/%m/%d/")
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    confidence = models.FloatField()
    grade = models.CharField(max_length=10, choices=GRADE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Detection #{self.pk} - {self.condition} ({self.confidence:.2f})"


class AppSettings(models.Model):
    confidence_threshold = models.FloatField(default=0.25)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "App Settings"
        verbose_name_plural = "App Settings"

    def __str__(self):
        return f"AppSettings(threshold={self.confidence_threshold})"

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(
            pk=1,
            defaults={"confidence_threshold": getattr(settings, "DETECTION_DEFAULT_CONFIDENCE_THRESHOLD", 0.25)},
        )
        return obj
