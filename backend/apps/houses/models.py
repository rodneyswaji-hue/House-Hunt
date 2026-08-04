# apps/houses/models.py
import boto3
from django.conf import settings
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from urllib.parse import urlparse
from apps.accounts.models import Landlord


class House(models.Model):
    landlord = models.ForeignKey(
        Landlord, on_delete=models.CASCADE, related_name="houses"
    )
    title = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.PositiveIntegerField(help_text="Monthly rent in KES")
    units = models.PositiveIntegerField(default=1)

    # What kind of dwelling it is. Kept separate from the bedroom count
    # because studios, bedsitters and single rooms all have zero bedrooms —
    # one integer cannot express both.
    PROPERTY_TYPE_CHOICES = [
        ("single_room", "Single Room"),
        ("bedsitter", "Bedsitter"),
        ("studio", "Studio Apartment"),
        ("apartment", "Apartment / Flat"),
        ("maisonette", "Maisonette"),
        ("bungalow", "Bungalow"),
        ("townhouse", "Townhouse"),
        ("villa", "Villa"),
        ("penthouse", "Penthouse"),
        ("servant_quarter", "Servant Quarter (SQ)"),
    ]
    property_type = models.CharField(
        max_length=32, choices=PROPERTY_TYPE_CHOICES, default="apartment"
    )

    BEDROOM_CHOICES = [
        (0, "No separate bedroom"),
        (1, "1 Bedroom"), (2, "2 Bedrooms"), (3, "3 Bedrooms"),
        (4, "4 Bedrooms"), (5, "5+ Bedrooms"),
    ]
    bedrooms = models.IntegerField(choices=BEDROOM_CHOICES)
    available = models.BooleanField(default=True)

    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)

    # Contact shown to tenants — can be a caretaker, not necessarily the account owner
    contact_name = models.CharField(max_length=150)
    contact_phone = models.CharField(max_length=20)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "houses"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} — {self.location}"


class HouseImage(models.Model):
    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name="images")
    url = models.URLField(max_length=500)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "house_images"
        ordering = ["order"]

class HouseVideo(models.Model):
    house = models.OneToOneField(House, on_delete=models.CASCADE, related_name="video")
    url = models.URLField(max_length=500)

    class Meta:
        db_table = "house_videos"

# --- AUTO-DELETE SIGNALS ---

def delete_s3_file_by_url(url):
    """Helper to delete a file from S3 given its full URL"""
    if not url:
        return
    
    # Skip S3 deletion if credentials are not configured
    if not settings.AWS_ACCESS_KEY_ID or not settings.AWS_SECRET_ACCESS_KEY:
        return
    
    try:
        # Extract the path from the URL (e.g., 'house_photos/img.jpg')
        path = urlparse(url).path.lstrip('/')
        
        s3 = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        
        s3.delete_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=path)
    except Exception as e:
        print(f"Error deleting file from S3: {e}")

@receiver(post_delete, sender=HouseImage)
def auto_delete_image_on_delete(sender, instance, **kwargs):
    delete_s3_file_by_url(instance.url)

@receiver(post_delete, sender=HouseVideo)
def auto_delete_video_on_delete(sender, instance, **kwargs):
    delete_s3_file_by_url(instance.url)