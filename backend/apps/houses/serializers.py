# apps/houses/serializers.py
from rest_framework import serializers
from .models import House, HouseImage, HouseVideo


class HouseListSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()
    video = serializers.SerializerMethodField()
    landlord = serializers.SerializerMethodField()
    coordinates = serializers.SerializerMethodField()
    is_banned = serializers.SerializerMethodField()
    property_type_display = serializers.CharField(
        source="get_property_type_display", read_only=True
    )

    class Meta:
        model = House
        fields = [
            "id", "title", "location", "description",
            "price", "units", "bedrooms", "available",
            "property_type", "property_type_display",
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
        # `id` is the account id — the frontend needs it to load that
        # landlord's reviews. Contact name/phone are per-listing.
        if obj.landlord.is_banned:
            return {"id": obj.landlord_id, "name": "Account Suspended", "phone": None}
        return {
            "id": obj.landlord_id,
            "name": obj.contact_name,
            "phone": obj.contact_phone,
        }

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
    bedrooms = serializers.IntegerField(min_value=0, max_value=5)
    property_type = serializers.ChoiceField(
        choices=[c[0] for c in House.PROPERTY_TYPE_CHOICES], default="apartment"
    )
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
    # Accepted in the same {lat, lng} shape the create serializer uses, so the
    # landlord can move the pin when editing.
    coordinates = serializers.DictField(child=serializers.FloatField(), required=False)
    # Per-listing contact — may be a caretaker rather than the account owner.
    landlord = serializers.DictField(child=serializers.CharField(), required=False)

    class Meta:
        model = House
        fields = [
            "title", "location", "description", "price",
            "units", "bedrooms", "property_type", "available",
            "images", "video", "coordinates", "landlord",
        ]

    def validate_coordinates(self, value):
        if "lat" not in value or "lng" not in value:
            raise serializers.ValidationError("coordinates must have lat and lng.")
        return value

    def validate_landlord(self, value):
        if "name" not in value or "phone" not in value:
            raise serializers.ValidationError("landlord must have name and phone.")
        return value

    def update(self, instance, validated_data):
        # `video` is absent when untouched and explicitly None when the
        # landlord removed it — those mean different things, so check for the
        # key before popping it.
        video_provided = "video" in validated_data
        video_url = validated_data.pop("video", None)
        images_data = validated_data.pop("images", None)
        coordinates = validated_data.pop("coordinates", None)
        landlord_data = validated_data.pop("landlord", None)

        # 1. Standard house fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # 2. Location
        if coordinates is not None:
            instance.latitude = coordinates["lat"]
            instance.longitude = coordinates["lng"]

        # 3. Contact shown to tenants
        if landlord_data is not None:
            instance.contact_name = landlord_data["name"]
            instance.contact_phone = landlord_data["phone"]

        instance.save()

        # 4. Images — reconcile against the submitted list.
        #    Deleting a HouseImage row fires post_delete, which removes the
        #    file from S3. So rows the landlord kept must NOT be deleted and
        #    recreated: that would destroy the file they wanted to keep and
        #    leave the new row pointing at a dead URL.
        if images_data is not None:
            keep = set(images_data)

            for img in instance.images.all():
                if img.url not in keep:
                    img.delete()  # dropped by the landlord -> also remove from S3

            existing = {img.url: img for img in instance.images.all()}
            for i, url in enumerate(images_data):
                img = existing.get(url)
                if img is None:
                    HouseImage.objects.create(house=instance, url=url, order=i)
                elif img.order != i:
                    img.order = i
                    img.save(update_fields=["order"])

        # 5. Video — set, replace, or clear
        if video_provided:
            existing = HouseVideo.objects.filter(house=instance).first()
            if existing and existing.url != video_url:
                existing.delete()         # signal fires -> S3 object removed
                existing = None
            if video_url and not existing:
                HouseVideo.objects.create(house=instance, url=video_url)

        return instance