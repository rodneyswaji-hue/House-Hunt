# apps/tenants/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.authentication import TENANT, tag_token
from .models import Tenant
from .serializers import TenantRegisterSerializer, TenantLoginSerializer, TenantProfileSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = TenantRegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Account created successfully."}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    serializer = TenantLoginSerializer(data=request.data)
    if serializer.is_valid():
        tenant = serializer.validated_data["tenant"]
        refresh = tag_token(RefreshToken.for_user(tenant), TENANT)
        return Response({
            "token": str(refresh.access_token),
            "refresh": str(refresh),
            "tenant": TenantProfileSerializer(tenant).data,
        })
    return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    # Only works if request.user is a Tenant
    if not isinstance(request.user, Tenant):
        return Response({"detail": "Not a tenant account."}, status=status.HTTP_403_FORBIDDEN)
    return Response(TenantProfileSerializer(request.user).data)