from django.urls import path
from . import views

urlpatterns = [
    path('<str:id>', views.get_messages),
]
