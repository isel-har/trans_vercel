from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import UserSerializer


@api_view(['POST'])
def register_view(request):
   
    try:
        if not all([c in request.data for c in ['username', 'email', 'password']]):
            return Response({'detail' : 'all fields required'}, status=400)

        serialize = UserSerializer(data=request.data)
        serialize.is_valid(raise_exception=True)

        user = serialize.save()
        access_token = AccessToken().for_user(user=user)
        user_data = UserSerializer(user).data
        user_data['access'] = str(access_token)
        return Response(user_data, status=201)
    except ValidationError:
        return Response({'errors' : serialize.errors}, status=400)
    except:
        return Response({'error' : 'invalid json format.'}, status=400)
