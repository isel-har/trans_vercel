# from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import AccessToken#, RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.hashers import make_password
from rest_framework.response import Response
from .decorators import BlackListToken
from django.conf import settings
from .models import User, Score, Scorex
from .decorators import BlackListToken
from .serializers import UserSerializer
from .two_fa import send_2FA_code
import requests
import re



def get_user_data(user_data):

    login = user_data.get('login')
    defaults = {
        'username' :login,
        'first_name': user_data.get('first_name'),
        'last_name': user_data.get('last_name'),
        'email': user_data.get('email'),
        'oauth_42': True,
        'add_pass': False,
        'avatar': str(user_data.get('image', {}).get('link'))
    }
    return defaults


def oauth2_auth(user_data):

    meta_data = get_user_data(user_data)
    try:
        users =  User.objects.filter(username=meta_data['username'])
        if not users.exists():
            user = User.objects.create(**meta_data)
            Score.objects.create(user=user)
            Scorex.objects.create(user=user)
        else:
            user = users[0]
            if user.enable_2FA:
                return send_2FA_code(user=user)
            
            
        access_token = AccessToken.for_user(user=user)
        user_data = UserSerializer(user).data
        user_data['access'] = str(access_token)
        return Response(user_data, status=200)
    except:
        return Response({'error' : 'unauthorized'}, status=401)


@api_view(['GET'])
def token_request(request):

    user_code = request.GET.get('code')
    url = 'https://api.intra.42.fr/oauth/token'
    data = {
        'grant_type': 'authorization_code',
        'client_id' :  settings.CLIENT_ID,
        'client_secret':  settings.CLIENT_SECRET,
        'code': user_code,
        'redirect_uri': "https://localhost:8443/get-token"
    }
    response = requests.post(url, data=data)
    if response.status_code == 200:
        access_token = response.json().get('access_token')
        response = requests.get("https://api.intra.42.fr/v2/me", headers={"Authorization": f"Bearer {access_token}"})

        if response.status_code == 200:
            return oauth2_auth(user_data=response.json())

    return Response(data={'success':False, 'detail' : 'not authorized'}, status=401) # unauthorized


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def logout_view(request):

    user_id = request.user.id
    BlackListToken.add_token(user_id, request.headers.get('Authorization'))
    return Response({'detail' : 'token blacklisted'})



@api_view(['POST'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def add_password(request):
    user = request.user

    try:
        if not user.oauth_42:
            return Response({'error': 'Only OAuth users can add a password.'}, status=403)
        
        if user.add_pass:
            return Response({'error': 'Password has already been added.'}, status=403)

        password = request.data.get('password')
        if not password:
            return Response({'error': 'Password is required.'}, status=400)
        
        PASSWORD_PATTERN = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d.*\d.*\d).{10,20}$'
        if not re.match(PASSWORD_PATTERN, password):
            return Response({'error' : 'invalid password'}, status=401)

        user.password = make_password(password)
        user.add_pass = True
        user.save()
        return Response({'detail': 'password added successefully'}, status=201)
    
    except Exception as e:
        return Response({'error': f'An error occurred: {str(e)} : {type(e).__name__}'}, status=400)
