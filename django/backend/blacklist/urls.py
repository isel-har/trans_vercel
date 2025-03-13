from django.urls import path
from . import views


urlpatterns = [
    path('', views.show_blacklist, name="blacklist"),
    path('<str:user_id>/', views.ban_actions, name="ban-actions")
]
