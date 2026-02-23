# apps/bookings/admin.py
from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ["phone", "house", "notified", "created_at"]
    list_filter = ["notified"]
    search_fields = ["phone", "house__title"]