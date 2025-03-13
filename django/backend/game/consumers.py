from tournament.models import Tournament
from channels.generic.websocket import AsyncWebsocketConsumer
import django.utils.timezone as timezone
from asgiref.sync import sync_to_async
from auth_api.models import Score
from .models import Game
from django.db.models import F, Case, When, Value
import asyncio
import random
import string
import json

math = __import__('math')

CANVAS_WIDTH = 930
CANVAS_HEIGHT = 480
PADDLE_WIDTH = 10
PADDLE_HEIGHT = 100
BALL_RADIUS = 10
PADDLE_SPEED = 7
BALL_SPEED = 7
FPS = 60
WINNING_SCORE = 5
# Modify these constants
BALL_SPEED_INCREMENT = 0.1  # Reduced from 0.2 to 0.05 (5% increase instead of 20%)
MAX_BALL_SPEED = 13  # Reduced from 15 to 8
INITIAL_BALL_SPEED = 5
XP = 50

class GameConsumer(AsyncWebsocketConsumer):

    waiting_players = []
    connected_users = []
    tournaments = {}
    games = {}

    waiting_players_lock   = asyncio.Lock()
    connected_users_lock   = asyncio.Lock()
    tournaments_lock       = asyncio.Lock()
    games_lock             = asyncio.Lock()

    @classmethod
    def generate_room_name(cls):
        return ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))

    async def connect(self):
        try:
            self.status_code = 0
            self.tournament_id = None
            self.user = self.scope["user"]
            self.room_name = self.scope["room_name"]
            self.is_tournament = True if self.scope["is_tournament"] == "true" else False
            self.is_invited = False
            self.is_final = False

  
            await self.accept()
            if self.user == None:
                self.status_code = 1
                await self.send(text_data=json.dumps({"type": "unauthorized"}))
                return await self.close()
    
            if self.user.id in self.connected_users:
                self.status_code = 1
                return await self.close()

            self.connected_users.append(self.user.id)

            if self.room_name == None:
                return await self.add_to_waiting_queue()
            
            if self.is_tournament:
                return await self.tournament_handler()
             
            await self.invite_game_handler()
            
        except Exception as e:
            print(f'error in connect : {str(e)}')
    
    
    async def final_round(self):

        final_queue = self.tournaments[self.tournament_id]['final_queue']
        
        self.is_final = True # to check it later
        
        final_queue.append(self)
        
        if len(final_queue) == 2:
            for i, player in enumerate(final_queue, start=0):
                opponent = final_queue[1].user.username if i == 0 else final_queue[0].user.username
                send_data = {
                        'type': 'round_2',
                        'message': f"next round {final_queue[0].user.username} vs {final_queue[1].user.username}.",
                        'opponent' : opponent
                        }
                await player.send(text_data=json.dumps(send_data))    

            if len(final_queue) != 2:
                del self.tournaments[self.tournament_id]
                return
            
            await self.create_game(final_queue[0], final_queue[1], self.generate_room_name())
        else:
            await self.send(json.dumps({'type' : 'waiting', 'message' : 'wait other player to join final round.'}))
 
    
    def is_joined(self):
        return self.user not in self.tournaments[self.tournament_id]['all']


    async def   tournament_handler(self):

        self.tournament_id = int(self.room_name)

        if self.tournament_id not in self.tournaments:
            self.status_code = 1
            return await self.close()

        not_joined = await sync_to_async(self.is_joined)()
        if not_joined:
            self.status_code = 1
            return await self.close()
        
        async with self.tournaments_lock:
            
            if self.user.username in self.tournaments[self.tournament_id]['final_round_players']:       
                return await self.final_round()

            self.tournaments[self.tournament_id]['first_round_queue'].append(self)


        instances = self.tournaments[self.tournament_id]['first_round_queue']
        if len(instances) == 4:
            players = sorted(instances, key=lambda obj: obj.user.username)
            game_1 = self.create_game(players[0], players[1], self.generate_room_name())
            game_2 = self.create_game(players[2], players[3], self.generate_room_name())
            await asyncio.gather(game_1, game_2)
        else:
            await self.send(json.dumps({'type' : 'waiting', 'message' : 'wait other players to join tournament.'}))



    async def   invite_game_handler(self):
        try:
            if self.room_name not in self.games:
                await self.send(json.dumps({'type':'not_room'}))
                self.status_code = 1
                return await self.close()
            
            if self.user.id not in self.games[self.room_name]['members'] or self.games[self.room_name]['status'] != 1:
                await self.send(json.dumps({'type':'not_room'}))
                self.status_code = 1
                return await self.close()
            
            self.games[self.room_name]['players'].append(self)
            await self.send(json.dumps({"type": "waiting", "player_name" : self.user.username, "message" : "Wait the player to join the room."}))
            if len(self.games[self.room_name]['players']) == 2:
                player1 = self.games[self.room_name]['players'][0]
                player2 = self.games[self.room_name]['players'][1]
                self.is_invited = True
                await self.create_game(player1, player2, self.room_name)
        except Exception as e:
            print("error in invite game handler :", str(e))


    async def add_to_waiting_queue(self):

        self.waiting_players.append(self)
        await self.send(text_data=json.dumps({
            'type': 'waiting',
            'player_name' : self.user.username,
            'message': 'Waiting for another player to join...'
        }))
        await self.match_players()


    async def create_game(self, player1, player2, room_name):
        try:
            game_state = self.initialize_game_state()
            game_state['player1Avatar'] = player1.user.avatar
            game_state['player2Avatar'] = player2.user.avatar
            game_state['player1Username'] = player1.user.username
            game_state['player2Username'] = player2.user.username

            async with self.games_lock:
                if not self.is_invited:
                    self.games[room_name] = {}
                
                self.games[room_name]['players']     = [player1, player2]
                self.games[room_name]['game_state']  = game_state
                self.games[room_name]['disconneced'] = None
                self.games[room_name]['start_game']  = timezone.now()


            for i, player in enumerate([player1, player2], start=1):
                player.room_name = room_name
                player.player_number = i
                await player.send(json.dumps({
                    'type': 'game_start',
                    'player_name': f'player{i}',
                    'room_name': room_name,
                    'game_state': {
                        'player1Avatar': player1.user.avatar,
                        'player2Avatar': player2.user.avatar,
                        'player1Username': player1.user.username,
                        'player2Username': player2.user.username,
                    }
                }))
                
            asyncio.create_task(self.game_loop(room_name))
        except Exception as e:
            print(f"Error in create_game: {str(e)}")


    async def match_players(self):

        async with self.waiting_players_lock:
            if len(self.waiting_players) >= 2:
                player1 = self.waiting_players.pop(0)
                player2 = self.waiting_players.pop(0)
                room_name = self.generate_room_name()
                await self.create_game(player1, player2, room_name)


    def initialize_game_state(self):
        return {
            'player1Y': CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            'player2Y': CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            'ballX': CANVAS_WIDTH / 2,
            'ballY': CANVAS_HEIGHT / 2,
            'ballSpeedX': INITIAL_BALL_SPEED,
            'ballSpeedY': INITIAL_BALL_SPEED, # Reduced vertical speed
            'score': [0, 0],
            'particles': [],
            'particleColors': [
                [8, 8, 8],  # Light color
                [18, 18, 18],  # Medium color
                [242, 242, 242],       # Dark color
                [210, 210, 210],
                [189, 189, 189],
                [170, 170, 170],
            ],
            # 'avatar': self.user.avatar,
            'player1Avatar': None,  # This will be set in create_game
            'player2Avatar': None,
        }


    async def disconnect(self, close_code):
        try:
            if self.user and self.user.id in self.connected_users:
                self.connected_users.remove(self.user.id)
        
            if self.status_code == 1:
                return

            if self in self.waiting_players:
                self.waiting_players.remove(self)

            if self.room_name in self.games and self in self.games[self.room_name]['players']:
                # to understand to avoid the issues
                self.games[self.room_name]['players'].remove(self)
                self.games[self.room_name]['disconnected'] = self
                
            
            if self.is_tournament:
                async with self.tournaments_lock:
                    
                    if not self.is_final:
                        self.tournaments[self.tournament_id]['all'].remove(self.user)
                        # self.tournaments[self.tournament_id]['first_round_queue'].remove(self)
                    else:
                        self.tournaments[self.tournament_id]['final_round_players'].remove(self.user.id)

        except Exception as e:
            print(f"error in disconnect (Game): {str(e)}")



    async def receive(self, text_data):
        try:
            data = json.loads(text_data)

            if "direction" not in data:
                return
            if self.room_name not in self.games:
                return
            
            async with self.games_lock:
                game = self.games[self.room_name]
                player_key = f'player{self.player_number}Y'
                if data['direction'] == 'ArrowUp':
                    game['game_state'][player_key] = max(0, game['game_state'][player_key] - PADDLE_SPEED)
                if data['direction'] == 'ArrowDown':
                    game['game_state'][player_key] = min(CANVAS_HEIGHT - PADDLE_HEIGHT, game['game_state'][player_key] + PADDLE_SPEED)
        except Exception as e:
            print(f"error in receiving: {str(e)}")



    def get_score_fields(self, score):
        try:
            fields = {
                'total_xp': F('total_xp') + XP,#,(10 * F('total_xp') / 100),
                'wins': F('wins') + 1,
                'games': F('games') + 1,
                'last_score': score,
                'win_ratio': (F('wins') + 1) * 100 / (F('games') + 1),
            }
            current_xp = Case(When(current_xp__gte=F('required_xp') - Value(XP), then=(F('required_xp') + XP) - F('current_xp')), default=F('current_xp') + Value(XP))
            level = Case(When(current_xp__gte=F('required_xp') - Value(XP), then=F('level') + Value(1)), default=F('level'))
            required_xp= Case(When(current_xp__gte=F('required_xp') - Value(XP), then=F('required_xp') + Value(100)), default=F('required_xp'))

            fields['current_xp'] = current_xp
            fields['required_xp'] = required_xp
            fields['level'] = level
            return fields
        except Exception as e:
            print("Error in get_score_fields:", str(e))


    async def save_players_score(self, last_score, winner_user, loser_user):
        try:
            winner_fields = await sync_to_async(lambda: self.get_score_fields(last_score))()
            await sync_to_async(lambda: Score.objects.filter(user=winner_user).update(**winner_fields))()
            
            loser_fields = {
                'games': F('games') + 1,
                'last_score': last_score,
                'losses': F('losses') + 1,
                'win_ratio': Case(
                    When(wins=0, then=Value(0)),
                    default=(F('wins') * 100) / (F('games') + 1),
                ),
            }
            await sync_to_async(lambda: Score.objects.filter(user=loser_user).update(**loser_fields))()
        except Exception as e:
            print("error in save players score:", str(e))


    async def   save_game(self, game, winner_user, loser_user):
        try:
            await Game.objects.acreate(
                    winner=winner_user,
                    start_time=game['start_game'],
                    loser=loser_user,
                    score=game['game_state']['score'])
            score = game['game_state']['score']
            last_score = f"{score[0]}-{score[1]}"
            await self.save_players_score(last_score, winner_user, loser_user)
        except Exception as e:
            print("error in save game : ", str(e))


    # async def   check_tournament_players(self, rest_players):
    #     try:
    #         p_len = len(rest_players)

    #         if p_len == 1:
    #             last = rest_players[0]
    #             await last.send(json.dumps({'type' : 'tournament_over','message' : 'You win the tournament', 'winner': last.user.username}))
    #             last.status_code = 1
    #             await last.close()

    #         if p_len in (0, 1):
    #             await sync_to_async(lambda: Tournament.objects.filter(id=self.tournament_id).delete())()
    #             self.tournaments.pop(self.tournament_id, None)
    #             return True
                    
    #         return False
    #     except Exception as e:
    #         print("error in check_tournament_players:", str(e))
    #         return True


    async def handle_tournament_end(self, winner, loser):
        
        try:
            if  not winner.is_final:
                rest_players = self.tournaments[self.tournament_id]['first_round_queue']
                async with self.tournaments_lock:

                    if loser in rest_players:
                        rest_players.remove(loser)
                        
                    if len(self.tournaments[self.tournament_id]['final_round_players']) > 0:
                        prev_winner = self.tournaments[self.tournament_id]['final_round_players'][0]
                        await self.channel_layer.group_send(prev_winner, {
                            'type' : 'push_notification',
                            'data' : {
                                'type' : 'TR',
                                'title' : f"{winner.user.username} vs {prev_winner} final round!"
                            }
                        })
                    await sync_to_async(lambda: Tournament.objects.get(id=self.tournament_id).players.remove(loser.user))()
                    self.tournaments[self.tournament_id]['final_round_players'].append(winner.user.username)
                    rest_players.remove(winner)
    
                    winner.status_code = 1
                    try:
                        await winner.close()
                    except:
                        pass
            else:# final case

                await winner.send(json.dumps({'type' : 'tournament_over',
                                            'message' : 'You win the tournament',
                                            'winner' : winner.user.username}))

                winner.status_code = 1
                await winner.close()
                await Tournament.objects.filter(id=self.tournament_id).adelete()

                async with self.games_lock:
                    self.games.pop(winner.room_name, None)
        
                async with self.tournaments_lock:    
                    self.tournaments.pop(self.tournament_id, None)

        except Exception as e:
            print("error in handle_tournament_end :", str(e))


    async def   no_winner_case(self):
        pass
        # print("case dial 0!")

            

    async def end_game(self, game, room_name):
        try:         
            if room_name not in self.games:
                return

            if len(game['players']) == 0:
                await self.no_winner_case()
                return

            async with self.games_lock:
                
                if room_name not in self.games:
                    return

                winner = None
                loser  = None
                if len(game['players']) == 1:
                    if game['players']:
                        winner = game['players'][0]
                    loser = game.get('disconnected')

                elif max(game['game_state']['score']) >= WINNING_SCORE:
                    winner_index = 0 if game['game_state']['score'][0] >= WINNING_SCORE else 1
                    winner = game['players'][winner_index]
                    loser = game['players'][1 - winner_index]

                send_data = {
                    'type': 'game_over',
                    'message': f'Player {winner.user.username} wins!',
                    'winner': winner.user.username,
                    'loser': loser.user.username,
                    'score': game['game_state']['score'],#is_winner = player == winner
                    'is_winner': True
                }

                for player in game['players']:
                    is_winner = player == winner
                    send_data['is_winner'] = is_winner
                    await player.send(text_data=json.dumps(send_data))
                try:
                    await loser.close()
                except: # to do not stop the game
                    pass
                self.games.pop(room_name, None)


            if self.is_tournament:
                await self.handle_tournament_end(winner, loser) # prepare next round or end it
            else:
                asyncio.create_task(self.save_game(game, winner.user, loser.user)) # or save the game in database

        except Exception as e:
            print(f"Error in end_game for room {room_name}: {str(e)}")


    async def game_loop(self, room_name):
        try:
            while room_name in self.games:
                
                async with self.games_lock:
                    game = self.games[room_name]
                    self.update_game_state(game['game_state'])                 
                
                # Check for game end conditions
                if max(game['game_state']['score']) >= WINNING_SCORE or len(game['players']) < 2:
                    await self.end_game(game, room_name)
                    return 
                
                # Send game state to players
                for player in game['players']:
                    try:
                        await player.send(text_data=json.dumps({
                            'type': 'game_state',
                            'game_state': game['game_state']
                        }))
                    except Exception as e:
                        # Handle player disconnection
                        pass    
                # Maintain game loop timing
                await asyncio.sleep(1 / FPS)

        except Exception as e:
            print(f"Error in game loop: {str(e)}")





    def update_game_state(self, state):
        # Move the ball
        next_ballX = state['ballX'] + state['ballSpeedX']
        next_ballY = state['ballY'] + state['ballSpeedY']

        # Ball collision with top and bottom walls
        if next_ballY - BALL_RADIUS < 0:
            next_ballY = BALL_RADIUS
            state['ballSpeedY'] = abs(state['ballSpeedY'])
        elif next_ballY + BALL_RADIUS > CANVAS_HEIGHT:
            next_ballY = CANVAS_HEIGHT - BALL_RADIUS
            state['ballSpeedY'] = -abs(state['ballSpeedY'])

        # Determine which paddle to check for collision
        is_left_paddle = state['ballSpeedX'] < 0
        paddle_x = PADDLE_WIDTH if is_left_paddle else CANVAS_WIDTH - PADDLE_WIDTH - PADDLE_WIDTH
        paddle_y = state['player1Y'] if is_left_paddle else state['player2Y']

        # Check for collision with paddle
        if (paddle_x - BALL_RADIUS <= next_ballX <= paddle_x + PADDLE_WIDTH + BALL_RADIUS):
            if paddle_y - BALL_RADIUS <= next_ballY <= paddle_y + PADDLE_HEIGHT + BALL_RADIUS:
                # Collision detected
                collision_y = next_ballY - paddle_y
                
                # Calculate collision point
                collide_point = (collision_y - PADDLE_HEIGHT / 2) / (PADDLE_HEIGHT / 2)
                angle = collide_point * (math.pi / 4)  # Max angle of 45 degrees
                direction = 1 if is_left_paddle else -1
                
                speed = math.sqrt(state['ballSpeedX']**2 + state['ballSpeedY']**2)
                state['ballSpeedX'] = direction * abs(speed * math.cos(angle))
                state['ballSpeedY'] = speed * math.sin(angle)

                # Move ball out of paddle to prevent sticking
                if is_left_paddle:
                    next_ballX = paddle_x + PADDLE_WIDTH + BALL_RADIUS
                else:
                    next_ballX = paddle_x - BALL_RADIUS

                # Increase ball speed
                self.increase_ball_speed(state)

        # Update ball position
        state['ballX'] = next_ballX
        state['ballY'] = next_ballY

        # Check if ball is out of bounds (scoring)
        if state['ballX'] - BALL_RADIUS < 0:
            # Player 2 scores
            state['score'][1] += 1
            self.reset_ball(state, scorer=2)
        elif state['ballX'] + BALL_RADIUS > CANVAS_WIDTH:
            # Player 1 scores
            state['score'][0] += 1
            self.reset_ball(state, scorer=1)

        # Update particles
        state['particles'] = [p for p in state['particles'] if p['life'] > 0]
        for p in state['particles']:
            p['x'] += p['vx']
            p['y'] += p['vy']
            p['life'] -= 1.5

        # Add new particles
        state['particles'].append({
            'x': state['ballX'],
            'y': state['ballY'],
            'vx': (random.random() - 0.5) * 2.5,
            'vy': (random.random() - 0.5) * 2.5,
            'life': 50,
            'radius': random.uniform(1, BALL_RADIUS / 1.5 + 4), 
            'color': random.choice(state['particleColors'])
        })

    def increase_ball_speed(self, state):
        current_speed = math.sqrt(state['ballSpeedX']**2 + state['ballSpeedY']**2)
        if current_speed < MAX_BALL_SPEED:
            speed_increase = min(BALL_SPEED_INCREMENT, MAX_BALL_SPEED - current_speed)
            speed_multiplier = 1 + (speed_increase / current_speed)
            state['ballSpeedX'] *= speed_multiplier
            state['ballSpeedY'] *= speed_multiplier


    def reset_ball(self, state, scorer):
        # Reset ball to the center of the canvas
        state['ballX'] = CANVAS_WIDTH / 2
        state['ballY'] = CANVAS_HEIGHT / 2
        
        # Set horizontal speed towards the scorer
        state['ballSpeedX'] = -BALL_SPEED if scorer == 1 else BALL_SPEED
        
        # Set vertical speed to 0 for a horizontal line
        state['ballSpeedY'] = 0
