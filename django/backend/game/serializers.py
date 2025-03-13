from rest_framework import serializers
from auth_api.models import User    
from .models import Game

class UserHistory(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'avatar', 'id']


class GameSerializer(serializers.ModelSerializer):
    winner = UserHistory()
    loser = UserHistory()
    class Meta:
        model = Game
        fields = ['winner', 'loser', 'start_time', 'game_type', 'score']
