# apps/tenants/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class TenantManager(BaseUserManager):
    def create_user(self, identifier, name, password=None, **extra_fields):
        """identifier can be email or phone"""
        if not identifier:
            raise ValueError("Email or phone is required")
        tenant = self.model(name=name, **extra_fields)
        # Determine if identifier is email or phone
        if "@" in identifier:
            tenant.email = self.normalize_email(identifier)
        else:
            tenant.phone = identifier.strip()
        tenant.set_password(password)
        tenant.save(using=self._db)
        return tenant


class Tenant(AbstractBaseUser):
    name = models.CharField(max_length=150)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # USERNAME_FIELD is email but we handle phone in the serializer
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    objects = TenantManager()

    class Meta:
        db_table = "tenants"
        verbose_name = "Tenant"
        verbose_name_plural = "Tenants"

    def __str__(self):
        return f"{self.name} ({self.email or self.phone})"

    def get_identifier(self):
        return self.email or self.phone

    # DRF's IsAdminUser reads .is_staff on whatever is authenticated. Tenants
    # are never staff — declaring it explicitly avoids an AttributeError 500
    # on admin endpoints and keeps the answer a hard "no".
    @property
    def is_staff(self):
        return False

    @property
    def is_superuser(self):
        return False