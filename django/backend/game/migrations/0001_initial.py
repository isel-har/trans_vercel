# Generated by Django 4.2.11 on 2024-04-22 16:57

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('end_time', models.DateTimeField(null=True)),
                ('player1', models.OneToOneField(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='player1', to=settings.AUTH_USER_MODEL)),
                ('player2', models.OneToOneField(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='player2', to=settings.AUTH_USER_MODEL)),
                ('winner', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
