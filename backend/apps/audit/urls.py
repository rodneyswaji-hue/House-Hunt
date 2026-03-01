# apps/audit/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("", views.audit_log_list, name="audit-log-list"),
]