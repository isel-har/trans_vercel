from rest_framework import serializers
from .models import Tournament
from auth_api.serializers import TourUserSerializer

class TourSerializer(serializers.ModelSerializer):
    players = TourUserSerializer(many=True)
    
    class Meta:
        model = Tournament
        fields = ['id', 'name', 'creator_name', 'creation_time', 'players', 'status']
