from notifications.views import send_request_notification
from notifications.consumers import NotificationConsumer
# from notifications.models import Notification
from rest_framework.response import Response
from blacklist.models import BlackList
from .models import FriendShip
from django.db.models import Q
# NotificationConsumer
def notif_data(user):
    return {
            "op" : "dispatch",
            "type" : "FRIEND_REMOVE",
            "data" : {
                'uid'  : user.id,
                'username' : user.username,
                'avatar'   : None,
                'status'   : None
            },
            "id": None,
            "title": None,
            "status": None
    }


def friend_request(user, friend):

    if BlackList.objects.filter((Q(user=user) & Q(banned_user_id=friend.id)) | (Q(user=friend) & Q(banned_user_id=user.id))).exists():
        return Response(data={'success':False, 'detail' : 'cannot send a friend request due to banned friendship'})

    friendship = FriendShip.objects.filter((Q(sender=user) | Q(receiver=user)) & (Q(sender=friend) | Q(receiver=friend)))

    if not friendship.exists():
        
        friendship = FriendShip.objects.create(sender=user, receiver=friend)
        send_request_notification(source=user, dest=friend, id=friendship.id, type_="FRIEND_REQUEST_CREATE")

        return Response({
            'success': True,
            'detail': f'Friend request sent to {friend.username} successfully.'}, status=201)
    else:
        return Response({'detail': f'The friend request has already sent'}, status=200)


def update_friends_list(user_1, user_2):
    
    try:
        
        friends_1 = NotificationConsumer.friends_dict.get(user_1.id, None)
        friends_2 = NotificationConsumer.friends_dict.get(user_2.id, None)
        
        if friends_1 is not None: friends_1.add(user_2.username)        
        if friends_2 is not None: friends_2.add(user_1.username)        
        
    except:
        pass
    
    
# def delete_friend(user, friend):
#     try:

#         friendships = FriendShip.objects.filter((Q(sender=user) | Q(receiver=user)) & (Q(sender=friend) | Q(receiver=friend)))

#         if friendships.exists():
#             friendships.delete()
            
#         # if not notifid:
#         #     print("hana")
#         #     raise
#         # notification = Notification.objects.get(id=notifid)
#         # if notification.target_id == user.id:
#         #     notification.delete()
#             # print(notifs[1])
#             # data = notif_data(user)

#             # send_request_notification(dest=friend, type_='FRIEND_REMOVE', data=data)
#             # data["data"]['uid'] = friend.id
#             # send_request_notification(dest=user, type_='FRIEND_REMOVE', data=data)

#             # friend_list = NotificationConsumer.friends_dict.get(user.id, set())
#             # friend_list.discard(friend.username)
#             # friend_list = NotificationConsumer.friends_dict.get(friend.id, set())
#             # friend_list.discard(user.username)        
 
#             return Response({'success': True, 'detail': 'The friend request has been deleted'}, status=200)
#         else:
#             return Response({'detail': 'No friend request matches these users'}, status=404)
#     except Exception as e:
#         print("error type: ", type(e).__name__)
#         return Response({'detail' : "not found"}, status=404)


    