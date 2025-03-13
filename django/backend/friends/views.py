from rest_framework.decorators import api_view, permission_classes
from notifications.views import send_request_notification
from rest_framework.permissions import IsAuthenticated
from notifications.views import send_request_notification
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from auth_api.models import User
from .models import FriendShip
from django.db.models import Q
from blacklist.models import BlackList
from auth_api.decorators import BlackListToken
from .serializers import SearchSerializer
from .serializers import FriendSerializer
from .utils import update_friends_list 


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def all_friends(request):
    try:
        user = request.user
        friends = FriendShip.objects.filter(Q(sender=user) | Q(receiver=user)).select_related('sender', 'receiver')
        serializer = FriendSerializer(friends, many=True, context={'user': user})
        return Response(serializer.data, status=200)
    except:
        return Response({'error' : 'not found'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def add_friend(request, friend_id):
    user = request.user
    try:
        friendID = int(friend_id)
        if friendID == user.id:
            return Response({'error': 'cannot send friend request to yourself'}, status=403)

        friend = get_object_or_404(User, id=friendID)
        bans = BlackList.objects.filter(
            (Q(user=user) & Q(blocked_id=friendID)) |
            (Q(user=friend) & Q(blocked_id=user.id))
        )
        if bans.exists():
            return Response({'error': 'cannot send a friend request'}, status=403)

        friendship = FriendShip.objects.filter((Q(sender=user) | Q(receiver=user)) & (Q(sender=friend) | Q(receiver=friend)))

        if not friendship.exists():
            friendship = FriendShip.objects.create(sender=user, receiver=friend)
            data = FriendSerializer(friendship, context={'user': friend}).data
            send_request_notification(dest=friend, data=data)
            data = FriendSerializer(friendship, context={'user': user}).data 
            return Response(data, status=201)

        data = FriendSerializer(friendship[0], context={'user': user}).data
        return Response(data, status=200)

    except Exception as e:
        status = 400
        if type(e).__name__ == 'Http404':
            status = 404
        return Response({'error': "Invalid friend ID"}, status=status)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def delete_friend(request, friendship_id):
    user = request.user
    try:
        friendship = get_object_or_404(FriendShip.objects.select_related('receiver', 'sender'), id=friendship_id)

        if user not in (friendship.receiver, friendship.sender):
            return Response({'error': 'Not authorized to delete this friendship'}, status=403)

        friendship.delete()
        
        friend = friendship.sender if user != friendship.sender else friendship.receiver
        send_request_notification(dest=friend, type_='FRIEND_DEL', data={'id' : int(friendship_id)})
        return Response({'id': int(friendship_id)}, status=200)
    except FriendShip.DoesNotExist:
        return Response({'error': 'Friendship does not exist'}, status=404)
    except:
        return Response({'error': 'An error occurred'}, status=400)



@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def accept_request(request, friendship_id):
    user = request.user
    try:
        friendship = get_object_or_404(FriendShip.objects.select_related('receiver', 'sender'), id=friendship_id)

        if user not in (friendship.receiver, friendship.sender):
            return Response({'error': 'Not authorized to delete this friendship'}, status=403)

        if friendship.status == 'accepted':
            return Response({'detail' : "Friendship already accepted."}, status=200)

        sender = friendship.sender
        friendship.status = 'accepted'
        friendship.save(update_fields=['status'])
        
        
        data_ = FriendSerializer(friendship, context={'user':sender}).data
        send_request_notification(sender, 'FRIEND_ADD', data_)

        update_friends_list(sender, user) # update friends 

        data = FriendSerializer(friendship, context={'user':user}).data
        return Response(data, status=201)
    except Exception as e:    
        return Response(data={'detail' : "friendship not found"}, status=404)

##  ----------Add them to handle Realtime
        # friend_list = NotificationConsumer.friends_dict.get(user.id, set())
        # friend_list.add(sender.username)
        # friend_list = NotificationConsumer.friends_dict.get(sender.id, set())
        # friend_list.add(user.username)


@api_view(['GET'])
def search_users(request):
    
    try:
        index = int(request.GET.get('index', 0))
    except:
        Response({"error" : "invalid index"}, status=400)
    try:
        query = request.GET.get('query', "")
    
        users  = User.objects.filter(username__startswith=query).values('id', 'username', 'avatar')[index:10 + index]
        results = SearchSerializer(users, many=True)

        return Response(data=results.data, status=200)
    except Exception as e:
        print("error : ", type(e).__name__)
        return Response({'error': 'error'}, status=400)
