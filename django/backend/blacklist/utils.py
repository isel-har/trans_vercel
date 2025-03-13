from notifications.views import send_request_notification
# from notifications.consumers import NotificationConsumer
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from chat.consumers import  ChatConsumer
from friends.models import FriendShip
from auth_api.models  import User
from django.db.models import Q
from .models import BlackList

# def update__dicts(src_id, dst_id, action):

#     src_ban_list = ChatConsumer.ban_dict.get(src_id, set())
#     dst_ban_list = ChatConsumer.ban_dict.get(dst_id, set())
#     if action == 1:
#         src_friend_list = NotificationConsumer.friends_dict.get(src_id, set())
#         dst_friend_list = NotificationConsumer.friends_dict.get(dst_id, set())
#         src_friend_list.discard(dst_id)
#         dst_friend_list.discard(src_id)
#     if action in (1, 2):
#         src_ban_list.add(dst_id)
#         dst_ban_list.add(src_id)
#         return
#     src_ban_list.discard(dst_id)
#     dst_ban_list.discard(src_id)

def add_ban(user, uid):
    try:
        to_ban = get_object_or_404(User, id=uid)
        exists, add_ban = BlackList.objects.get_or_create(user=user, banned_user=to_ban.username, banned_user_id=uid)
        if add_ban:
            friendship = FriendShip.objects.filter((Q(sender=user) | Q(receiver=user)) & (Q(receiver=to_ban) | Q(sender=to_ban)))
            if friendship.exists():
                friendship.delete()
                # send_request_notification(dest=user, type_='FRIEND_REMOVE', data={"op": "dispatch", "type": "FRIEND_REMOVE", "user_id": to_ban.id})
                # send_request_notification(dest=to_ban, type_='FRIEND_REMOVE', data={"op": "dispatch", "type": "FRIEND_REMOVE", "user_id": user.id})
                # update__dicts(src_id=user.id, dst_id=uid, action=1)
            return Response(data={'success': True, 'detail':f'{to_ban.username} added to your blacklist.'}, status=200)
        else:
            return Response(data={'detail' : f'{to_ban.username} already added to your blacklist.'}, status=200)
    except:
        return Response({'detail' : 'not found'}, status=404)


def delete_ban(user, uid):  
    try:    
        banned = get_object_or_404(User, id=uid)
        ban = BlackList.objects.get(user=user, banned_user=banned.username)
        ban.delete()
        # update__dicts(src_id=user.id, dst_id=uid, action=0)
        return Response(data={'success' : True, 'detail': f'{banned.username} deleted from blacklist'}, status=200)
    except:
        return Response(data={'detail' : f'{banned.username} is not blacklisted'}, status=400)
