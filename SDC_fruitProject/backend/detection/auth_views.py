"""Authentication views for login/logout."""
import logging
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status, permissions
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response

logger = logging.getLogger(__name__)


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """Session auth that skips CSRF enforcement (for logout only)."""
    def enforce_csrf(self, request):
        return  # Skip CSRF check


def ensure_default_admin():
    """Create default admin if it doesn't exist."""
    if not User.objects.filter(username="admin").exists():
        User.objects.create_superuser(
            username="admin",
            password="admin",
            email="admin@appleqc.local",
            first_name="Admin",
            last_name="User",
        )
        logger.info("Default admin user created (admin/admin)")


# Create default admin on module load
try:
    ensure_default_admin()
except Exception:
    pass  # DB might not be ready yet


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@ensure_csrf_cookie
def login_view(request):
    """Authenticate user and create session."""
    username = request.data.get("username", "").strip()
    password = request.data.get("password", "")

    if not username or not password:
        return Response(
            {"error": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response(
            {"error": "Invalid username or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    login(request, user)
    # Create or retrieve a DRF auth token for mobile clients
    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        "token": token.key,
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
        "first_name": user.first_name,
        "role": "admin" if user.is_staff else "guest",
    })


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@authentication_classes([TokenAuthentication, CsrfExemptSessionAuthentication])
def logout_view(request):
    """Log out the current user — delete token and session."""
    if request.user.is_authenticated:
        # Delete the DRF token so it can no longer be used
        Token.objects.filter(user=request.user).delete()
    logout(request)
    return Response({"message": "Logged out successfully."})


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
@ensure_csrf_cookie
def me_view(request):
    """Return current user info or guest status."""
    if request.user.is_authenticated:
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "is_staff": request.user.is_staff,
            "is_superuser": request.user.is_superuser,
            "first_name": request.user.first_name,
            "role": "admin" if request.user.is_staff else "guest",
            "authenticated": True,
        })
    return Response({
        "role": "guest",
        "authenticated": False,
    })


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def change_username_view(request):
    """Allow authenticated user to change their username."""
    new_username = request.data.get("new_username", "").strip()
    current_password = request.data.get("current_password", "")

    if not new_username:
        return Response(
            {"error": "New username is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not current_password:
        return Response(
            {"error": "Current password is required for verification."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not request.user.check_password(current_password):
        return Response(
            {"error": "Current password is incorrect."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if len(new_username) < 3:
        return Response(
            {"error": "Username must be at least 3 characters."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username=new_username).exclude(pk=request.user.pk).exists():
        return Response(
            {"error": "This username is already taken."},
            status=status.HTTP_409_CONFLICT,
        )

    request.user.username = new_username
    request.user.save(update_fields=["username"])
    return Response({
        "message": "Username updated successfully.",
        "username": new_username,
    })


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def change_password_view(request):
    """Allow authenticated user to change their password."""
    current_password = request.data.get("current_password", "")
    new_password = request.data.get("new_password", "")
    confirm_password = request.data.get("confirm_password", "")

    if not current_password or not new_password:
        return Response(
            {"error": "Current password and new password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not request.user.check_password(current_password):
        return Response(
            {"error": "Current password is incorrect."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if new_password != confirm_password:
        return Response(
            {"error": "New passwords do not match."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(new_password) < 4:
        return Response(
            {"error": "Password must be at least 4 characters."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    request.user.set_password(new_password)
    request.user.save()
    # Re-authenticate so session stays valid
    login(request, request.user)
    # Rotate token — delete old, create new
    Token.objects.filter(user=request.user).delete()
    token = Token.objects.create(user=request.user)
    return Response({"message": "Password updated successfully.", "token": token.key})
