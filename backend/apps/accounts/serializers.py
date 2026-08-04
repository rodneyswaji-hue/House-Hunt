# apps/accounts/serializers.py
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import Landlord


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = Landlord
        fields = ["id", "name", "phone", "password", "confirm_password"]

    def validate_phone(self, value):
        # Normalise: strip spaces
        value = value.strip().replace(" ", "")
        if Landlord.objects.filter(phone=value).exists():
            raise serializers.ValidationError("A landlord with this phone number already exists.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        return Landlord.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    """
    Accepts either phone number or name + password.
    Frontend sends { identifier, password }.
    """
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        identifier = attrs["identifier"].strip()
        password = attrs["password"]

        # Try phone first, then name
        landlord = None
        if Landlord.objects.filter(phone=identifier).exists():
            landlord = authenticate(
                request=self.context.get("request"),
                username=identifier,
                password=password,
            )
        else:
            # Try by name — find matching phone then authenticate
            qs = Landlord.objects.filter(name__iexact=identifier)
            if qs.exists():
                landlord = authenticate(
                    request=self.context.get("request"),
                    username=qs.first().phone,
                    password=password,
                )

        if not landlord:
            raise serializers.ValidationError({"detail": "Invalid credentials."})
        if not landlord.is_active:
            raise serializers.ValidationError({"detail": "Account is disabled."})
        if landlord.is_banned:
            raise serializers.ValidationError({"detail": "Your account has been suspended."})

        attrs["landlord"] = landlord
        return attrs


class LandlordProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Landlord
        fields = ["id", "name", "phone", "email", "created_at"]
        read_only_fields = ["id", "phone", "created_at"]


class ForgotPasswordSerializer(serializers.Serializer):
    phone = serializers.CharField()

    def validate_phone(self, value):
        value = value.strip()
        if not Landlord.objects.filter(phone=value).exists():
            raise serializers.ValidationError("No account found with this phone number.")
        return value


class VerifyOTPSerializer(serializers.Serializer):
    phone = serializers.CharField()
    otp = serializers.CharField(max_length=6, min_length=6)

    def validate(self, attrs):
        try:
            landlord = Landlord.objects.get(phone=attrs["phone"].strip())
        except Landlord.DoesNotExist:
            raise serializers.ValidationError({"detail": "Invalid phone number."})

        if not landlord.verify_otp(attrs["otp"]):
            raise serializers.ValidationError({"detail": "Invalid or expired OTP."})

        attrs["landlord"] = landlord
        return attrs


class ResetPasswordSerializer(serializers.Serializer):
    phone = serializers.CharField()
    otp = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(validators=[validate_password])

    def validate(self, attrs):
        try:
            landlord = Landlord.objects.get(phone=attrs["phone"].strip())
        except Landlord.DoesNotExist:
            raise serializers.ValidationError({"detail": "Invalid phone number."})

        if not landlord.verify_otp(attrs["otp"]):
            raise serializers.ValidationError({"detail": "Invalid or expired OTP."})

        attrs["landlord"] = landlord
        return attrs


class LandlordAdminSerializer(serializers.ModelSerializer):
    """Full landlord record for the admin dashboard — includes ban state."""
    house_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Landlord
        fields = [
            "id", "name", "phone", "email", "is_banned", "ban_reason",
            "banned_at", "banned_by", "is_active", "is_staff",
            "house_count", "created_at",
        ]
        read_only_fields = fields
