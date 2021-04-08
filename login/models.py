import json
import hashlib
import binascii
import smtplib

from django.core.mail import send_mail
from django.db import models, IntegrityError
from django.conf import settings
from django.utils.crypto import get_random_string
from django.utils import timezone


class Permission(models.Model):
    per_id = models.CharField(max_length=255)
    name = models.CharField(max_length=255)

    objects = models.Manager()

    class Meta:
        ordering = ['id']
        verbose_name_plural = "Permissions"

    class Admin:
        pass

    def __str__(self):
        return self.name


class User(models.Model):
    user_id = models.CharField(max_length=255, unique=True, null=True)
    password = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, unique=True)
    status = models.BooleanField(default=False)
    user_type = models.CharField(max_length=10, choices=settings.USER_TYPES, default="staff")
    permissions = models.TextField(default=json.dumps(['staff']))
    date = models.DateTimeField(default=timezone.now)

    objects = models.Manager()

    class Meta:
        ordering = ['date']
        verbose_name_plural = "Users"

    class Admin:
        pass

    def __str__(self):
        return self.email

    @classmethod
    def create_user(cls, **kwargs):
        new_user = cls(**kwargs)
        pin = get_random_string(length=6, allowed_chars='1234567890')
        message = settings.EMAIL_MESSAGE % (kwargs["user_id"], pin)
        recipient = kwargs["email"]
        try:
            response = send_mail(settings.SENDER_ID, message, settings.SENDER_EMAIL, [recipient])
            if response == 1:
                new_user.password = cls.hash_password(pin)
                try:
                    new_user.save()
                    message = 'User has been created successfully'
                    data = {'message': message, 'status': True}
                except IntegrityError:
                    message = 'Email already exist'
                    data = {'message': message, 'status': False}
            else:
                message = 'User creation failed'
                data = {'message': message, 'status': False}
        except smtplib.SMTPAuthenticationError:
            message = "user can not be added.Error! can't access mail server. check back later"
            data = {'message': message, 'status': False}
        return data

    @classmethod
    def get_permission(cls, **kwargs):
        try:
            user = cls.objects.get(**kwargs)
            permissions = json.loads(user.permissions)
            data = {"status": False, "permissions": permissions}
        except cls.DoesNotExist:
            message = "user does not exist"
            data = {"status": False, "message": message}
        return data

    @classmethod
    def get_user(cls, **kwargs):
        try:
            user = cls.objects.get(**kwargs)
            user_details = {
                "user_id": user.user_id,
                "email": user.email,
                "status": user.status,
                "user_type": user.user_type
            }
            data = {"status": True, "details": user_details, "user": user}
        except cls.DoesNotExist:
            message = "user does not exist"
            data = {"status": False, "message": message}
        return data

    @classmethod
    def hash_password(cls, password):
        """
            Takes plain text password and return a one way encrypted hash
            :param password:
            :return hash_pass:
        """
        encoded_password = password.encode()
        pct = hashlib.pbkdf2_hmac('sha256', encoded_password, b"5@l1m", 10000)
        dehex = binascii.hexlify(pct)
        hash_pass = dehex.decode()

        return hash_pass

    @classmethod
    def login_user(cls, username, password):
        try:
            user = cls.objects.get(email=username)
            password = cls.hash_password(password)
            if password == user.password:
                permissions = json.loads(user.permissions)
                message = "Login successful"
                data = {"status": True, "message": message, "user_id": user.user_id, "permissions": permissions,
                        "pk": user.id}
            else:
                login = False
                message = "password is incorrect"
                data = {"status": False, "message": message}
        except cls.DoesNotExist:
            message = "user does not exist"
            data = {"status": False, "message": message}
        return data

    @classmethod
    def update_password(cls, user_id, password):
        update = cls.objects.filter(id=user_id).update(password=cls.hash_password(password))
        return update


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=255)
    surname = models.CharField(max_length=255)
    other_name = models.CharField(max_length=255, null=True, blank=True)
    mobile_number = models.CharField(max_length=11, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    position = models.CharField(max_length=50, null=True, blank=True)

    objects = models.Manager()

    class Meta:
        ordering = ['pk']
        verbose_name_plural = "Profiles"

    class Admin:
        pass

    def __str__(self):
        return "%s %s" % (self.first_name, self.surname)

    @classmethod
    def add_profile(cls, **kwargs):
        cls(**kwargs).save()
        message = 'Profile has been created successfully'
        data = {'message': message, 'status': True}
        return data

    @classmethod
    def get_profile(cls, **kwargs):
        try:
            profile = cls.objects.select_related('user').get(**kwargs)
            profile_data = {"firstName": profile.first_name,
                            "surname": profile.surname,
                            "otherName": profile.other_name,
                            "mobileNumber": profile.mobile_number,
                            "address": profile.address,
                            "position": profile.position,
                            "email": profile.user.email
                            }

            data = {"status": True, "permissions": "profile", "obj": profile, "profile_data": profile_data}
        except cls.DoesNotExist:
            message = "profile does not exist"
            data = {"status": False, "message": message}
        return data

    @classmethod
    def update_profile(cls, **kwargs):
        user_id = kwargs.pop('user_id')
        profile = cls.objects.filter(user_id=user_id).update(**kwargs)
        if profile:
            data = {"status": True}
        else:
            message = "profile update failed"
            data = {"status": False, "message": message}
        return data
