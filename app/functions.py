import json
from decimal import Decimal

import requests
import hashlib
import binascii
from django.core.mail import send_mail
from django.conf import settings
from django.http import JsonResponse
import datetime


def send_email(message, recipient):
    subject = 'OTP Verification'
    message = message
    #settings.configure()
    #email_from = settings.EMAIL_HOST_USER
    sender = 'mypayrep@gmail.com'
    recipient_list = [recipient]
    fail_silently = False,
    r = send_mail(subject, message, sender, recipient_list)
    return r


def send_request(url, data):
    try:
        response = requests.post(url, data=json.dumps(data, default=json_helper),
                                 headers={'Content-Type': 'application/json',
                                          'Username': settings.MERCHANT_ID,
                                          'Authorization': settings.AUTHORIZATION},
                                 verify=True, timeout=120)

        if not response.ok:
            message = 'internal server error.CODE:03!'
            return {'status': False, 'message': message}
        response_data = response.json()
        if 'status' in response_data:
            pass
        else:
            response_data['status'] = True
        return response_data
    except requests.exceptions.RequestException as e:  # raise connection errors
        message = 'connection error. CODE:05'
        return {'status': False, 'message': message}


def hash_password(ppt):
    bppt = ppt.encode()
    pct = hashlib.pbkdf2_hmac('sha256', bppt, b"5@l1m", 10000)
    dehex = binascii.hexlify(pct)
    hash_pass = dehex.decode()
    return hash_pass


def money_format(value):
    if not value:
        value = 0
    fvalue = float(value)
    readable = '{0:,.2f}'.format(fvalue)
    return readable


def seconds_to_days(date1, date2):
    timedelta_obj = date1 - date2
    days = timedelta_obj.days
    seconds = timedelta_obj.seconds
    seconds_to_days = seconds/(60*60*24)
    if days < 0:
        total_days = days - seconds_to_days
    else:
        total_days = days + seconds_to_days
    return '{0:,.2f}'.format(total_days)


def last_usage(date1, date2):
    timedelta_obj = date1 - date2
    days = timedelta_obj.days
    seconds = timedelta_obj.seconds
    hours, seconds = divmod(seconds, 3600)
    minutes, seconds = divmod(seconds, 60)
    return [days, hours, minutes, seconds]

    # seconds_to_days = seconds/(60*60*24)
    # if days < 0:
    #     total_days = days - seconds_to_days
    # else:
    #     total_days = days + seconds_to_days
    # return '{0:,.2f}'.format(total_days)


def json_helper(item):
    if isinstance(item, datetime.datetime):
        return item.strftime("%d/%m/%Y, %H:%M:%S")

    if isinstance(item, Decimal):
        return str(item)


def txn_key_gen(from_account=None, to_account=None):
    value = (from_account + to_account).encode()
    hash_obj = hashlib.sha512(value)
    hash_dig = hash_obj.hexdigest()
    return hash_dig