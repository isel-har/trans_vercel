from rest_framework.exceptions import ValidationError
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from .models import User, Score, Scorex


class RankSerializer(serializers.ModelSerializer):
    class Meta:
        model = Score
        fields = ['total_xp', 'level', 'wins']


class LeaderBoardSerializer(serializers.ModelSerializer):
    score = RankSerializer()
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar', 'status', 'score']



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar', 'status', 'email', 'password', 'add_pass', 'oauth_42']
        extra_kwargs = {
            'password' : {'write_only': True,},
        }
    
    def create(self, validated_data):

        validated_data['password'] = make_password(validated_data['password'])
        try:
            instance = User.objects.create(**validated_data)
            instance.score = Score.objects.create(user=instance)
            instance.scorex = Scorex.objects.create(user=instance)
            return instance
        except Exception as e:
            print("error f create : ", type(e).__name__)


    def is_valid(self, raise_exception=False):

        valid = super().is_valid(raise_exception=raise_exception)
        is_error = False

        ##### replace it with regix
        username = self.validated_data.get('username')
        username_err_list = []
        if len(username) < 3 or len(username) > 12:
            is_error = True
            username_err_list = ["Username must be between 3 and 12 characters long."]

        valid_chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-"
        invalid_chars = [c for c in username if c not in valid_chars]
        if invalid_chars:
            username_err_list.append([f' {c} is an invalid username character.' for c in invalid_chars])
            is_error = True
        password_err_list = []
        if 'password' in self.initial_data:
            password = self.validated_data.get('password')
            if len(password) < 10 or len(password) > 20:
                is_error = True
                password_err_list = ['invalid password length, 10 to 20 length.']
    
            digits = sum(1 for c in password if c.isdigit()) or 0
            if digits < 3:
                is_error = True
                password_err_list.append('password should at least contain 3 digits.')

            upper = [c for c in password if c.isupper()]
            lower = [c for c in password if c.islower()]
            if not upper:
                password_err_list.append('password should contain at least 1 uppercase letter.')
                is_error = True
            if not lower :
                is_error = True
                password_err_list.append('password should contain at least 1 lowercase letter.')

        if  raise_exception and is_error:
            if username_err_list : self._errors.setdefault('username', username_err_list)
            if password_err_list : self._errors.setdefault('password', password_err_list)
            raise ValidationError()
        return valid


class TourUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar', 'status']


class ScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Score
        fields = '__all__'


class  ProfileSerializer(serializers.ModelSerializer):
    user  = UserSerializer(source='*',read_only=True)
    score = ScoreSerializer(read_only=True)
    class Meta: 
        model = User
        fields = ['user', 'score']