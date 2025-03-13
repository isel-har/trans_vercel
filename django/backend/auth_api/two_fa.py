from rest_framework.decorators import api_view, permission_classes
from django.core.mail import send_mail#, BadHeaderError
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.hashers import check_password
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.conf import settings
from .serializers import UserSerializer
from .models import User
import pyotp
from .decorators import BlackListToken

@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def two_factor(request):
    
    user = request.user
    
    if "password" not in request.data  or not check_password(request.data['password'], user.password):
        return Response({"detail" : "password required or invalid"}, status=401)

    response = ""
    if request.method == 'POST' and not user.enable_2FA:
        user.enable_2FA = True
        response = "2FA enabled"
        user.save(update_fields=['enable_2FA'])
    if request.method == 'DELETE' and user.enable_2FA:
        user.enable_2FA = False
        response = "2FA disabled"
        user.save(update_fields=['enable_2FA']) 
    else:
        response = f"2FA {'enabled' if user.enable_2FA else 'disabled'}"
    return Response({'message' : response})


def send_2FA_code(user):
    try:
        tfa_pass = settings.TWO_FA_KEY
        
        totp = pyotp.TOTP(tfa_pass)
        
        code = str(totp.now())
        user.twofa_code = code
        user.save(update_fields=['twofa_code'])
        
        message = f'Please enter the following code to complete the login:\n{code}'
        sent = send_mail(
            subject='Two factor authentication',
            message=message,
            from_email= settings.EMAIL_HOST_USER,
            recipient_list=[user.email],
            fail_silently=True
        )
        if sent == 1:
            return Response({'TFA' : True, 'detail' : 'Two-factor authentication required'}, status=200)
        else:
            return Response(data={'detail' : 'error on sending email'}, status=400)

    except Exception:
        return Response(data={'detail' : 'error on sending email'}, status=400)


@api_view(['POST'])
def verify_2FA(request):
    try:
        data = request.data 
        code = data.get('code')
        username = data.get('username')

        user = User.objects.get(username=username)
        if code == user.twofa_code:
            user.passed_2FA = True
            user.save(update_fields=['passed_2FA'])
            access_token = AccessToken.for_user(user=user)
            user_data = UserSerializer(user).data
            user_data['access'] = str(access_token)

            return Response(data=user_data)

        return Response({'error' : 'unauthrozied'}, status=401)
    except:
        return Response({'detail' : "user not found"}, status=404)
