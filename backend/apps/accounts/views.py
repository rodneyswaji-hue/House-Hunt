# apps/accounts/views.py
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
import africastalking

from django.db.models import Count
from django.shortcuts import get_object_or_404

from apps.audit.models import log_action
from .authentication import LANDLORD, tag_token
from .models import Landlord
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    LandlordProfileSerializer,
    LandlordAdminSerializer,
    ForgotPasswordSerializer,
    VerifyOTPSerializer,
    ResetPasswordSerializer,
)

# ── Africa's Talking SMS initialisation ───────────────────────────────────
africastalking.initialize(settings.AT_USERNAME, settings.AT_API_KEY)
sms = africastalking.SMS


def _send_otp_sms(phone: str, otp: str) -> None:
    """Send OTP via Africa's Talking. Silently logs errors in production."""
    try:
        message = f"Your HouseHunt password reset code is: {otp}. Valid for 10 minutes. Do not share this code."
        recipients = [f"+254{phone[1:]}" if phone.startswith("0") else phone]
        sms.send(message, recipients, sender_id=settings.AT_SENDER_ID)
    except Exception as e:
        # Log but don't crash — OTP is still saved in DB
        import logging
        logging.getLogger(__name__).error(f"SMS send failed for {phone}: {e}")


# ── Register ──────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Account created successfully."}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── Login ─────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        landlord = serializer.validated_data["landlord"]
        refresh = tag_token(RefreshToken.for_user(landlord), LANDLORD)
        return Response({
            "token": str(refresh.access_token),
            "refresh": str(refresh),
            "landlord": LandlordProfileSerializer(landlord).data,
        })
    return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


# ── Me (current user) ─────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    # Tenants authenticate through the same JWT pipeline — this endpoint is
    # for landlord accounts only.
    if not isinstance(request.user, Landlord):
        return Response({"detail": "Not a landlord account."}, status=403)
    return Response(LandlordProfileSerializer(request.user).data)


# ── Forgot Password — send OTP ────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password(request):
    serializer = ForgotPasswordSerializer(data=request.data)
    if serializer.is_valid():
        phone = serializer.validated_data["phone"]
        landlord = Landlord.objects.get(phone=phone)
        otp = landlord.generate_otp()
        _send_otp_sms(phone, otp)
        return Response({"message": f"OTP sent to {phone}."})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── Verify OTP ────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def verify_otp(request):
    serializer = VerifyOTPSerializer(data=request.data)
    if serializer.is_valid():
        return Response({"message": "OTP verified."})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── Reset Password ────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request):
    serializer = ResetPasswordSerializer(data=request.data)
    if serializer.is_valid():
        landlord = serializer.validated_data["landlord"]
        landlord.set_password(serializer.validated_data["new_password"])
        landlord.clear_otp()
        landlord.save()
        return Response({"message": "Password reset successfully."})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── Admin: landlord management ────────────────────────────────────────────
# Backs the /admin dashboard. IsAdminUser checks is_staff, so ordinary
# landlords authenticating with the same JWT get a 403.

@api_view(["GET"])
@permission_classes([IsAdminUser])
def landlord_list(request):
    landlords = Landlord.objects.annotate(house_count=Count("houses")).order_by("-created_at")
    return Response(LandlordAdminSerializer(landlords, many=True).data)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def landlord_action(request, pk):
    landlord = get_object_or_404(Landlord, pk=pk)
    action = request.data.get("action")

    if landlord.is_staff and action == "ban":
        return Response({"detail": "Admin accounts cannot be banned."}, status=400)

    if action == "ban":
        reason = request.data.get("reason", "")
        landlord.ban(reason=reason, banned_by=str(request.user))
        log_action(
            request.user, "ban_landlord", "Landlord",
            landlord.id, str(landlord), notes=reason,
        )
        return Response({"message": f"{landlord.name} has been banned."})

    if action == "unban":
        landlord.unban()
        log_action(
            request.user, "unban_landlord", "Landlord",
            landlord.id, str(landlord),
        )
        return Response({"message": f"{landlord.name} has been unbanned."})

    return Response({"detail": "Action must be 'ban' or 'unban'."}, status=400)
