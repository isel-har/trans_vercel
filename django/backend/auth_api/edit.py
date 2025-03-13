from django.contrib.auth.hashers import check_password, make_password
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from channels.layers import get_channel_layer
from rest_framework.response import Response
from .serializers import UserSerializer
from asgiref.sync import async_to_sync
from friends.models import FriendShip
from django.conf import settings
from django.db.models import Q
from PIL import Image
import os
from .decorators import BlackListToken   

def broadcast_changes(user, type_=None):
    
    friends_list = FriendShip.objects.filter(Q(sender=user) | Q(receiver=user)).exclude(sender=user).values_list('sender__username', flat=True).union(FriendShip.objects.filter(
                Q(sender=user) | Q(receiver=user)
                ).exclude(receiver=user).values_list('receiver__username', flat=True))
    
    data = {
        'op'   : 'dispatch',
        'type' : f'{type_}_UPDATED', 
        'user': {
            'uid'      : user.id,
            'username' : user.username if type_ == 'USERNAME' else None, ## true_value if condition else false_value
            'avatar'   : user.avatar if type_ == 'AVATAR' else None,
            'status'   : None
            },
        'id' : None,
        'title' : None,
        'status' : None
    }    

    channel_layer = get_channel_layer()
    for friend in friends_list:
        async_to_sync(lambda : channel_layer.group_send(friend, {
            'type' : 'push_notification',
            'data': data
        }))()


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def edit_view(request):
    try:
        print("zaba!")
        attrs = [n in ['username', 'email', 'password'] for n in request.data]
        if any(attrs) == False:
            raise Exception('Invalid form.')
        user = request.user 
        # if not user.can_edit_profil():
        #     return Response({'detail' : 'you can edit after 3 days'}, status=200)

        user_data = UserSerializer(instance=user).data
        for to_edit in request.data:
            if to_edit in user_data:
                user_data[to_edit] = request.data[to_edit]
        is_pass = False
        if 'password' in request.data:

            if "new_password" not in request.data:
                return Response({'error':"new password required."}, status=422)
    
            if not check_password(request.data['password'], user.password):
                return Response({'error':"incorrect password."}, status=422)

            user_data['password'] = request.data.get('new_password')
            is_pass = True
        
        serializer = UserSerializer(data=user_data, instance=user)
        # print(serializer.data)
        data = UserSerializer(user).data
        serializer.is_valid(raise_exception=True)
        if is_pass:
            serializer.validated_data["password"] = make_password(user_data['password'])
        user = serializer.save()
        if 'username' in request.data:
            broadcast_changes(user, type_='USERNAME')

        return Response(data, status=200)
    except:
        return Response({'error' : 'invalid data.'}, status=400)



@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def change_avatar(request):
    try:
        user = request.user
        if request.method == 'PUT':
            file_system_path = os.path.join(settings.MEDIA_ROOT , "") # to change
            os.makedirs(file_system_path, exist_ok=True)

            uploaded_img = request.FILES.get('avatar')
            print("uploaded : ",uploaded_img)
            if uploaded_img:
                img = Image.open(uploaded_img)
                img_name = f'{str(user.id)}_avatar.{img.format.lower()}'
                full_path = os.path.join(file_system_path, img_name)
                img.save(full_path)
                user.avatar = f'{settings.ENDPOINT}/media/{img_name}'
                user.save(update_fields=['avatar'])
                broadcast_changes(user, type_='AVATAR')
                data = UserSerializer(user).data
                return Response(data, status=200)
            return Response({'error': 'cannot upload the avatar'}, status=400)
        else:
            user.avatar = "https://github.com/shadcn.png"
            user.save(update_fields=['avatar'])
            broadcast_changes(user, type_='AVATAR')
            data = UserSerializer(user).data
            return Response(data, status=200)
    except Exception as e:
        print("error :", str(e))
        return Response({'success':False, 'detail': 'cannot upload the avatar'}, status=400)