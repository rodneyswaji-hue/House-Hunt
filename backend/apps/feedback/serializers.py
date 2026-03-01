# apps/feedback/serializers.py
from rest_framework import serializers
from .models import LandlordReview, ReviewProofImage, ContactMessage, COMPLAINT_REASONS
from apps.tenants.models import Tenant


class ReviewProofImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewProofImage
        fields = ["id", "url", "order"]


class LandlordReviewSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source="tenant.name", read_only=True)
    landlord_name = serializers.CharField(source="landlord.name", read_only=True)
    proof_images = ReviewProofImageSerializer(many=True, read_only=True)
    # Write-only list of S3 URLs sent from the frontend after upload
    proof_image_urls = serializers.ListField(
        child=serializers.URLField(),
        write_only=True,
        required=False,
        max_length=3,
    )

    class Meta:
        model = LandlordReview
        fields = [
            "id", "landlord", "tenant", "tenant_name", "landlord_name",
            "rating", "comment",
            "complaint_reason", "explanation",
            "proof_images", "proof_image_urls",
            "status", "created_at",
        ]
        read_only_fields = [
            "id", "tenant", "status", "created_at",
            "tenant_name", "landlord_name", "proof_images",
        ]

    def validate_complaint_reason(self, value):
        valid = [r[0] for r in COMPLAINT_REASONS]
        if value and value not in valid:
            raise serializers.ValidationError(f"Invalid reason. Choose from: {', '.join(valid)}")
        return value

    def validate(self, attrs):
        tenant = self.context["request"].user
        if not isinstance(tenant, Tenant):
            raise serializers.ValidationError("Only tenant accounts can leave reviews.")
        landlord = attrs["landlord"]
        if LandlordReview.objects.filter(landlord=landlord, tenant=tenant).exists():
            raise serializers.ValidationError("You have already reviewed this landlord.")

        # Complaint reason required for low ratings
        rating = attrs.get("rating", 5)
        if rating <= 3 and not attrs.get("complaint_reason"):
            raise serializers.ValidationError({
                "complaint_reason": "Please select a reason for your complaint."
            })

        attrs["tenant"] = tenant
        return attrs

    def create(self, validated_data):
        proof_urls = validated_data.pop("proof_image_urls", [])
        review = LandlordReview.objects.create(**validated_data)

        for i, url in enumerate(proof_urls[:3]):
            ReviewProofImage.objects.create(review=review, url=url, order=i)

        return review


class PublicReviewSerializer(serializers.ModelSerializer):
    """Approved reviews shown publicly — anonymised tenant name."""
    tenant_name = serializers.SerializerMethodField()
    proof_images = ReviewProofImageSerializer(many=True, read_only=True)
    complaint_reason_display = serializers.SerializerMethodField()

    class Meta:
        model = LandlordReview
        fields = [
            "id", "tenant_name", "rating", "comment",
            "complaint_reason", "complaint_reason_display",
            "explanation", "proof_images", "created_at",
        ]

    def get_tenant_name(self, obj):
        parts = obj.tenant.name.strip().split()
        if len(parts) >= 2:
            return f"{parts[0]} {parts[-1][0]}."
        return parts[0] if parts else "Anonymous"

    def get_complaint_reason_display(self, obj):
        return dict(COMPLAINT_REASONS).get(obj.complaint_reason, "")


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "subject", "message", "created_at"]
        read_only_fields = ["id", "created_at"]