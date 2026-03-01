# apps/audit/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = "__all__"


@api_view(["GET"])
@permission_classes([IsAdminUser])
def audit_log_list(request):
    logs = AuditLog.objects.all()[:100]  # Latest 100
    return Response(AuditLogSerializer(logs, many=True).data)