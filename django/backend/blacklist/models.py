from django.db import models
from auth_api.models import User

class BlackList(models.Model):

    blocked_username = models.CharField(max_length=100, null=True)
    blocked_id = models.IntegerField(null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blacklist', null=True)

    def __str__(self):
        return self.blocked_username
