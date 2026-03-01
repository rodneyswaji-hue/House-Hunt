# househunt/admin_views.py
# Site-wide stats endpoint for the Next.js admin dashboard.

from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from apps.accounts.models import Landlord
from apps.houses.models import House
from apps.bookings.models import Booking
from apps.tenants.models import Tenant
from apps.feedback.models import LandlordReview, ContactMessage
from apps.audit.models import AuditLog


@api_view(["GET"])
@permission_classes([IsAdminUser])
def site_stats(request):
    now = timezone.now()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    return Response({
        "landlords": {
            "total": Landlord.objects.count(),
            "active": Landlord.objects.filter(is_banned=False, is_active=True).count(),
            "banned": Landlord.objects.filter(is_banned=True).count(),
            "new_this_week": Landlord.objects.filter(created_at__gte=week_ago).count(),
            "new_this_month": Landlord.objects.filter(created_at__gte=month_ago).count(),
        },
        "houses": {
            "total": House.objects.count(),
            "available": House.objects.filter(available=True).count(),
            "unavailable": House.objects.filter(available=False).count(),
        },
        "bookings": {
            "total": Booking.objects.count(),
            "this_week": Booking.objects.filter(created_at__gte=week_ago).count(),
        },
        "tenants": {
            "total": Tenant.objects.count(),
            "new_this_week": Tenant.objects.filter(created_at__gte=week_ago).count(),
        },
        "feedback": {
            "total_reviews": LandlordReview.objects.count(),
            "pending_reviews": LandlordReview.objects.filter(status="pending").count(),
            "approved_reviews": LandlordReview.objects.filter(status="approved").count(),
            "unread_messages": ContactMessage.objects.filter(status="unread").count(),
        },
        "audit": {
            "recent_actions": list(
                AuditLog.objects.values(
                    "performed_by", "action", "target_repr", "timestamp"
                )[:5]
            ),
        },
    })