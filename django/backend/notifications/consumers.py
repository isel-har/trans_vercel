from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from friends.models import FriendShip
from django.db.models import Q
from friends.serializers import SearchSerializer
import asyncio
import json

class NotificationConsumer(AsyncWebsocketConsumer):

    friends_dict = {}
    friends_dict_lock = asyncio.Lock()

    async def connect(self):
        try:
            self.friends_list = []
            self.user = self.scope["user"]
            self.status = 0
            if self.user is None:
                self.status = 1
                return await self.close()

            self.user_json = await sync_to_async(lambda: SearchSerializer(self.user).data)()
            await self.accept()
            await self.channel_layer.group_add(self.user.username, self.channel_name)

            self.friends_list = await sync_to_async(self.get_friends_list)()
            async with self.friends_dict_lock:
                if self.user.id not in self.friends_dict:  
                    self.friends_dict[self.user.id] = self.friends_list

        except Exception as e:
            print(f'Error in connecting :{str(e)}')


    def get_friends_list(self):
        friends = FriendShip.objects.filter(Q(sender=self.user) | Q(receiver=self.user)).exclude(sender=self.user).values_list('sender__username', flat=True).union(
                FriendShip.objects.filter(Q(sender=self.user) | Q(receiver=self.user)).exclude(receiver=self.user).values_list('receiver__username', flat=True))
        return set(friends)
    

    async def disconnect(self, code):
        try:
            if self.status == 1:
                return
            await self.channel_layer.group_discard(self.user.username, self.channel_name)

            if self.user.id in self.friends_dict:
                async with self.friends_dict_lock:
                    self.friends_dict.pop(self.user.id)

            if len(self.channel_layer.groups.get(self.user.username, {}).items()) == 0:
                await self.broadcast_status(status="Offline")
                self.user.status = "Offline"
                await sync_to_async(self.user.save)(update_fields=['status'])
        except Exception as e:
            print(f'Error in disconnecting: {str(e)}')


    async def   broadcast_status(self, status):
        try:
            self.user_json['status'] = status
            for fr in self.friends_list:
                to_send =  {
                    'type' : 'push_notification',
                    'data' : {
                        'type': 'FRIEND_UPDATE',
                        'id' : self.user_json.get('id'),
                        'user': self.user_json
                    }
                }
                await self.channel_layer.group_send(fr , to_send)

        except Exception as e:
            print(f"hia ra error fl broadcast : {str(e)} :", type(e).__name__)


    async def   receive(self, text_data):
        try:
            message = json.loads(text_data)
          
    
            if 'user_status' in message:
                status = message['user_status']
                if status == 'Online':
                    await self.broadcast_status(status=status)
                    self.user.status = status
                    await sync_to_async(self.user.save)(update_fields=['status'])
        except Exception as e:
            print(f'error in receiving in notification  : {str(e)}')


    async def push_notification(self, event):
        try:
            message = event['data']
            await self.send(text_data=json.dumps({'data': message}))
        except Exception as e:
            print(f'error in pushing notification: {str(e)}')
