from auth_api.models import User
from django.db import models
# from game.models import Game

class Tournament(models.Model):
    

    name          = models.CharField(max_length=100, null=True, unique=True)
    players       = models.ManyToManyField(User)
    creation_time = models.DateTimeField(auto_now=True)
    start_time    = models.DateTimeField(null=True)
    end_time      = models.DateTimeField(null=True)
    status        = models.CharField(max_length=10, default='Waiting')
    creator_id    = models.IntegerField(null=True)
    creator_name  = models.CharField(max_length=100, null=True)
    # bracket       = models.TextField(max_length=60, null=True)

    def __str__(self):
        return self.name
