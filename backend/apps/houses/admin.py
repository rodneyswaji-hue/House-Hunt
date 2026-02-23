# apps/houses/admin.py
from django.contrib import admin
from .models import House, HouseImage, HouseVideo


class HouseImageInline(admin.TabularInline):
    model = HouseImage
    extra = 1


class HouseVideoInline(admin.StackedInline):
    model = HouseVideo
    max_num = 1


@admin.register(House)
class HouseAdmin(admin.ModelAdmin):
    list_display = ["title", "location", "bedrooms", "price", "units", "available", "created_at"]
    list_filter = ["available", "bedrooms"]
    search_fields = ["title", "location", "contact_name", "contact_phone"]
    list_editable = ["available"]
    inlines = [HouseImageInline, HouseVideoInline]