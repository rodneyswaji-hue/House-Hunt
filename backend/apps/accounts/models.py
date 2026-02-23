# apps/accounts/models.py
import random
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone


class LandlordManager(BaseUserManager):
    def create_user(self, phone, name, password=None, **extra_fields):
        if not phone:
            raise ValueError("Phone number is required")
        landlord = self.model(phone=phone, name=name, **extra_fields)
        landlord.set_password(password)
        landlord.save(using=self._db)
        return landlord

    def create_superuser(self, phone, name, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(phone, name, password, **extra_fields)


class Landlord(AbstractBaseUser, PermissionsMixin):
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, unique=True)
    email = models.EmailField(blank=True, null=True)

    # OTP for password reset
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = ["name"]

    objects = LandlordManager()

    class Meta:
        db_table = "landlords"
        verbose_name = "Landlord"
        verbose_name_plural = "Landlords"

    def __str__(self):
        return f"{self.name} ({self.phone})"

    def generate_otp(self):
        """Generate a 6-digit OTP and save it with a timestamp."""
        self.otp = str(random.randint(100000, 999999))
        self.otp_created_at = timezone.now()
        self.save(update_fields=["otp", "otp_created_at"])
        return self.otp

    def verify_otp(self, submitted_otp: str) -> bool:
        """Returns True if OTP matches and is less than 10 minutes old."""
        if not self.otp or not self.otp_created_at:
            return False
        age = (timezone.now() - self.otp_created_at).total_seconds()
        if age > 600:  # 10 minutes
            return False
        return self.otp == submitted_otp

    def clear_otp(self):
        self.otp = None
        self.otp_created_at = None
        self.save(update_fields=["otp", "otp_created_at"])