# apps/bookings/models.py
from django.db import models
from apps.houses.models import House


class Booking(models.Model):
    """
    A notification request — tenant gives their phone number
    to be notified when a house's availability status changes.
    """
    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name="bookings")
    phone = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    notified = models.BooleanField(default=False)

    class Meta:
        db_table = "bookings"
        unique_together = ["house", "phone"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.phone} → {self.house.title}"