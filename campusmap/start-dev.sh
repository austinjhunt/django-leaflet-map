#!/bin/bash
sass app/static/css/main.scss > app/static/css/main.css && python manage.py compress && python manage.py runserver
 