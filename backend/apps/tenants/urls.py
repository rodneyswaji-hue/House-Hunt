# apps/tenants/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register, name="tenant-register"),
    path("login/", views.login, name="tenant-login"),
    path("me/", views.me, name="tenant-me"),
]