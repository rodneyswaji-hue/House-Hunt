# apps/houses/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("", views.house_list_create, name="house-list-create"),
    path("<int:pk>/", views.house_detail, name="house-detail"),
]