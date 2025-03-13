# from notifications.views import send_request_notification
# from blacklist.models import BlackList
# from notifications.consumers import NotificationConsumer
# from django.shortcuts import get_object_or_404
from auth_api.serializers import LeaderBoardSerializer, UserSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from channels.layers import get_channel_layer
from rest_framework.response import Response
from .serializers import GameSerializer
from asgiref.sync import async_to_sync
from .consumers import GameConsumer
from django.utils import timezone
from auth_api.models import User
from django.db.models import Q
from auth_api.decorators import BlackListToken
from .models import Game


def game_data(user, title, room_name, status='pending', type='GAME_INVITE'):
    return {
        'type' : type,
        'data' : {
            'inviter' : {
                'uid'  : user.id,
                'username' : user.username,
                'avatar'   : user.avatar,
                'status'   : user.status,
            },
            'room_name' : room_name,
            'status'    : status
        },
        'id' : None,
        "timestamp": str(timezone.now()),
        'title': title,
        'status' : None
    }

def invite_notification(dest, data):
    
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(dest, {
        'type' : 'push_notification',
        'data' : data
    }) 


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def update_invite(request):
    try:
        room_name = request.GET.get('room_id')
        if room_name not in GameConsumer.games:
            return Response({"detail" : "room_id not exist."}, status=404)
        
        user = request.user
        if user.id != GameConsumer.games[room_name]['dest']:
            return Response({"detail" : "cannot join this room."}, status=403)
        
        if GameConsumer.games[room_name]['status'] == 1:
            return Response({"detail" : 'invite already accepted.'}, status=400)
        
        src_name = GameConsumer.games[room_name]['src_name']
        if request.method == 'PUT':
            message = "game accepted."
            GameConsumer.games[room_name]['status'] = 1
            invite_notification(src_name, game_data(user, f"{user.username} accepted the game.", room_name, 'accepted', 'GAME_ACCEPTED'))
        else:
            message = "game declined."
            invite_notification(src_name, game_data(user, f"{user.username} declined the game.", room_name, 'declined', 'GAME_DECLINED'))
            GameConsumer.games[room_name]['status'] = 2
        return Response({'detail' : message})
    except:
        return Response({'detail' : 'failed to accepted or declined the game.'}, status=404)


def set_result(data, current_user):

    opponent = None
    for n in data:
        opponent = n['winner'] if current_user == n['loser']['id'] else n['loser']
        n['opponent'] = opponent['username']
        n['opponent_avatar'] = opponent['avatar']
        n['result'] = 'Win' if n['winner']['id'] ==  current_user else 'Loss'
    return data


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def games_history(request):
    try:
        query_1 = request.GET.get("dest")
        query_2 = request.GET.get("type")  

        dest = None if query_1 in (None, "") else int(query_1)
        if dest == None:
           return Response({"error" : "dest param required"}, status=400)
        else:
            user = User.objects.get(id=dest)

        game_type = 'pong' if query_2 in (None, "") else query_2
        if game_type not in ('pong', 'rps'):
            game_type = 'pong'

        games = Game.objects.filter((Q(winner=user) | Q(loser=user)) & Q(game_type=game_type))
        # if not games.exists():
        #     return Response({'data' : []})

        data = GameSerializer(games, many=True).data
        data = set_result(data, user.id)

        return Response(data)
    except Exception as e :
        print(str(e))
        return Response({'detail' : 'queries not found.'}, status=404)

@api_view(['GET'])
def leaderboard(request):
    try:
        users = User.objects.select_related('score').all().order_by('-score__total_xp')
        leaderboard_data = LeaderBoardSerializer(users, many=True).data
        return Response({'data' : leaderboard_data})
    except Exception as e :
        print(str(e))
        return Response({'detail' : 'bad request'}, status=400)