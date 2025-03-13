from rest_framework import serializers
from .models import Gamex


class GamexSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gamex
        fields = ['player1', 'player2', 'create_at']
