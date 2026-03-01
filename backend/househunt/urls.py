# househunt/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .health import health_check
from .admin_views import site_stats

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health_check, name="health-check"),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/houses/", include("apps.houses.urls")),
    path("api/bookings/", include("apps.bookings.urls")),
    path("api/contact/", include("apps.contact.urls")),
    path("api/tenants/", include("apps.tenants.urls")),
    path("api/feedback/", include("apps.feedback.urls")),
    path("api/audit/", include("apps.audit.urls")),
    path("api/admin/stats/", site_stats, name="site-stats"),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)