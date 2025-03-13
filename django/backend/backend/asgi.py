# from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from notifications.middleware import RouteMiddleware
from django.core.asgi import get_asgi_application
import notifications.routing
import game.routing
import chat.routing
import gamex.routing
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

routes =  notifications.routing.websocket_urlpatterns + game.routing.websocket_urlpatterns + chat.routing.websocket_urlpatterns + gamex.routing.websocket_urlpatterns
application = ProtocolTypeRouter({
    'http' :  get_asgi_application(),
    'websocket' :  RouteMiddleware(URLRouter(routes))
})
