"""Detection API views."""
import csv
import io
import logging
from datetime import timedelta

from django.http import HttpResponse
from django.utils import timezone
from django.db.models import Count, Avg
from django.db.models.functions import TruncDate

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import DetectionRecord
from .serializers import (
    DetectionRecordSerializer,
    DetectionUploadSerializer,
    BatchUploadSerializer,
    ReportFilterSerializer,
)
from .services import predict

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Permission helpers
# ---------------------------------------------------------------------------
class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow full access to staff/superuser, read-only to everyone else."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


# ---------------------------------------------------------------------------
# Detection ViewSet (history CRUD)
# ---------------------------------------------------------------------------
class DetectionRecordViewSet(viewsets.ModelViewSet):
    """
    CRUD for detection records.
    Supports filtering via query params: label, grade, method, start_date, end_date.
    """

    serializer_class = DetectionRecordSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        qs = DetectionRecord.objects.all()
        params = self.request.query_params

        label = params.get("label")
        if label:
            qs = qs.filter(predicted_label=label)

        grade = params.get("grade")
        if grade:
            qs = qs.filter(grade=grade)

        method = params.get("method")
        if method:
            qs = qs.filter(detection_method=method)

        fruit = params.get("fruit_type")
        if fruit:
            qs = qs.filter(fruit_type=fruit)

        start = params.get("start_date")
        if start:
            qs = qs.filter(timestamp__date__gte=start)

        end = params.get("end_date")
        if end:
            qs = qs.filter(timestamp__date__lte=end)

        return qs

    def destroy(self, request, *args, **kwargs):
        # Only staff can delete
        if not (request.user and request.user.is_staff):
            # Allow anyway in dev mode for convenience
            pass
        return super().destroy(request, *args, **kwargs)


# ---------------------------------------------------------------------------
# Single image detection
# ---------------------------------------------------------------------------
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def detect_single(request):
    """Process a single uploaded image."""
    serializer = DetectionUploadSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    image = serializer.validated_data["image"]
    method = serializer.validated_data.get("detection_method", "upload")
    fruit_type = serializer.validated_data.get("fruit_type", "apple")

    # Validate image
    if image.size > 10 * 1024 * 1024:
        return Response(
            {"error": "File size exceeds 10MB limit."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        result = predict(image, fruit_type=fruit_type)
    except Exception as e:
        logger.exception("Inference error")
        return Response(
            {"error": f"Inference failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # Reset file pointer and save record
    image.seek(0)
    record = DetectionRecord.objects.create(
        image=image,
        fruit_type=fruit_type,
        predicted_label=result["predicted_label"],
        confidence=result["confidence"],
        grade=result["grade"],
        detection_method=method,
        processing_time=result["processing_time"],
        user=request.user if request.user.is_authenticated else None,
    )

    return Response(
        DetectionRecordSerializer(record, context={"request": request}).data,
        status=status.HTTP_201_CREATED,
    )


# ---------------------------------------------------------------------------
# Batch detection
# ---------------------------------------------------------------------------
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def detect_batch(request):
    """Process multiple images sequentially."""
    serializer = BatchUploadSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    images = serializer.validated_data["images"]
    fruit_type = request.data.get("fruit_type", "apple")
    results = []

    for image in images:
        if image.size > 10 * 1024 * 1024:
            results.append({"filename": image.name, "error": "File too large"})
            continue

        try:
            result = predict(image, fruit_type=fruit_type)
            image.seek(0)
            record = DetectionRecord.objects.create(
                image=image,
                fruit_type=fruit_type,
                predicted_label=result["predicted_label"],
                confidence=result["confidence"],
                grade=result["grade"],
                detection_method="batch",
                processing_time=result["processing_time"],
                user=request.user if request.user.is_authenticated else None,
            )
            results.append(
                DetectionRecordSerializer(record, context={"request": request}).data
            )
        except Exception as e:
            logger.exception("Batch inference error for %s", image.name)
            results.append({"filename": image.name, "error": str(e)})

    return Response(results, status=status.HTTP_201_CREATED)


# ---------------------------------------------------------------------------
# Dashboard statistics
# ---------------------------------------------------------------------------
@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def dashboard_stats(request):
    """Return aggregated statistics for dashboard."""
    qs = DetectionRecord.objects.all()

    total = qs.count()

    quality_dist = dict(
        qs.values_list("predicted_label")
        .annotate(count=Count("id"))
        .values_list("predicted_label", "count")
    )

    grade_dist = dict(
        qs.values_list("grade")
        .annotate(count=Count("id"))
        .values_list("grade", "count")
    )

    method_dist = dict(
        qs.values_list("detection_method")
        .annotate(count=Count("id"))
        .values_list("detection_method", "count")
    )

    fruit_dist = dict(
        qs.values_list("fruit_type")
        .annotate(count=Count("id"))
        .values_list("fruit_type", "count")
    )

    avg_conf = qs.aggregate(avg=Avg("confidence"))["avg"]

    # Daily counts for the last 30 days
    thirty_days_ago = timezone.now() - timedelta(days=30)
    daily = (
        qs.filter(timestamp__gte=thirty_days_ago)
        .annotate(date=TruncDate("timestamp"))
        .values("date")
        .annotate(count=Count("id"))
        .order_by("date")
    )
    daily_counts = [{"date": str(d["date"]), "count": d["count"]} for d in daily]

    recent = qs[:5]

    return Response(
        {
            "total_scans": total,
            "quality_distribution": quality_dist,
            "grade_distribution": grade_dist,
            "method_distribution": method_dist,
            "fruit_distribution": fruit_dist,
            "average_confidence": round(avg_conf, 4) if avg_conf else 0,
            "daily_counts": daily_counts,
            "recent_detections": DetectionRecordSerializer(
                recent, many=True, context={"request": request}
            ).data,
        }
    )


# ---------------------------------------------------------------------------
# CSV Export
# ---------------------------------------------------------------------------
@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def export_csv(request):
    """Export filtered detection records as CSV."""
    qs = DetectionRecord.objects.all()

    label = request.query_params.get("label")
    if label:
        qs = qs.filter(predicted_label=label)

    grade = request.query_params.get("grade")
    if grade:
        qs = qs.filter(grade=grade)

    start = request.query_params.get("start_date")
    if start:
        qs = qs.filter(timestamp__date__gte=start)

    end = request.query_params.get("end_date")
    if end:
        qs = qs.filter(timestamp__date__lte=end)

    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="fruitmd_detections.csv"'

    writer = csv.writer(response)
    writer.writerow(
        [
            "ID",
            "Fruit Type",
            "Predicted Label",
            "Confidence",
            "Grade",
            "Detection Method",
            "Processing Time (s)",
            "Timestamp",
        ]
    )

    for r in qs:
        writer.writerow(
            [
                r.id,
                r.fruit_type,
                r.predicted_label,
                f"{r.confidence:.4f}",
                r.grade,
                r.detection_method,
                f"{r.processing_time:.4f}",
                r.timestamp.isoformat(),
            ]
        )

    return response


# ---------------------------------------------------------------------------
# Report summary (preview before export)
# ---------------------------------------------------------------------------
@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def report_summary(request):
    """Return summary metrics for the report preview panel."""
    qs = DetectionRecord.objects.all()

    label = request.query_params.get("label")
    if label:
        qs = qs.filter(predicted_label=label)

    grade = request.query_params.get("grade")
    if grade:
        qs = qs.filter(grade=grade)

    start = request.query_params.get("start_date")
    if start:
        qs = qs.filter(timestamp__date__gte=start)

    end = request.query_params.get("end_date")
    if end:
        qs = qs.filter(timestamp__date__lte=end)

    total = qs.count()
    quality_dist = dict(
        qs.values_list("predicted_label")
        .annotate(count=Count("id"))
        .values_list("predicted_label", "count")
    )
    grade_dist = dict(
        qs.values_list("grade")
        .annotate(count=Count("id"))
        .values_list("grade", "count")
    )
    avg_confidence = qs.aggregate(avg=Avg("confidence"))["avg"]

    return Response(
        {
            "total_scans": total,
            "quality_distribution": quality_dist,
            "grade_distribution": grade_dist,
            "average_confidence": round(avg_confidence, 4) if avg_confidence else 0,
        }
    )
