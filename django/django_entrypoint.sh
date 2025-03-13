#!/bin/bash

ENDPOINT="$(hostname):8443"

echo $ENDPOINT

python /django/manage.py makemigrations && python /django/manage.py migrate
exec python /django/manage.py runserver $ENDPOINT

