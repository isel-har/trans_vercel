from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import BlackListSerializer
from auth_api.decorators import BlackListToken
from auth_api.models import User
from .models import BlackList
from friends.models import FriendShip
from django.shortcuts import get_object_or_404
from django.db.models import Q
from notifications.views import send_request_notification
# from friends.serializers import FriendSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def show_blacklist(request):
  
    user = request.user
    blacklist = user.blacklist.all()
    serialize = BlackListSerializer(instance=blacklist, many=True)
    
    return Response(serialize.data, status=200)



def add_ban(user, to_ban):
    # try:
    ban, created = BlackList.objects.get_or_create(user=user, blocked_username=to_ban.username, blocked_id=to_ban.id)

    ban_data = BlackListSerializer(ban).data
    if created:
        friendship = FriendShip.objects.filter((Q(sender=user) | Q(receiver=user)) & (Q(sender=to_ban) | Q(receiver=to_ban)))
        if friendship:
            friendship_id = friendship[0].id
            send_request_notification(dest=to_ban, type_='FRIEND_DEL', data={'id' : friendship_id})
            friendship.delete()
            return Response({'data' : ban_data, 'id':friendship_id}, status=201)
        
        return Response({'data': ban_data, 'id':None}, status=201) 
    
    return Response({'message' : f'{to_ban.username} already blocked'})


def delete_ban(user, to_ban):

    ban = BlackList.objects.filter(user=user, blocked_username=to_ban.username, blocked_id=to_ban.id)
    if ban.exists():
        ban_data = BlackListSerializer(ban[0]).data
        ban.delete()
        return Response({'isnew' : True, 'data':ban_data})
    return Response({'isnew':False})



@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def ban_actions(request, user_id):

    user = request.user
    try:
        uid = int(user_id)
        if user.id == uid:
            return Response(data={'error' : 'connot ban yourself.'}, status=400)
        to_ban = get_object_or_404(User, id=uid)
        if request.method == 'POST':
            return add_ban(user, to_ban)
        #error :  UNIQUE constraint failed: blacklist_blacklist.blocked_id  :  IntegrityError
        if request.method == 'DELETE':
            return delete_ban(user, to_ban)
    except Exception as e:
        return Response({'error' : 'Invalid user ID'}, status=400)