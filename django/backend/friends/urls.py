from django.urls import path
from . import views

urlpatterns = [
  path('', views.all_friends),
  path('create/<str:friend_id>/', views.add_friend),
  path('delete/<str:friendship_id>/', views.delete_friend),
  path('accept/<str:friendship_id>/', views.accept_request),
]
