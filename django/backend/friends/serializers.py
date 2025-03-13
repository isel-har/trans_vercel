from rest_framework.serializers import ModelSerializer
# from django.db import models
from rest_framework import serializers
from auth_api.models import User
from .models import FriendShip


class SearchSerializer(ModelSerializer):
    class Meta:
        model =  User
        fields = ['id', 'avatar', 'username', 'status']
        

class FriendSerializer(serializers.ModelSerializer):

    friend = serializers.SerializerMethodField() # csutome field
    is_sender = serializers.SerializerMethodField()

    class Meta:
        model = FriendShip
        fields = ['id', 'status', 'created_at', 'updated_at', 'friend', 'is_sender']
        

    def get_friend(self, obj):
        user = self.context.get('user')
        friend = obj.sender if obj.sender != user else obj.receiver
        return SearchSerializer(friend).data

    def get_is_sender(self, obj):
        user = self.context.get('user')
        return obj.sender == user   
    