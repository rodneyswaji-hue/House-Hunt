# apps/houses/serializers.py
from rest_framework import serializers
from .models import House, HouseImage, HouseVideo


class HouseListSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()
    video = serializers.SerializerMethodField()
    landlord = serializers.SerializerMethodField()
    coordinates = serializers.SerializerMethodField()
    is_banned = serializers.SerializerMethodField()

    class Meta:
        model = House
        fields = [
            "id", "title", "location", "description",
            "price", "units", "bedrooms", "available",
            "images", "video", "landlord", "coordinates",
            "is_banned", "created_at", "updated_at",
        ]

    def get_images(self, obj):
        return [img.url for img in obj.images.all()]

    def get_video(self, obj):
        try:
            return obj.video.url
        except HouseVideo.DoesNotExist:
            return None

    def get_landlord(self, obj):
        # Hide contact info if landlord is banned
        if obj.landlord.is_banned:
            return {"name": "Account Suspended", "phone": None}
        return {"name": obj.contact_name, "phone": obj.contact_phone}

    def get_coordinates(self, obj):
        if obj.latitude and obj.longitude:
            return {"lat": float(obj.latitude), "lng": float(obj.longitude)}
        return None

    def get_is_banned(self, obj):
        return obj.landlord.is_banned


class HouseCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    location = serializers.CharField(max_length=255)
    description = serializers.CharField(allow_blank=True, default="")
    price = serializers.IntegerField(min_value=0)
    units = serializers.IntegerField(min_value=1)
    bedrooms = serializers.IntegerField(min_value=0, max_value=3)
    available = serializers.BooleanField(default=True)
    images = serializers.ListField(child=serializers.URLField(), allow_empty=True, default=list)
    video = serializers.URLField(allow_null=True, required=False)
    landlord = serializers.DictField(child=serializers.CharField())
    coordinates = serializers.DictField(child=serializers.FloatField())

    def validate_landlord(self, value):
        if "name" not in value or "phone" not in value:
            raise serializers.ValidationError("landlord must have name and phone.")
        return value

    def validate_coordinates(self, value):
        if "lat" not in value or "lng" not in value:
            raise serializers.ValidationError("coordinates must have lat and lng.")
        return value

    def create(self, validated_data):
        landlord_data = validated_data.pop("landlord")
        coordinates = validated_data.pop("coordinates")
        images = validated_data.pop("images", [])
        video_url = validated_data.pop("video", None)

        house = House.objects.create(
            landlord=self.context["request"].user,
            contact_name=landlord_data["name"],
            contact_phone=landlord_data["phone"],
            latitude=coordinates["lat"],
            longitude=coordinates["lng"],
            **validated_data,
        )
        for i, url in enumerate(images):
            HouseImage.objects.create(house=house, url=url, order=i)
        if video_url:
            HouseVideo.objects.create(house=house, url=video_url)
        return house


class HouseUpdateSerializer(serializers.ModelSerializer):
    images = serializers.ListField(child=serializers.URLField(), required=False)
    video = serializers.URLField(allow_null=True, required=False)

    class Meta:
        model = House
        fields = [
            "title", "location", "description", "price", 
            "units", "bedrooms", "available", "images", "video"
        ]

    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        video_url = validated_data.pop('video', None)

        # 1. Update standard house fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # 2. Handle Image Updates (Syncing)
        if images_data is not None:
            # This triggers the 'post_delete' signal we wrote for any removed image
            instance.images.all().delete() 
            for i, url in enumerate(images_data):
                HouseImage.objects.create(house=instance, url=url, order=i)

        # 3. Handle Video Updates
        if video_url is not None:
            if hasattr(instance, 'video'):
                instance.video.delete() # Triggers S3 cleanup signal
            HouseVideo.objects.create(house=instance, url=video_url)
        elif video_url is None and hasattr(instance, 'video'):
             instance.video.delete()

        return instance