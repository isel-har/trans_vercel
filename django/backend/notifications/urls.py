from django.urls import path
from . import views

urlpatterns = [
    # path('', views.get_notifications),
    # path('mark_read/', views.read_notification),
    path('settings', views.notification_settings),
]
