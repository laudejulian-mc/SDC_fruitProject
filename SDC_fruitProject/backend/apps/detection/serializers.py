from django.contrib.auth.models import User
from PIL import Image
from rest_framework import serializers

from .models import AppSettings, Detection


class DetectionUploadSerializer(serializers.Serializer):
    image = serializers.ImageField()

    def validate_image(self, image):
        if image.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("Image size must be <= 10MB.")

        allowed = {"jpeg", "jpg", "png", "webp"}
        image_name = (image.name or "").lower()
        ext = image_name.rsplit(".", 1)[-1] if "." in image_name else ""
        if ext not in allowed:
            raise serializers.ValidationError("Invalid image format. Use JPG, PNG, or WEBP.")

        try:
            img = Image.open(image)
            img.verify()
            image.seek(0)
        except Exception:
            raise serializers.ValidationError("Invalid image file.")

        return image


class DetectionSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Detection
        fields = (
            "id",
            "condition",
            "confidence",
            "grade",
            "created_at",
            "image_url",
        )

    def get_image_url(self, obj):
        request = self.context.get("request")
        if not obj.image:
            return None
        if request is None:
            return obj.image.url
        return request.build_absolute_uri(obj.image.url)


class DashboardSerializer(serializers.Serializer):
    total_scanned = serializers.IntegerField()
    fresh_count = serializers.IntegerField()
    defective_count = serializers.IntegerField()
    grade_distribution = serializers.DictField(child=serializers.IntegerField())
    daily_detection_counts = serializers.ListField(child=serializers.DictField())


class AppSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppSettings
        fields = ("confidence_threshold", "updated_at")

    def validate_confidence_threshold(self, value):
        if value < 0.0 or value > 1.0:
            raise serializers.ValidationError("confidence_threshold must be between 0.0 and 1.0")
        return value
