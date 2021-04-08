import hashlib
import binascii
import json
import smtplib

from django.conf import settings
from django.core.mail import send_mail
from django.utils.crypto import get_random_string

from login.models import User


def hash_password(ppt):
    """
    Takes plain text password and return a one way encrypted hash
    :param ppt:
    :return hash_pass:
    """
    bppt = ppt.encode()
    pct = hashlib.pbkdf2_hmac('sha256', bppt, b"5@l1m", 10000)
    dehex = binascii.hexlify(pct)
    hash_pass = dehex.decode()
    return hash_pass


def create_user(user_id, email, status, user_type, permissions):
    try:
        User.objects.get(user_id=user_id)
        emessage = "The user already exist "
        return emessage
    except User.DoesNotExist:
        pin = get_random_string(length=6, allowed_chars='1234567890')
        ct = hash_password(pin)
        new_user = User(user_id=user_id,
                        password=ct,
                        email=email,
                        status=status,
                        user_type=user_type,
                        permissions=json.dumps(permissions)
                        )
        message = settings.EMAIL_MESSAGE % (user_id, pin)
        recipient = [email]
        try:
            response = send_mail(settings.SENDER_ID, message, settings.SENDER_EMAIL, recipient)
            if response == 1:
                new_user.save()
                message = 'User has been created successfully'
                return True
        except smtplib.SMTPAuthenticationError:
            print(344444444444444444444444444444)
            emessage = "user can not be added.Error! can't access mail server. check back later"
            return False