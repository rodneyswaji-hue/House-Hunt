# apps/houses/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
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
            qs = House.objects.prefetch_related("images", "video").filter(landlord=request.user)
            return Response(HouseListSerializer(qs, many=True).data)

        qs = House.objects.prefetch_related("images", "video").all()
        location = request.query_params.get("location")
        bedrooms = request.query_params.get("bedrooms")
        max_price = request.query_params.get("max_price")
        available = request.query_params.get("available")

        if location:
            qs = qs.filter(location__icontains=location)
        if bedrooms is not None and bedrooms != "":
            try:
                qs = qs.filter(bedrooms=int(bedrooms))
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
        serializer = HouseCreateSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            house = serializer.save()
            return Response(HouseListSerializer(house).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticatedOrReadOnly])
def house_detail(request, pk):
    house = get_object_or_404(House.objects.prefetch_related("images", "video"), pk=pk)

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