from django.apps import AppConfig


class DetectionConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.detection"

    def ready(self):
        try:
            from .services import warmup_model
            warmup_model()
        except Exception:
            pass
