from django.contrib.auth.models import AbstractUser, Permission, Group
from datetime import timedelta, datetime
from django.utils import timezone
from django.conf import settings
from django.db import models

class User(AbstractUser):

    username    = models.CharField(max_length=14, null=True, unique=True)
    email       = models.EmailField(max_length=128, null=True, unique=True)
    first_name = models.CharField(null=True, max_length=150)
    last_name   = models.CharField(null=True, max_length=150)
    password    = models.CharField(max_length=100, null=True)
    avatar      = models.URLField(default="https://github.com/shadcn.png")
    status      = models.CharField(max_length=20, default="Offline")
    enable_2FA  = models.BooleanField(default=False)
    twofa_code  = models.CharField(max_length=6, null=True)
    passed_2FA  = models.BooleanField(default=False, null=True)

    oauth_42    = models.BooleanField(default=False)
    add_pass   = models.BooleanField(default=True)
    last_edit   = models.DateTimeField(null=True)

    groups = models.ManyToManyField(Group, blank=True, related_name='grp')
    user_permissions = models.ManyToManyField(Permission, blank=True, related_name='prm')
    def can_edit_profil(self):

        if not self.last_edit:
            return True
        time_last_edit = timezone.now().timestamp() - self.last_edit.timestamp()
        future_time = datetime.now() + timedelta(days=3)
        if time_last_edit >= future_time.timestamp():
            return True
        return False

    def __str__(self):
        return self.username


class Score(models.Model):

    games  = models.IntegerField(default=0)
    wins   = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)

    
    win_ratio    = models.FloatField(default=0.0)
    last_score   = models.CharField(max_length=6 , default="-")  
    level        = models.FloatField(default=1.0)
    required_xp  = models.IntegerField(default=100)
    current_xp   = models.IntegerField(default=0)
    total_xp     = models.IntegerField(default=0)

    user = models.OneToOneField(User, related_name="score", on_delete=models.CASCADE, null=True)
    
    def __str__(self):
        return str(self.current_xp)


class Scorex(models.Model):

    games  = models.IntegerField(default=0)
    wins   = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    winrate = models.IntegerField(default=0)
    user = models.OneToOneField(User, related_name="scorex", on_delete=models.CASCADE, null=True)
    
