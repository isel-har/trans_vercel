from rest_framework_simplejwt.authentication import JWTAuthentication
from auth_api.decorators import BlackListToken 
from channels.middleware import BaseMiddleware
from asgiref.sync import sync_to_async
from auth_api.models import User

def get_authorized_user(query):

    if query and '=' in query:
        try:
            token = query.split('=')[1]
            jwt_authentication = JWTAuthentication()
            validated_token = jwt_authentication.get_validated_token(token)
            user_id = validated_token.payload.get('user_id')
            BlackListToken.check_token(user_id, token, True)
            user = User.objects.get(id=user_id)
            return user
        except Exception as e:
            print(f'Authorization error in ws middlware')
            return None
    return None


def get_room_query(query_string):
    try:
        if  query_string == "":
            return [None, None, None]
        user = None
        room_id = ""

        if '&' not  in query_string:
            return  [None, get_authorized_user(query_string), None]
        queries = query_string.split('&')
        if '=' in queries[0]:
            room_id  = queries[0].split('=')[1]
            user     = get_authorized_user(queries[1])

        is_tour = None
        # board   = 0
        if len(queries) == 3:
        
            if '=' in queries[2]:
                is_tour = queries[2].split('=')[1]#if queries[2].split('=')[0] == 'tr' else None

        return [room_id, user, is_tour]
    except:
        return [None, None, None]


class RouteMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        try:

            if scope["type"] == "websocket":
                websocket_path = scope["path"]
                valid_paths = {
                    "/ws/notifications",
                    "/ws/game",
                    "/ws/chat",
                    "/ws/rps",
                }
                if websocket_path not in valid_paths:
                    raise
                query = scope['query_string'].decode("UTF-8")

                params = None
                if websocket_path == "/ws/game":
                    params = await sync_to_async(get_room_query)(query)
                    scope["user"] = params[1]
                    scope["room_name"] = params[0]
                    scope["is_tournament"] = params[2]
                else:
                    scope["user"] = await sync_to_async(get_authorized_user)(query)
            return await super().__call__(scope, receive, send)
        except:
            print("Invalid websocket path or unauthorized.")
