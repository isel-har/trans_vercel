from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from channels.layers import get_channel_layer
from rest_framework.response import Response
from blacklist.models import BlackList
from asgiref.sync import async_to_sync
from .consumers import RPSGameConsumer
from django.utils import timezone
from auth_api.models import User
from django.db.models import Q
from .models import Gamex
from .serializers import GamexSerializer
from auth_api.decorators import BlackListToken



def game_data(user, title, room_name, status='pending', type='GAME_INVITE'):
    return {
        'op'   : 'dispatch',
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
        if room_name not in RPSConsumer.games:
            return Response({"detail" : "room_id not exist."}, status=404)
        
        user = request.user
        if user.id != RPSConsumer.games[room_name]['dest']:
            return Response({"detail" : "cannot join this room."}, status=403)
        
        if RPSConsumer.games[room_name]['status'] == 1:
            return Response({"detail" : 'invite already accepted.'}, status=400)
        
        src_name = RPSConsumer.games[room_name]['src_name']
        if request.method == 'PUT':
            message = "game accepted."
            RPSConsumer.games[room_name]['status'] = 1
            invite_notification(src_name, game_data(user, f"{user.username} accepted the game.", room_name, 'accepted', 'GAME_ACCEPTED'))
        else:
            message = "game declined."
            invite_notification(src_name, game_data(user, f"{user.username} declined the game.", room_name, 'declined', 'GAME_DECLINED'))
            RPSConsumer.games[room_name]['status'] = 2
        return Response({'detail' : message})
    except:
        return Response({'detail' : 'failed to accepted or declined the game.'}, status=404)

def set_result(data, current_user):
    opponent = None
    for n in data:
        opponent = n['winner']['username'] if current_user == n['loser']['id'] else n['loser']['username']
        n['opponent'] = opponent
        n['result'] = 'Win' if n['winner']['id'] ==  current_user else 'Loss'
    return data

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def games_history(request):
    try:
        query = request.GET.get("dest")
        dest = None if query == None else int(query)

        if dest == None:
            user = request.user
        elif request.user.id == dest:
            user = request.user
        else:
            user = User.objects.get(id=dest)

        games = Game.objects.filter((Q(winner=user) | Q(loser=user)))
        data = GameSerializer(games, many=True).data
        data = set_result(data, user.id)
        return Response({'data' : data})
    except Exception as e :
        print(str(e))
        return Response({'detail' : f'{query} not found.'}, status=404)