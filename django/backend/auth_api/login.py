from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.hashers import check_password
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from .two_fa import send_2FA_code
from .models import User
from .serializers import UserSerializer

@api_view(['POST'])
def login_view(request):

    try:
        username = request.data.get('username', None)
        password = request.data.get('password', None)
        if username == None or password == None:
            return Response({'error' : 'username and password fields required.'}, status=400)
    
        user = User.objects.get(username=username)       
        password_matches = check_password(password, user.password)
        if not password_matches:
            raise User.DoesNotExist

        if user.enable_2FA:
            return send_2FA_code(user=user)

        access_token = AccessToken.for_user(user=user)
        user_data = UserSerializer(user).data
        user_data['access'] = str(access_token)
        return Response(user_data, status=200)
    except User.DoesNotExist:
        return Response(data={'errors' : 'Invalid username or password'}, status=401) # unauthorized
    except:
        return Response(data={'errors' : 'Invalid json format.'}, status=400)


