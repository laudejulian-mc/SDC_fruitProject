"""Detection app serializers."""
from rest_framework import serializers
from .models import DetectionRecord


class DetectionRecordSerializer(serializers.ModelSerializer):
    """Full serializer for detection records."""
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = DetectionRecord
        fields = [
            "id",
            "fruit_type",
            "image",
            "image_url",
            "predicted_label",
            "confidence",
            "grade",
            "detection_method",
            "processing_time",
            "timestamp",
            "user",
        ]
        read_only_fields = [
            "id",
            "predicted_label",
            "confidence",
            "grade",
            "processing_time",
            "timestamp",
        ]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class DetectionUploadSerializer(serializers.Serializer):
    """Serializer for single image upload."""
    image = serializers.ImageField()
    fruit_type = serializers.ChoiceField(
        choices=["apple", "mango"],
        default="apple",
    )
    detection_method = serializers.ChoiceField(
        choices=["upload", "capture", "live"],
        default="upload",
    )


class BatchUploadSerializer(serializers.Serializer):
    """Serializer for batch image upload."""
    images = serializers.ListField(
        child=serializers.ImageField(),
        min_length=1,
        max_length=20,
    )


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics response."""
    total_scans = serializers.IntegerField()
    quality_distribution = serializers.DictField()
    grade_distribution = serializers.DictField()
    method_distribution = serializers.DictField()
    recent_detections = DetectionRecordSerializer(many=True)
    daily_counts = serializers.ListField()


class ReportFilterSerializer(serializers.Serializer):
    """Serializer for report filter parameters."""
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    label = serializers.ChoiceField(
        choices=["Ripe", "Unripe", "Overripe", "Rotten", ""],
        required=False,
        allow_blank=True,
    )
    grade = serializers.ChoiceField(
        choices=["Grade A", "Grade B", "Grade C", "Reject", ""],
        required=False,
        allow_blank=True,
    )
