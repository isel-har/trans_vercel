from django.db import models
from auth_api.models import User

# Create your models here.
class ChatMessage(models.Model):
    
    source = models.ForeignKey(User, null=True, related_name='messages_sender', on_delete=models.PROTECT)
    dest   = models.ForeignKey(User, null=True, related_name='messages_receiver', on_delete=models.PROTECT)

    message = models.TextField(max_length=500, null=True)
    time_stamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'{self.source}_to_{self.dest}' 
    