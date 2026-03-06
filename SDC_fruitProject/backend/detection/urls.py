"""Detection app URL configuration."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views
from . import auth_views

router = DefaultRouter()
router.register(r"records", views.DetectionRecordViewSet, basename="detection-record")

urlpatterns = [
    # Auth
    path("auth/login/", auth_views.login_view, name="auth-login"),
    path("auth/logout/", auth_views.logout_view, name="auth-logout"),
    path("auth/me/", auth_views.me_view, name="auth-me"),
    path("auth/change-username/", auth_views.change_username_view, name="auth-change-username"),
    path("auth/change-password/", auth_views.change_password_view, name="auth-change-password"),
    # Detection
    path("detect/", views.detect_single, name="detect-single"),
    path("detect/batch/", views.detect_batch, name="detect-batch"),
    path("dashboard/stats/", views.dashboard_stats, name="dashboard-stats"),
    path("reports/export/", views.export_csv, name="export-csv"),
    path("reports/summary/", views.report_summary, name="report-summary"),
    path("", include(router.urls)),
]
