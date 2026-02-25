# apps/houses/urls.py
from django.urls import path
from . import views
from .upload import generate_upload_url

urlpatterns = [
    path("", views.house_list_create, name="house-list-create"),
    path("upload-url/", generate_upload_url, name="upload-url"),
    path("<int:pk>/", views.house_detail, name="house-detail"),
]         

