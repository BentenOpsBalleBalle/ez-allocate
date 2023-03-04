#!/bin/sh
cd /backend
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
# TODO: change this to gunicorn after i figure out how to make static files available
