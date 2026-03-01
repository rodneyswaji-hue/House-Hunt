# apps/feedback/admin.py
from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html
from .models import LandlordReview, ReviewProofImage, ContactMessage
from apps.audit.models import log_action


class ReviewProofImageInline(admin.TabularInline):
    model = ReviewProofImage
    extra = 0
    readonly_fields = ["preview", "url", "order"]
    fields = ["preview", "url", "order"]

    def preview(self, obj):
        if obj.url:
            return format_html(
                '<a href="{}" target="_blank">'
                '<img src="{}" style="height:60px;border-radius:6px;" /></a>',
                obj.url, obj.url
            )
        return "—"
    preview.short_description = "Preview"


@admin.register(LandlordReview)
class LandlordReviewAdmin(admin.ModelAdmin):
    list_display = [
        "tenant", "landlord", "rating", "complaint_reason",
        "status", "created_at", "has_proof"
    ]
    list_filter = ["status", "rating", "complaint_reason"]
    search_fields = ["tenant__name", "landlord__name", "comment", "explanation"]
    readonly_fields = ["created_at", "reviewed_at"]
    inlines = [ReviewProofImageInline]
    actions = ["approve_reviews", "reject_reviews"]

    def has_proof(self, obj):
        count = obj.proof_images.count()
        return format_html(
            '<span style="color:{}">{}</span>',
            "#22c55e" if count > 0 else "#94a3b8",
            f"✓ {count} image{'s' if count != 1 else ''}" if count > 0 else "No proof"
        )
    has_proof.short_description = "Proof"

    @admin.action(description="Approve selected reviews")
    def approve_reviews(self, request, queryset):
        queryset.update(status="approved", reviewed_at=timezone.now())
        for review in queryset:
            log_action(
                request.user, "approve_feedback",
                "LandlordReview", review.id, str(review)
            )

    @admin.action(description="Reject selected reviews")
    def reject_reviews(self, request, queryset):
        queryset.update(status="rejected", reviewed_at=timezone.now())
        for review in queryset:
            log_action(
                request.user, "reject_feedback",
                "LandlordReview", review.id, str(review)
            )


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "subject", "status", "created_at"]
    list_filter = ["status"]
    search_fields = ["name", "email", "subject"]
    list_editable = ["status"]