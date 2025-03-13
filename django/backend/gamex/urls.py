from django.urls import path
from . import views

urlpatterns = [
    path('update', views.update_invite),
    path('history', views.games_history),
    # path('leaderboard/', views.leaderboard),
]