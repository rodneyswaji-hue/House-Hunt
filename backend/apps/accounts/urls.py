# apps/accounts/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),
    path("me/", views.me, name="me"),
    path("forgot-password/", views.forgot_password, name="forgot-password"),
    path("verify-otp/", views.verify_otp, name="verify-otp"),
    path("reset-password/", views.reset_password, name="reset-password"),

    # Admin dashboard
    path("landlords/", views.landlord_list, name="landlord-list"),
    path("landlords/<int:pk>/action/", views.landlord_action, name="landlord-action"),
]