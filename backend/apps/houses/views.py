# apps/houses/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.accounts.models import Landlord
from .models import House
from .serializers import HouseListSerializer, HouseCreateSerializer, HouseUpdateSerializer


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticatedOrReadOnly])
def house_list_create(request):
    if request.method == "GET":
        # If ?mine=true, return only the authenticated landlord's houses
        if request.query_params.get("mine") == "true":
            if not request.user.is_authenticated:
                return Response({"detail": "Authentication required."}, status=401)
            # A tenant token is authenticated but owns no properties —
            # filtering on it raises a ValueError, so answer explicitly.
            if not isinstance(request.user, Landlord):
                return Response({"detail": "Not a landlord account."}, status=403)
            qs = House.objects.select_related("landlord").prefetch_related("images", "video").filter(landlord=request.user)
            return Response(HouseListSerializer(qs, many=True).data)

        qs = House.objects.select_related("landlord").prefetch_related("images", "video").all()
        location = request.query_params.get("location")
        bedrooms = request.query_params.get("bedrooms")
        property_type = request.query_params.get("property_type")
        max_price = request.query_params.get("max_price")
        available = request.query_params.get("available")

        if location:
            qs = qs.filter(location__icontains=location)
        if property_type:
            valid = {c[0] for c in House.PROPERTY_TYPE_CHOICES}
            # Accept a comma-separated list so the UI can offer multi-select
            # later without another API change.
            wanted = [t for t in property_type.split(",") if t in valid]
            if wanted:
                qs = qs.filter(property_type__in=wanted)
        if bedrooms is not None and bedrooms != "":
            # Treated as "at least N" — someone who needs 3 bedrooms is still
            # served by a 4-bedroom listing. 0 means "any", so it is a no-op.
            try:
                beds = int(bedrooms)
                if beds > 0:
                    qs = qs.filter(bedrooms__gte=beds)
            except ValueError:
                pass
        if max_price:
            try:
                qs = qs.filter(price__lte=int(max_price))
            except ValueError:
                pass
        if available is not None and available != "":
            qs = qs.filter(available=available.lower() == "true")

        serializer = HouseListSerializer(qs, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        # Only landlord accounts own properties — a tenant token would blow up
        # in the serializer when it assigns House.landlord.
        if not isinstance(request.user, Landlord):
            return Response({"detail": "Only landlord accounts can list properties."}, status=403)
        serializer = HouseCreateSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            house = serializer.save()
            return Response(HouseListSerializer(house).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticatedOrReadOnly])
def house_detail(request, pk):
    house = get_object_or_404(
        House.objects.select_related("landlord").prefetch_related("images", "video"), pk=pk
    )

    if request.method == "GET":
        return Response(HouseListSerializer(house).data)

    if not request.user.is_authenticated:
        return Response({"detail": "Authentication required."}, status=401)
    if house.landlord != request.user:
        return Response({"detail": "You do not own this property."}, status=403)

    if request.method == "PATCH":
        serializer = HouseUpdateSerializer(house, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            house.refresh_from_db()
            return Response(HouseListSerializer(house).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        house.delete()
        return Response({"message": "Property deleted."}, status=status.HTTP_200_OK)