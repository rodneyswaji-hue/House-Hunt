# apps/feedback/models.py
from django.db import models
from apps.accounts.models import Landlord
from apps.tenants.models import Tenant


COMPLAINT_REASONS = [
    ("fraud", "Fraud / Scam"),
    ("false_listing", "False or Misleading Listing"),
    ("harassment", "Harassment or Rude Behaviour"),
    ("overcharging", "Overcharging / Hidden Fees"),
    ("poor_condition", "Property in Poor Condition"),
    ("other", "Other"),
]


class LandlordReview(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending Approval"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    landlord = models.ForeignKey(Landlord, on_delete=models.CASCADE, related_name="reviews")
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="reviews")

    # Rating + comment (all reviews)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)

    # Complaint fields (shown when rating <= 3)
    complaint_reason = models.CharField(
        max_length=50, choices=COMPLAINT_REASONS, blank=True
    )
    explanation = models.TextField(blank=True)

    # Admin moderation
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    rejection_reason = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "landlord_reviews"
        ordering = ["-created_at"]
        unique_together = ["landlord", "tenant"]

    def __str__(self):
        return f"{self.tenant.name} → {self.landlord.name} ({self.rating}★)"

    @property
    def is_complaint(self):
        return self.rating <= 3


class ReviewProofImage(models.Model):
    """Up to 3 proof images per review — stored as S3/CloudFront URLs."""
    review = models.ForeignKey(LandlordReview, on_delete=models.CASCADE, related_name="proof_images")
    url = models.URLField(max_length=500)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "review_proof_images"
        ordering = ["order"]

    def __str__(self):
        return f"Proof image {self.order} for review {self.review.id}"


class ContactMessage(models.Model):
    STATUS_CHOICES = [
        ("unread", "Unread"),
        ("read", "Read"),
        ("resolved", "Resolved"),
    ]
    name = models.CharField(max_length=150)
    email = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="unread")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "contact_messages"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} — {self.subject}"