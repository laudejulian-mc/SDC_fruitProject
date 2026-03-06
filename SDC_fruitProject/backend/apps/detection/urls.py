from django.urls import include, re_path
from rest_framework.routers import DefaultRouter

from .views import AppSettingsAPIView, DashboardAPIView, DetectAPIView, DetectionViewSet

router = DefaultRouter()
router.trailing_slash = "/?"
router.register("detections", DetectionViewSet, basename="detections")

urlpatterns = [
    re_path(r"^detect/?$", DetectAPIView.as_view(), name="detect"),
    re_path(r"^dashboard/?$", DashboardAPIView.as_view(), name="dashboard"),
    re_path(r"^settings/?$", AppSettingsAPIView.as_view(), name="settings"),
    re_path(r"^", include(router.urls)),
]
