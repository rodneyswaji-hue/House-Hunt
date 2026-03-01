# apps/audit/models.py
from django.db import models
from django.contrib.auth import get_user_model


class AuditLog(models.Model):
    ACTION_CHOICES = [
        ("ban_landlord", "Banned Landlord"),
        ("unban_landlord", "Unbanned Landlord"),
        ("delete_house", "Deleted House"),
        ("approve_feedback", "Approved Feedback"),
        ("reject_feedback", "Rejected Feedback"),
        ("delete_tenant", "Deleted Tenant"),
        ("delete_feedback", "Deleted Feedback"),
        ("other", "Other"),
    ]

    # Who performed the action — stored as string in case user is deleted
    performed_by = models.CharField(max_length=150)
    performed_by_id = models.IntegerField(null=True, blank=True)

    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    target_model = models.CharField(max_length=100)   # e.g. "Landlord", "House"
    target_id = models.IntegerField(null=True, blank=True)
    target_repr = models.CharField(max_length=255)    # human-readable, e.g. landlord name
    notes = models.TextField(blank=True)              # e.g. ban reason
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "audit_logs"
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.performed_by} → {self.action} on {self.target_repr}"


def log_action(performer, action, target_model, target_id, target_repr, notes=""):
    """Helper to create an audit log entry from anywhere in the codebase."""
    AuditLog.objects.create(
        performed_by=str(performer),
        performed_by_id=getattr(performer, "id", None),
        action=action,
        target_model=target_model,
        target_id=target_id,
        target_repr=target_repr,
        notes=notes,
    )