# apps/accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Landlord


@admin.register(Landlord)
class LandlordAdmin(UserAdmin):
    list_display = ["name", "phone", "email", "is_active", "is_staff", "created_at"]
    list_filter = ["is_active", "is_staff"]
    search_fields = ["name", "phone", "email"]
    ordering = ["-created_at"]

    fieldsets = (
        (None, {"fields": ("phone", "password")}),
        ("Personal Info", {"fields": ("name", "email")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser")}),
        ("OTP", {"fields": ("otp", "otp_created_at")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("phone", "name", "password1", "password2"),
        }),
    )