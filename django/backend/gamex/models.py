from django.db import models
from auth_api.models import User

class Gamex(models.Model):
    end_time = models.DateTimeField(auto_now_add=True, null=True)
    start_time = models.DateTimeField(null=True, blank=True)
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='rps_games_won')
    loser = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='rps_games_lost')
    score = models.JSONField(default=dict, null=True)

    def __str__(self):
        return f"RPS Game between {self.winner} and {self.loser} with score {self.score}"

    class Meta:
        app_label = 'gamex'  # Replace 'rps' with your actual app name if different