# Generated by Django 4.2.13 on 2024-06-09 12:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blacklist', '0002_alter_blacklist_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='blacklist',
            name='banned_user',
            field=models.CharField(max_length=100, null=True, unique=True),
        ),
        migrations.AlterField(
            model_name='blacklist',
            name='banned_user_id',
            field=models.IntegerField(null=True, unique=True),
        ),
    ]
