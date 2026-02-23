# apps/houses/models.py
from django.db import models
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

    BEDROOM_CHOICES = [
        (0, "Bedsitter"), (1, "1 Bedroom"),
        (2, "2 Bedrooms"), (3, "3 Bedrooms"),
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