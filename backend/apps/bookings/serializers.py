# apps/bookings/serializers.py
from rest_framework import serializers
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    house_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Booking
        fields = ["id", "house_id", "phone", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_phone(self, value):
        import re
        if not re.match(r"^07\d{8}$", value):
            raise serializers.ValidationError("Enter a valid Kenyan phone number (07XXXXXXXX).")
        return value

    def validate(self, attrs):
        from apps.houses.models import House
        try:
            house = House.objects.get(pk=attrs["house_id"])
        except House.DoesNotExist:
            raise serializers.ValidationError({"house_id": "House not found."})
        if Booking.objects.filter(house=house, phone=attrs["phone"]).exists():
            raise serializers.ValidationError({"detail": "You have already registered for notifications on this property."})
        attrs["house"] = house
        return attrs

    def create(self, validated_data):
        validated_data.pop("house_id", None)
        return Booking.objects.create(**validated_data)