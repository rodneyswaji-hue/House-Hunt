# apps/feedback/views.py
from django.utils import timezone
from django.db.models import Avg
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response

from apps.audit.models import log_action
from apps.tenants.models import Tenant
from .models import LandlordReview, ContactMessage
from .serializers import (
    LandlordReviewSerializer,
    PublicReviewSerializer,
    ContactMessageSerializer,
)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_review(request):
    if not isinstance(request.user, Tenant):
        return Response({"detail": "Only tenant accounts can leave reviews."}, status=403)
    serializer = LandlordReviewSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "Review submitted and pending approval."},
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([AllowAny])
def landlord_reviews(request, landlord_id):
    reviews = LandlordReview.objects.filter(
        landlord_id=landlord_id, status="approved"
    ).select_related("tenant").prefetch_related("proof_images")

    avg = reviews.aggregate(avg=Avg("rating"))["avg"]
    return Response({
        "average_rating": round(avg, 1) if avg else None,
        "total_reviews": reviews.count(),
        "reviews": PublicReviewSerializer(reviews, many=True).data,
    })


@api_view(["GET"])
@permission_classes([IsAdminUser])
def pending_reviews(request):
    reviews = LandlordReview.objects.filter(
        status="pending"
    ).select_related("tenant", "landlord").prefetch_related("proof_images")
    return Response(LandlordReviewSerializer(reviews, many=True).data)


@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def review_action(request, pk):
    try:
        review = LandlordReview.objects.get(pk=pk)
    except LandlordReview.DoesNotExist:
        return Response({"detail": "Review not found."}, status=404)

    action = request.data.get("action")
    reason = request.data.get("reason", "")

    if action == "approve":
        review.status = "approved"
        review.reviewed_at = timezone.now()
        review.save()
        log_action(request.user, "approve_feedback", "LandlordReview", review.id, str(review))
        return Response({"message": "Review approved."})

    elif action == "reject":
        review.status = "rejected"
        review.rejection_reason = reason
        review.reviewed_at = timezone.now()
        review.save()
        log_action(request.user, "reject_feedback", "LandlordReview", review.id, str(review), notes=reason)
        return Response({"message": "Review rejected."})

    return Response({"detail": "Action must be 'approve' or 'reject'."}, status=400)


@api_view(["POST"])
@permission_classes([AllowAny])
def submit_contact(request):
    serializer = ContactMessageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Message received. We'll get back to you soon."}, status=201)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def contact_messages(request):
    msgs = ContactMessage.objects.all()
    return Response(ContactMessageSerializer(msgs, many=True).data)


@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def contact_message_action(request, pk):
    try:
        msg = ContactMessage.objects.get(pk=pk)
    except ContactMessage.DoesNotExist:
        return Response({"detail": "Message not found."}, status=404)
    new_status = request.data.get("status")
    if new_status in ["read", "resolved", "unread"]:
        msg.status = new_status
        msg.save()
        return Response({"message": f"Marked as {new_status}."})
    return Response({"detail": "Invalid status."}, status=400)