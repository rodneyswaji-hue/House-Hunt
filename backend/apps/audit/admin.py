# apps/audit/admin.py
from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ["timestamp", "performed_by", "action", "target_model", "target_repr", "notes"]
    list_filter = ["action", "target_model"]
    search_fields = ["performed_by", "target_repr", "notes"]
    readonly_fields = ["timestamp", "performed_by", "performed_by_id", "action",
                       "target_model", "target_id", "target_repr", "notes"]

    def has_add_permission(self, request):
        return False  # Logs are created by code only, not manually

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser  # Only superadmin can delete logs