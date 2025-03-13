from django.db import models
from auth_api.models import User

class Game(models.Model):
    end_time = models.DateTimeField(auto_now_add=True, null=True)
    start_time = models.DateTimeField(null=True, blank=True)
    winner = models.ForeignKey (User, on_delete=models.SET_NULL, null=True, related_name='games_won')
    loser = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='games_lost')
    score = models.JSONField(default=dict, null=True)
    game_type = models.CharField(default='pong', max_length=6)

    def __str__(self):
        return f"Game between {self.winner} and {self.loser} with score {self.score}"
