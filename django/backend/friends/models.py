from django.db import models
from auth_api.models import User
# from notifications.models import Notification


class FriendShip(models.Model):

    sender       = models.ForeignKey(User, null=True, on_delete=models.CASCADE, related_name='sender')
    receiver     = models.ForeignKey(User, null=True, on_delete=models.CASCADE, related_name='receiver') 
    status       = models.CharField(max_length=10, default='pending')
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(null=True)
