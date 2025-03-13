from rest_framework.decorators import permission_classes, api_view
from rest_framework.permissions import IsAuthenticated
from channels.layers import get_channel_layer
from rest_framework.response import Response
from asgiref.sync import async_to_sync
from auth_api.decorators import BlackListToken
# from django.utils import timezone



def send_request_notification(dest=None, type_="FRIEND_REQUEST_CREATE", data=None):
    try:
        message = data
        message['type'] = type_
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(dest.username, {
            'type': 'push_notification',
            'data': message,
        })
    except:
        print('error in sending request.')


def str_to_boolean(s):
    return s.lower() == 'true'

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def notification_settings(request):
    
    try:
        user = request.user
        alert = request.GET.get('alerts')
        messages = request.GET.get('messages')

        changed = False
        if alert and alert.lower() in ('true','false') and (str_to_boolean(alert) != user.enable_alerts):
            user.enable_alerts = str_to_boolean(alert)
            changed = True

        if messages and messages.lower() in ('true','false') and (str_to_boolean(messages) != user.enable_chat_msg):
            user.enable_chat_msg= str_to_boolean(messages)
            changed = True
  
        if changed: #to query database once
            user.save()
        
        return Response({'detail' : 'settings applied successfuly'}, status=200)
    except Exception as e:
        return Response({'detail' : f'{e}'})
    

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# @BlackListToken.is_blacklisted
# def read_notification(request):
#     try:
#         user = request.user
#         data = request.data
#         if data and 'ids' in data and isinstance(data['ids'], list):

#             if not all(isinstance(n, int) for n in data['ids']):
#                 raise Exception("id should be an integer")

#             ids = data['ids']
#             Notification.objects.filter(recipient=user).filter(id__in=ids).update(status='RD')

#             return Response({'detail' : 'notifications status updated'}, status=200)

#         return Response({'detail' : 'error in ids list'}, status=404)
#     except Exception as e:
#         return Response({'error' : "error"}, 404)
     