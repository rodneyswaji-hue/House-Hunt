# apps/tenants/serializers.py
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import check_password
from rest_framework import serializers
from .models import Tenant


class TenantRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    identifier = serializers.CharField(write_only=True, help_text="Email or phone number")

    class Meta:
        model = Tenant
        fields = ["id", "name", "identifier", "password", "confirm_password"]

    def validate_identifier(self, value):
        value = value.strip()
        if "@" in value:
            if Tenant.objects.filter(email=value).exists():
                raise serializers.ValidationError("An account with this email already exists.")
        else:
            if Tenant.objects.filter(phone=value).exists():
                raise serializers.ValidationError("An account with this phone already exists.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        identifier = validated_data.pop("identifier")
        password = validated_data.pop("password")
        tenant = Tenant(name=validated_data["name"])
        if "@" in identifier:
            tenant.email = identifier
        else:
            tenant.phone = identifier
        tenant.set_password(password)
        tenant.save()
        return tenant


class TenantLoginSerializer(serializers.Serializer):
    identifier = serializers.CharField(help_text="Email or phone number")
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        identifier = attrs["identifier"].strip()
        password = attrs["password"]

        tenant = None
        if "@" in identifier:
            tenant = Tenant.objects.filter(email=identifier).first()
        else:
            tenant = Tenant.objects.filter(phone=identifier).first()

        if not tenant or not tenant.check_password(password):
            raise serializers.ValidationError({"detail": "Invalid credentials."})
        if not tenant.is_active:
            raise serializers.ValidationError({"detail": "Account is disabled."})

        attrs["tenant"] = tenant
        return attrs


class TenantProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ["id", "name", "email", "phone", "created_at"]
        read_only_fields = ["id", "created_at"]