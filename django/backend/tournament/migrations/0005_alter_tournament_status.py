# Generated by Django 5.0.2 on 2024-08-28 14:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0004_tournament_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tournament',
            name='status',
            field=models.CharField(default='Waiting', max_length=10),
        ),
    ]
