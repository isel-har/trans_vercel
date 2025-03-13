from rest_framework.decorators import api_view, permission_classes
from .serializers import UserSerializer, ScoreSerializer, ProfileSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import User, Score
from .decorators import BlackListToken
from django.shortcuts import get_object_or_404

@api_view(['GET'])
def get_profil(request):
    try:
        query = int(request.GET.get("query"))

        user =get_object_or_404(User.objects.select_related('score'), id=query)
        
        profile = ProfileSerializer(user).data     
        return Response(profile, status=200)
    except:
        return Response({"error" : "invalid query"}, status=400)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
@BlackListToken.is_blacklisted
def get_me(request):
    user = request.user
    data = UserSerializer(user).data
    return Response(data)


@api_view(['GET'])
def get_score(request):
    try:
        query = request.GET.get("query", None)
        score  = get_object_or_404(Score, id=int(query))
        score_data = ScoreSerializer(score).data
        return Response(score_data)
    except:
        return Response({"error" : "invalid query"}, status=400)
