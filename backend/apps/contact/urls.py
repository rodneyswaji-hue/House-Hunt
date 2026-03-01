from django.urls import path
from . import views

urlpatterns = [
    path("", views.create_message, name="create-message"),
    path("messages/", views.list_messages, name="list-messages"),
]
