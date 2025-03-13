from channels.generic.websocket import AsyncWebsocketConsumer
from game.consumers import GameConsumer
from blacklist.models import BlackList
from asgiref.sync import sync_to_async
from django.utils import timezone
from auth_api.models import User
from game.views import game_data
from django.conf import settings
from .models import ChatMessage
import asyncio
import json


class ChatConsumer(AsyncWebsocketConsumer):

    banned_dict = {}
    banned_dict_lock = asyncio.Lock()

    invite_list = {}
    invite_list_lock = asyncio.Lock()
  
    async def connect(self):
        try:
            self.status = 0
            self.room = None
            self.user = self.scope["user"]

            if self.user is None:
                self.status = 1
                return await self.close()

            await self.accept()
            
            self.dest_instances = {}
            self.room = 'room_' + str(self.user.id)
            
            async with self.invite_list_lock:
                self.invite_list[self.user.id] = []
            
            self.ban_list = await sync_to_async(BlackList.objects.filter)(user=self.user)

            async with self.banned_dict_lock:
                self.banned_dict[self.user.id] = await sync_to_async(self.get_ban_list)()
                # await self.get_ban_list()
            
            await self.channel_layer.group_add(self.room, self.channel_name)
        except Exception as e:
            print(f'Error in connection : {str(e)}')


    def get_ban_list(self):
    
        b_list = [bans.blocked_id for bans in self.ban_list]
        return b_list

    async def disconnect(self, code):
        try:
            if self.status == 1:
                return
            if not self.room:
                return
            await self.channel_layer.group_discard(self.room, self.channel_name)

            if self.user.id in self.banned_dict:
                async with self.banned_dict_lock:
                    self.banned_dict.pop(self.user.id)

            if self.user.id not in self.invite_list:
                return
            async with self.invite_list_lock:
                self.invite_list.pop(self.user.id)
        except Exception as e:
            print(f'Error in connection : {str(e)}')

    async def check_dest(self, dest_id):

        if dest_id in self.banned_dict:
                
            if self.user.id in self.banned_dict[dest_id]:
                return True

        if dest_id in self.banned_dict[self.user.id]:
            return True
        return False


    async def create_message(self, data, dest_id):
    
        message = {
            'type' : 'send_chat_message',
            'message' : {
                    'source' : self.user.id,
                    'dest' : dest_id, 
                }
        }
        if data['is_typing'] is not None:
            message['message']['is_typing'] = data['is_typing']
        else:
            message['message']['message'] = data['message']
            message['message']['time_stamp'] = str(timezone.now())
        return message


    async def check_game_status(self, room_id):
        try:
            await asyncio.sleep(15)
            game_status = -1
            if room_id in GameConsumer.games:
               game_status = GameConsumer.games.get(room_id).get('status', -1)  
            
            if game_status != 1:
                GameConsumer.games.pop(room_id)
            
            async with self.invite_list_lock:
                if self.user.id not in self.invite_list:
                    return
                if self.dest.id in self.invite_list[self.user.id]:
                    self.invite_list[self.user.id].remove(self.dest.id)
        except:
            pass

    async def   send_game_invite(self):
        if self.user.id not in self.invite_list:
            return
        if self.dest.id in self.invite_list[self.user.id]:
            return

        title = self.user.username + " invites you to a game."
        room_id = GameConsumer.generate_room_name()
        GameConsumer.games[room_id] = {
            'source' : self.user.id,
            'src_name' : self.user.username,
            'dest'   : self.dest.id,
            'members': [self.user.id, self.dest.id],
            'status' : 0,
            'players' : []
        }
        data = await sync_to_async(lambda: game_data(self.user, title, room_id))()
        await self.channel_layer.group_send(self.dest.username, {
            'type' : 'push_notification',
            'data' : data
        })
        async with self.invite_list_lock:
            self.invite_list[self.user.id].append(self.dest.id)
        asyncio.create_task(self.check_game_status(room_id))


    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            attributes = all([n in data for n in ['dest', 'message', 'is_typing', 'type']])
            if attributes:
                dest_id = int(data['dest'])

                if not isinstance(data['message'], str):
                    return

                if data['is_typing'] is not None and not isinstance(data['is_typing'], bool):
                    return
                
                if self.user.id == dest_id:
                    return

                if dest_id not in self.dest_instances:
                    self.dest_instances[dest_id] = await User.objects.aget(id=dest_id)

                self.dest = self.dest_instances[dest_id]
                # recipient_name = self.dest_instances[dest_id].username
                if await self.check_dest(dest_id):
                    return
               
                if isinstance(data['type'], int) and data['type'] == 2:
                    return await self.send_game_invite()
                    
                message = await self.create_message(data, dest_id)

                await self.channel_layer.group_send(f'room_{str(dest_id)}', message)

                if data['is_typing'] is None:
                    await self.channel_layer.group_send(self.room, message)
                    await ChatMessage.objects.acreate(source=self.user, dest=self.dest, message=data['message'])
        except Exception as e:
            print(f"Error in receiving: {e}.")


    async def send_chat_message(self, event):
        try:
            message = event['message']
            await self.send(text_data=json.dumps({'data' : message}))
        except Exception as e:
            print(f'error in sending: {e}')
