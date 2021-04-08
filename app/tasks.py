import json

import requests
from django.conf import settings
from background_task import background
from django.core.mail import send_mail

from .functions import json_helper
from .models import EmailTracker


@background(schedule=1)
def send_email(recipient, message):
    response = send_mail(settings.SENDER_ID,
                         message,
                         settings.SENDER_EMAIL,
                         [recipient])
    if response:
        EmailTracker.create_record(address=recipient, message=message)
    else:
        EmailTracker.create_record(address=recipient, message=message, status=False)

