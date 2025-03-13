from channels.generic.websocket import AsyncWebsocketConsumer
from django.db.models import F, Case, When, Value
import django.utils.timezone as timezone
from asgiref.sync import sync_to_async
from auth_api.models import Scorex
# from .models import Gamex
from game.models import Game
import asyncio
import random
import string
import json

game_rooms = {}
game_rooms_lock = asyncio.Lock()

WINNING_SCORE = 3
XP = 50

class RPSGameConsumer(AsyncWebsocketConsumer):
    waiting_players = []
    waiting_players_lock = asyncio.Lock()
    connected_users = []
    games = {}

    @classmethod
    def generate_room_name(cls):
        return ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))

    async def connect(self):
        try:
            self.status_code = 0
            self.user = self.scope["user"]
            self.room_name = None

            await self.accept()
            if self.user == None:
                self.status_code = 1
                await self.send(text_data=json.dumps({"type": "unauthorized"}))
                return await self.close()

            if self.user.id in self.connected_users:
                self.status_code = 1
                return await self.close()

            # await self.accept()
            self.connected_users.append(self.user.id)

            return await self.add_to_waiting_queue()

        except Exception as e:
            print(f'error in connect : {str(e)}')



    async def add_to_waiting_queue(self):
        self.waiting_players.append(self)
        await self.send(text_data=json.dumps({
            'type': 'waiting',
            'player_name': self.user.username,
            'message': 'Waiting for another player to join...'
        }))
        await self.match_players()


    async def create_game(self, player1, player2, room_name):
        try:
            self.games[room_name] = {
                'players': [player1, player2],
                'game_state': self.initialize_game_state(),
                'disconnected': None,
            }
            for i, player in enumerate([player1, player2], start=1):
                player.room_name = room_name
                player.player_number = i
                await player.send(json.dumps({
                    'type': 'game_start',
                    'player_name': player.user.username,
                    'room_name': room_name
                }))

            self.games[room_name]['start_game'] = timezone.now()
            asyncio.create_task(self.game_loop(room_name))
        except Exception as e:
            print(str(e))

    async def match_players(self):
        async with self.waiting_players_lock:
            try:
                if len(self.waiting_players) < 2:
                    return

                players_with_scores = []
                for player in self.waiting_players:
                    score = await sync_to_async(lambda: Scorex.objects.get(user=player.user))()
                    total_games = score.wins + score.losses
                    
                    # Calculate adjusted winrate that considers total games played
                    if total_games == 0:
                        adjusted_winrate = 50  # New players start at 50%
                    else:
                        # Use a weighted system for new players
                        base_winrate = (score.wins / total_games) * 100
                        weight = min(total_games / 10, 1)  # Gradually increase weight up to 10 games
                        adjusted_winrate = (base_winrate * weight) + (50 * (1 - weight))
                    
                    players_with_scores.append((player, adjusted_winrate))

                players_with_scores.sort(key=lambda x: x[1])

                matched = False
                for i in range(len(players_with_scores) - 1):
                    player1, winrate1 = players_with_scores[i]
                    player2, winrate2 = players_with_scores[i + 1]
                    
                    winrate_difference_threshold = 20
                    
                    if abs(winrate1 - winrate2) <= winrate_difference_threshold:
                        room_name = self.generate_room_name()
                        await self.create_game(player1, player2, room_name)

                        self.waiting_players.remove(player1)
                        self.waiting_players.remove(player2)
                        
                        matched = True
                        break

                # If no players were matched, continue waiting for more players
                if not matched:
                    await self.send(text_data=json.dumps({
                        'type': 'waiting',
                        'message': 'Still waiting for a player with a similar skill level...'
                    }))
            except Exception as e:
                print("error type:", type(e).__name__)
                print("error in match_players")


    def initialize_game_state(self):
        return {
            'player1_choice': None,
            'player2_choice': None,
            'score': [0, 0],
            'round': 1
        }

    async def disconnect(self, close_code):
        try:
            if self.status_code == 1:
                return

            if self.user.id in self.connected_users:
                self.connected_users.remove(self.user.id)

            if self in self.waiting_players:
                self.waiting_players.remove(self)

            if self.room_name in self.games and self in self.games[self.room_name]['players']:
                self.games[self.room_name]['players'].remove(self)
                self.games[self.room_name]['disconnected'] = self

        except Exception as e:
            print(f"error in disconnect (Game): {str(e)}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            if "choice" not in data:
                return
            if self.room_name not in self.games:
                return

            game = self.games[self.room_name]
            player_key = f'player{self.player_number}_choice'
            game['game_state'][player_key] = data['choice']

            if game['game_state']['player1_choice'] and game['game_state']['player2_choice']:
                await self.resolve_round(game)

        except Exception as e:
            print(f"error in receiving: {str(e)}")

    async def resolve_round(self, game):
        # Extract player usernames
        player1_name = game['players'][0].user.username
        player2_name = game['players'][1].user.username

        p1_choice = game['game_state']['player1_choice']
        p2_choice = game['game_state']['player2_choice']
        
        # Determine the result of the round
        if p1_choice == p2_choice:
            result = "Draw"
        elif (p1_choice == "rock" and p2_choice == "scissors") or \
            (p1_choice == "scissors" and p2_choice == "paper") or \
            (p1_choice == "paper" and p2_choice == "rock"):
            result = f"{player1_name} wins"
            game['game_state']['score'][0] += 1
        else:
            result = f"{player2_name} wins"
            game['game_state']['score'][1] += 1

        # Update the game state for the next round
        game['game_state']['round'] += 1
        game['game_state']['player1_choice'] = None
        game['game_state']['player2_choice'] = None

        # Send the result to both players
        for player in game['players']:
            await player.send(json.dumps({
                'type': 'round_result',
                'result': result,
                'score': game['game_state']['score'],
                'round': game['game_state']['round']
            }))

        # Check if the game is over and handle accordingly
        if max(game['game_state']['score']) >= WINNING_SCORE:
            await self.end_game(game)


    def get_scorex_fields(self):
        try:
            fields = {
                # 'total_xp': F('total_xp') + XP,#,(10 * F('total_xp') / 100),
                'wins': F('wins') + 1,
                'games': F('games') + 1,
                'winrate': (F('wins') + 1) * 100 / (F('games') + 1),
            }
            return fields
        except Exception as e:
            print("Error in get_score_fields:", str(e))


    async def save_players_scorex(self, winner_user, loser_user):
        try:
            winner_fields = await sync_to_async(lambda: self.get_scorex_fields())()
            await sync_to_async(lambda: Scorex.objects.filter(user=winner_user).update(**winner_fields))()
                
            loser_fields = {
                'games': F('games') + 1,
                'losses': F('losses') + 1,
                'winrate': Case(
                    When(wins=0, then=Value(0)),
                    default=(F('wins') * 100) / (F('games') + 1),
                ),
            }
            await sync_to_async(lambda: Scorex.objects.filter(user=loser_user).update(**loser_fields))()
        except Exception as e:
            print("error in save players score:", str(e))

    async def end_game(self, game):
        try:
            if len(game['players']) == 0:
                self.games.pop(self.room_name)
                return
            if len(game['players']) < 2:
                winner = game['players'][0]
                loser = game['disconnected']
            elif max(game['game_state']['score']) >= WINNING_SCORE:
                winner_index = 0 if game['game_state']['score'][0] >= WINNING_SCORE else 1
                winner = game['players'][winner_index]
                loser = game['players'][1 - winner_index]
            
            for player in game['players']:
                try:
                    await player.send(text_data=json.dumps({
                        'type': 'game_over',
                        'message': f'Player {winner.user.username} wins!',
                        'winner': winner.user.username,
                        'loser': loser.user.username,
                        'game_state': game['game_state']['score']
                    }))
                except:
                    pass
            
            await Game.objects.acreate(
                game_type='rps',
                winner=winner.user,
                start_time=game['start_game'],
                loser=loser.user,
                score=game['game_state']['score'])

            await self.save_players_scorex(winner.user, loser.user)

            if self.room_name in self.games:
                self.games.pop(self.room_name)

        except Exception as e:
            print(f"error in end_game: {str(e)}")

    async def game_loop(self, room_name):
        try:
            while room_name in self.games:
                game = self.games[room_name]
                
                if max(game['game_state']['score']) >= WINNING_SCORE or len(game['players']) < 2:
                    await self.end_game(game)
                    return

                for player in game['players']:
                    try:
                        await player.send(text_data=json.dumps({
                            'type': 'game_state',
                            'game_state': game['game_state']
                        }))
                    except:
                        pass

                await asyncio.sleep(1)
        except Exception as e:
            print(f"error in game loop: {str(e)}")