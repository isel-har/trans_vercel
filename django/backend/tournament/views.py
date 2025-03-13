from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from channels.layers import get_channel_layer
from rest_framework.response import Response # type: ignore
from .serializers import TourSerializer
from game.consumers import GameConsumer 
from asgiref.sync import async_to_sync
from django.utils import timezone
from .models import Tournament
from auth_api.decorators import BlackListToken

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def create_tournament(request):
    try:
        user = request.user
        name = request.data.get("name")
        if not name:
            return Response({"detail": "Tournament name is required."}, status=400)

        tour, created = Tournament.objects.get_or_create(name=name, creator_id=user.id, creator_name=user.username)
        if created:
            tour.players.add(user)
            msg = TourSerializer(instance=tour).data
        else:
            msg = f"Tournament '{name}' already exists."
        return Response({"detail": msg}, status=200)
    except Exception as e:
        return Response({"detail": str(e)}, status=400)


def broadcast_message(msg_code, tournament, last, sorted_names):

    username = "player" if msg_code == 4 else last.username
    cases = {
        1 : ["waiting", f'{username} has just joined to (room#{tournament.id}), {tournament.name}.', 'MEMBER_JOINED'],
        2 : ["waiting", f'{username} has just left (room#{tournament.id}), {tournament.name}.', 'MEMEBER_LEFT'],
        3 : ["cancled", f'The tournament (room#{tournament.id}), {tournament.name} has cancled by the creator {username}', 'TOURNAMENT_CANCLED'],
        4 : ["start", "Tournament is ready lock to start the game.", 'TOURNAMENT_READY'],
    }
    data = {
        "id"      : tournament.id,
        "status"  : cases[msg_code][0],
        "name"    : tournament.name,
        "bracket" : {
                "round_1": {
                    "group_1" : [sorted_names[0], sorted_names[1]],
                    "group_2" : [sorted_names[2], sorted_names[3]],
                },
                "round_2" : {
                    "group_3" : None    
                }
            }
    }
    if msg_code in [1, 2]:
        data['player'] = {"id" : last.id, "username" : username, 'status' : last.status, "action" : cases.get(msg_code)[2] }

    broadcast_msg  = {"op":"dispatch", "type": "TR", "data": data, "id":None, "title": cases.get(msg_code)[1], "status": None}
    broadcast_msg['timestamp'] = str(timezone.now())
    return broadcast_msg



def generate_tournament_rooms(players, tournament, sorted_names):
    try:
        GameConsumer.tournaments[tournament.id] = {}
        data = {
            'all' : list(players),
            'tournament' : tournament,
            'players' : [], # fchk
            'name' : tournament.name,
            'game_state' : None,
            'first_round_queue': [],
            'final_round_players' : [],
            'final_queue' : [],
            'first_group' : [[sorted_names[0], sorted_names[1]], False],
            'second_group' : [[sorted_names[2], sorted_names[3], False]]
        }
        GameConsumer.tournaments[tournament.id] = data
    except Exception as e:
        print("error in generating rooms for tournament : ", str(e))


def broadcast_all_members(members, last, data):
    channel_layer = get_channel_layer()
    for member in members:
        if member.username != last.username:
            async_to_sync(channel_layer.group_send)(member.username, {
                'type' : 'push_notification',
                'data' : data
            }) 
    
    
def groups_manager(tournament, last, action, sorted_names):
    try:
        if action == 0:
            return

        players = tournament.players.all()
        channel_layer = get_channel_layer()
        data = broadcast_message(action, tournament, last, sorted_names)
        
        if action != 4:
            broadcast_all_members(players, last, data)
            return

        generate_tournament_rooms(players, tournament, sorted_names)
        for n in range(0, 4):
            async_to_sync(channel_layer.group_send)(players[n].username, {
                    'type' : 'push_notification',
                    'data' : broadcast_message(4, tournament, last, sorted_names)})
    except Exception as e:
        print(f"error in group manager : {str(e)}")



def lobby__message(tournament, user):
    players = tournament.players.all()
    lobby_data = {'data':{
            'tournament' : tournament.id,
            'name' : tournament.name,
            'players' : [{
                'username' : p.username,
                'avatar' : p.avatar,
                'status' : p.status
            } for p in players if p.id != user.id],
        },
        'timestamp' : str(timezone.now()),
        'title' : f'{user.username} joined {tournament.name} successfuly..',
    }
    return lobby_data


def update_bracket(players):
    sorted_players = sorted(players, key=lambda obj : obj.username)
    players_name = []
    size = len(sorted_players)
    for n in range(0, 4):
        if n < size:
            players_name.append(sorted_players[n].username)
        else:
            players_name.append('')
    return players_name


@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def join_or_leave(request, tour_id):
    try:
        user = request.user
        tournament = Tournament.objects.get(id=int(tour_id))
        
        if tournament.status == 'start':
            return Response({'error' : 'tournament alreayd started'}, status=403)

        
        if request.method == 'GET':
            if tournament.players.count() == 4:
                return Response({"detail" : "tournament room is full."}, status=400)
            if user in tournament.players.all():
                return Response({"detail" : "You have already joined this tournament."}, status=400)
            tournament.players.add(user)
            sorted_names = update_bracket(tournament.players.all())
            groups_manager(tournament, user, 1, sorted_names)
            msg = lobby__message(tournament, user)
        else:
            if user not in tournament.players.all():
                return Response({"detail" : "You are not joined to this tournament."}, status=401)
            if user.id == tournament.creator_id:
                msg = f"{tournament.name} is canceled." if int(tour_id) not in GameConsumer.tournaments else "you cannot cancle the tournament."
                action = 3 if int(tour_id) not in GameConsumer.tournaments else 0
            else:
                msg = f"You have left {tournament.name}."
                action = 2
                tournament.players.remove(user)
            sorted_names = update_bracket(tournament.players.all())
            groups_manager(tournament, user, action, sorted_names)
            if action == 3:
                tournament.delete()

        return Response({"detail" : msg})
    except Exception as e:
        print(str(e)) # for debuggin
        return Response({"detail" : "invalid tournament id or unexisted."}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def start_tournament(request, tour_id):
    try:
        tr_id = int(tour_id)
        tournament = Tournament.objects.get(id=int(tr_id))
        
        if tournament.creator_id != request.user.id:
            return Response({"detail" : "leader only can start the tournament."})
        
        if tr_id in GameConsumer.tournaments:
            return Response({'detail' : 'tournament already started'})

        if tournament.players.count() == 4:
            leader = tournament.players.all()[0]
            sorted_names = update_bracket(tournament.players.all())
            groups_manager(tournament, leader, 4, sorted_names)
            tournament.status = 'start'
            tournament.save(update_fields=['status'])
            return Response({"detail" : "the game starts now."})

        return Response({"detail" : "tournament must have 4 participants."}, status=400)
    except Exception as e:
        print(f"error : {str(e)}")
        return Response({"detail" : "invalid tournament id or unexisted."}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def get_tournament_lobby(request, tour_id):
    try:
        user = request.user
        tournament = Tournament.objects.get(id=int(tour_id))
        serialize = TourSerializer(instance=tournament)
        data = serialize.data
        if user in tournament.players.all():
             data['is_joined'] = True 
        return Response({'data' : data})
    except:
        return Response({'detail' : 'tournemant lobby not found'}, status=404)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def all_tournaments(request):
    try:
        user = request.user
        tours = Tournament.objects.all() 
        data = TourSerializer(tours, many=True).data
        for n in data:
            
            n['is_joined'] = False
            for p in n['players']:
                if user.id == p['id']:
                    n['is_joined'] = True
                    break

        return Response({"data" : data})
    except:
        return Response({"detail" : "error"}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def get_bracket(request, tour_id):
    try:
        tournament = Tournament.objects.get(id=int(tour_id))
        user = request.user
        serialize = TourSerializer(instance=tournament)
        data = serialize.data
        if user in tournament.players.all():
             data['is_joined'] = True 
        data['creator_name'] = tournament.creator_name
        sorted_names = update_bracket(tournament.players.all())
        data['bracket'] = {
                "round_1": {
                    "group_1" : [sorted_names[0], sorted_names[1]],
                    "group_2" : [sorted_names[2], sorted_names[3]],
                },
                "round_2" : {
                    "group_3" : None    
                }
        }
        return Response({"data" : data})
    except Exception as e:
        return Response({'detail' : 'tournament bracket not found.'}, status=404)