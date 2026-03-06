from datetime import timedelta
import time

from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from config.responses import api_error, api_success
from .models import AppSettings, Detection
from .serializers import AppSettingsSerializer, DetectionSerializer, DetectionUploadSerializer
from .services import DetectionServiceError, run_inference


class DetectionPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class DetectAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser]

    def post(self, request):
        serializer = DetectionUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        image = serializer.validated_data["image"]
        app_settings = AppSettings.get_solo()
        detection_method = request.data.get("detection_method", "upload")
        fruit_type = request.data.get("fruit_type", "apple")
        started = time.perf_counter()

        current_user = request.user if getattr(request.user, "is_authenticated", False) else None

        detection = Detection.objects.create(
            user=current_user,
            image=image,
            condition=Detection.CONDITION_BRUISED,
            confidence=0.0,
            grade=Detection.GRADE_REJECT,
        )

        try:
            inference = run_inference(
                image_path=detection.image.path,
                confidence_threshold=app_settings.confidence_threshold,
            )
        except DetectionServiceError as exc:
            detection.delete()
            return api_error(message=str(exc), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if inference is None:
            detection.delete()
            return api_error(
                message="No apple detected in image.",
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        detection.condition = inference["condition"]
        detection.confidence = inference["confidence"]
        detection.grade = inference["grade"]
        detection.save(update_fields=["condition", "confidence", "grade"])

        elapsed = round(time.perf_counter() - started, 3)

        grade_map = {
            "A": "Grade A",
            "B": "Grade B",
            "C": "Grade C",
            "Reject": "Reject",
        }

        payload = {
            "id": detection.id,
            "predicted_label": inference.get("predicted_label", detection.condition),
            "confidence": detection.confidence,
            "grade": grade_map.get(detection.grade, detection.grade),
            "timestamp": detection.created_at.isoformat(),
            "image_url": request.build_absolute_uri(detection.image.url) if detection.image else None,
            "processing_time": elapsed,
            "detection_method": detection_method,
            "fruit_type": fruit_type,
        }
        return Response(payload, status=status.HTTP_201_CREATED)


class DashboardAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Detection.objects.all()

        total_scanned = qs.count()
        fresh_count = qs.filter(condition=Detection.CONDITION_FRESH).count()
        defective_count = qs.exclude(condition=Detection.CONDITION_FRESH).count()

        grade_distribution_qs = qs.values("grade").annotate(count=Count("id"))
        grade_distribution = {item["grade"]: item["count"] for item in grade_distribution_qs}

        start_date = timezone.now().date() - timedelta(days=29)
        daily_qs = (
            qs.filter(created_at__date__gte=start_date)
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )
        daily_detection_counts = [
            {"date": row["day"].isoformat(), "count": row["count"]}
            for row in daily_qs
        ]

        data = {
            "total_scanned": total_scanned,
            "fresh_count": fresh_count,
            "defective_count": defective_count,
            "grade_distribution": grade_distribution,
            "daily_detection_counts": daily_detection_counts,
        }
        return api_success(data=data, message="Dashboard statistics fetched")


class DetectionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DetectionSerializer
    pagination_class = DetectionPagination

    def get_queryset(self):
        queryset = Detection.objects.all().order_by("-created_at")

        search = self.request.query_params.get("search")
        grade = self.request.query_params.get("grade")
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        if grade:
            queryset = queryset.filter(grade__iexact=grade)

        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)

        if search:
            id_filter = Q()
            if str(search).isdigit():
                id_filter = Q(id=int(search))

            queryset = queryset.filter(
                Q(condition__icontains=search)
                | Q(grade__icontains=search)
                | Q(user__username__icontains=search)
                | id_filter
            )

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True, context={"request": request})

        return api_success(
            data={
                "count": self.paginator.page.paginator.count,
                "next": self.paginator.get_next_link(),
                "previous": self.paginator.get_previous_link(),
                "results": serializer.data,
            },
            message="Detection history fetched",
        )

    @action(detail=False, methods=["get"], url_path="latest")
    def latest(self, request):
        latest_obj = self.get_queryset().first()
        if latest_obj is None:
            return api_success(data=None, message="No detections available")

        payload = self.get_serializer(latest_obj, context={"request": request}).data
        return api_success(data=payload, message="Latest detection fetched")


class AppSettingsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        settings_obj = AppSettings.get_solo()
        serializer = AppSettingsSerializer(settings_obj)
        return api_success(data=serializer.data, message="Settings fetched")

    def post(self, request):
        settings_obj = AppSettings.get_solo()
        serializer = AppSettingsSerializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return api_success(data=serializer.data, message="Settings updated")
