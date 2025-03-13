from auth_api.views import  token_request
from friends.views import search_users
from django.urls import path, include
from .media_view import serve_media
# from django.contrib import admin
import auth_api.user_info

urlpatterns = [
    # path('admin/', admin.site.urls),
    path('media/<path:path>', serve_media),
    path('api/auth/', include('auth_api.urls')),
    # path('api/OAuth2/', oauth, name="Oauth"),
    path('api/token-request/', token_request),
    path('api/profile/', auth_api.user_info.get_profil),
    path('api/me/', auth_api.user_info.get_me),
    path('api/score/', auth_api.user_info.get_score),
    path('api/friends/', include('friends.urls')),
    path('api/ban/', include('blacklist.urls')),
    path('api/search', search_users),
    path('api/game/', include('game.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/tournament/', include('tournament.urls')),
    path('api/gamex/', include('gamex.urls')),
]
