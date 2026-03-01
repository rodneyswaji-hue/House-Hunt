# apps/accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils import timezone
from .models import Landlord
from apps.audit.models import log_action


@admin.register(Landlord)
class LandlordAdmin(UserAdmin):
    list_display = ["name", "phone", "email", "is_active", "is_banned", "is_staff", "created_at"]
    list_filter = ["is_active", "is_banned", "is_staff"]
    search_fields = ["name", "phone", "email"]
    ordering = ["-created_at"]
    actions = ["ban_landlords", "unban_landlords"]

    fieldsets = (
        (None, {"fields": ("phone", "password")}),
        ("Personal Info", {"fields": ("name", "email")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser")}),
        ("Ban Info", {"fields": ("is_banned", "ban_reason", "banned_at", "banned_by")}),
        ("OTP", {"fields": ("otp", "otp_created_at")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("phone", "name", "password1", "password2"),
        }),
    )
    readonly_fields = ["banned_at", "banned_by", "otp_created_at"]

    @admin.action(description="Ban selected landlords")
    def ban_landlords(self, request, queryset):
        for landlord in queryset:
            landlord.ban(reason="Banned via admin action", banned_by=str(request.user))
            log_action(request.user, "ban_landlord", "Landlord", landlord.id, str(landlord), notes="Banned via admin action")
        self.message_user(request, f"{queryset.count()} landlord(s) banned.")

    @admin.action(description="Unban selected landlords")
    def unban_landlords(self, request, queryset):
        for landlord in queryset:
            landlord.unban()
            log_action(request.user, "unban_landlord", "Landlord", landlord.id, str(landlord))
        self.message_user(request, f"{queryset.count()} landlord(s) unbanned.")