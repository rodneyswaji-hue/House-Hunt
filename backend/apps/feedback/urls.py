# apps/feedback/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("reviews/", views.submit_review, name="submit-review"),
    path("reviews/pending/", views.pending_reviews, name="pending-reviews"),
    path("reviews/<int:pk>/action/", views.review_action, name="review-action"),
    path("reviews/landlord/<int:landlord_id>/", views.landlord_reviews, name="landlord-reviews"),
    path("contact/", views.submit_contact, name="submit-contact"),
    path("contact/messages/", views.contact_messages, name="contact-messages"),
    path("contact/messages/<int:pk>/", views.contact_message_action, name="contact-message-action"),
]