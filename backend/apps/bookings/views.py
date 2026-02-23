# apps/bookings/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .serializers import BookingSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def create_booking(request):
    """
    POST /api/bookings/
    Body: { houseId: int, phone: "07XXXXXXXX" }
    """
    # Remap camelCase from frontend to snake_case
    data = {
        "house_id": request.data.get("houseId"),
        "phone": request.data.get("phone"),
    }
    serializer = BookingSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)