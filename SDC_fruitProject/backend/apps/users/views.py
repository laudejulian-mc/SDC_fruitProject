from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer

from config.responses import api_success
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        token_serializer = LoginSerializer(data={
            "username": request.data.get("username"),
            "password": request.data.get("password"),
        })
        token_serializer.is_valid(raise_exception=True)

        data = {
            "user": UserSerializer(user).data,
            "tokens": token_serializer.validated_data,
        }
        return api_success(data=data, message="Registration successful", status_code=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return api_success(
            data={"tokens": serializer.validated_data},
            message="Login successful",
        )


class RefreshTokenView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = TokenRefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return api_success(data={"tokens": serializer.validated_data}, message="Token refreshed")


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = UserSerializer(request.user).data
        return api_success(data=data, message="Authenticated user fetched")
