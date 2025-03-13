from .serializers import ChatMessageSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from auth_api.models import User
from .models import ChatMessage
from django.db.models import Q
from auth_api.decorators import BlackListToken

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def get_messages(request, id):
    
    user1 = request.user
    try:
        user2 = User.objects.get(id=id)
        
        instances = ChatMessage.objects.filter((Q(source=user1) | Q(source=user2)) & (Q(dest=user1) | Q(dest=user2))).order_by('time_stamp')
        messages  = ChatMessageSerializer(instances, many=True).data
        return Response(messages, status=200)
    except:
        return Response(data={'detail' : 'error'}, status=404)
