from django.urls import path
from . import views


urlpatterns = [
    path("list/", views.all_tournaments),
    path("create/", views.create_tournament),
    path("<str:tour_id>/", views.join_or_leave),
    path("start/<str:tour_id>/", views.start_tournament),
    path("get/<str:tour_id>/", views.get_tournament_lobby),
    path("bracket/<str:tour_id>/", views.get_bracket),
]
