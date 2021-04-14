# standard library
import binascii
import datetime
# import json
import calendar
import hashlib
from base64 import b64encode
from decimal import Decimal
from io import BytesIO
from django.core.files import File

# third-party
from operator import itemgetter
import simplejson as json
from PIL import Image

import requests

# Django
from django.conf import settings
from django.contrib import admin
from django.db import models, transaction
from django.db import IntegrityError
from django.db.models import Count, Sum, Prefetch, ProtectedError
from django.forms import model_to_dict
from django.http import JsonResponse
from django.utils import timezone
from django.core.serializers.json import DjangoJSONEncoder
from django.core.serializers import serialize
from django.utils.crypto import get_random_string

# local Django
from login.models import User
from .functions import money_format, seconds_to_days, last_usage
from .model_mixin import ModelMixin


class Activity(models.Model):
    activity_id = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255)

    objects = models.Manager()

    class Meta:
        ordering = ['pk']

    class Admin:
        pass

    def __str__(self):
        return self.name

    @classmethod
    def create_activity(cls, activity_id, name):
        try:
            activity = cls(
                activity_id=activity_id,
                name=name,
            ).save()
            return activity
        except IntegrityError:
            return False

    @classmethod
    def get_activity(cls, **kwargs):
        try:
            activity = cls.objects.get(**kwargs)
            return activity
        except cls.DoesNotExist:
            return False


class ActivityLogs(models.Model):
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    receiver = models.CharField(max_length=255, null=True)
    date = models.DateTimeField(default=timezone.now)

    objects = models.Manager()

    class Meta:
        ordering = ['pk']

    class Admin:
        pass

    def __str__(self):
        return self.user.user_id

    @classmethod
    def create_activity_log(cls, activity, user, receiver=None):
        log = cls(
            activity=activity,
            user=user,
            receiver=receiver
        ).save()
        return True

    @classmethod
    def fetch_log(cls, **kwargs):
        data = {}
        log_list = []
        logs = cls.objects.select_related().filter(**kwargs)
        if logs.count != 0:
            for log in logs:
                log_data = {"activity": log.activity.name,
                            "user": log.user.user_id, "date": log.date}
                log_list.append(log_data)
            data = {"status": True, "logs": log_list, "count": logs.count}
        else:
            data = {"status": False, "message": "No Logs to display"}
        return data


class Agent(ModelMixin):
    """
     Model to store agents bio data that use xchangebox payrep platform.
    """

    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female')
    )

    first_name = models.CharField(max_length=50, blank=True, null=True)
    surname = models.CharField(max_length=50, blank=True, null=True)
    other_name = models.CharField(max_length=50, blank=True, null=True)
    gender = models.CharField(
        max_length=50, choices=GENDER_CHOICES, blank=True, null=True)
    business_name = models.CharField(max_length=255, blank=True, null=True)
    mobile_number = models.CharField(max_length=12, unique=True)
    email = models.EmailField(max_length=255, null=True, blank=True)
    address = models.CharField(max_length=255)
    state = models.CharField(max_length=10, null=True, blank=True)
    status = models.BooleanField(default=True)

    objects = models.Manager()

    class Meta:
        ordering = ['pk']

    class Admin:
        pass

    def __str__(self):
        return "%s %s" % (self.first_name, self.surname)

    @classmethod
    def create_agent(cls, **kwargs):
        with transaction.atomic():
            try:
                pin = kwargs.pop('pin')
                agent = cls.objects.create(**kwargs)
                account_number = kwargs['mobile_number']
                account = Account.create_account(
                    account_number=account_number,
                    agent=agent,
                    pin=pin
                )
                if account and type(account) is not dict:
                    return agent
                else:
                    transaction.set_rollback(True)
                    return None
            except IntegrityError as e:
                print('zzzzzzzzzzzzzzzzzzzzzzz')
                print(e)
                return {'agent': None, "message": e.args[0]}

    @classmethod
    def update_agent(cls, **kwargs):
        with transaction.atomic():
            agent = cls.objects.filter(
                agent_id=kwargs['agent_id']).update(**kwargs)
            if agent:
                return {'status': True, "message": "agent details updated"}
            else:
                return {'status': False, "message": "agent update failed"}

    @classmethod
    def update_agent2(cls, **kwargs):
        with transaction.atomic():
            agent_id = kwargs['agent_id']
            kwargs.pop('agent_id')
            agent = cls.objects.filter(id=agent_id).update(**kwargs)
            if agent:
                return {'status': True, "message": "agent details updated"}
            else:
                return {'status': False, "message": "agent update failed"}

    @classmethod
    def fetch_agent(cls, **kwargs):
        agents = cls.objects.values('id', 'business_name')
        return agents
        # agents_data_list = []
        # if 'all' in kwargs:
        #     agents = cls.objects.all()
        #     count = agents.count()
        # else:
        #     agents = cls.objects.filter(**kwargs)
        #     count = agents.count()
        # for agent in agents:
        #     agent_data = agent.get_agent(id=agent.id)
        #     agents_data_list.append(agent_data)
        # return {"agents": agents, "count": count, "agents_data": agents_data_list}

    @classmethod
    def get_agents(cls):
        agents = Agent.objects.prefetch_related('account_set').all().values().annotate(
            accounts=Count('account__id')
        ).order_by('business_name')
        return list(agents)

    @classmethod
    def get_agents_summary(cls):
        number_agents = Agent.objects.all().count()
        buying_agents = Transaction.objects.values('account').filter(created_at__startswith=datetime.datetime.now().date()).order_by('-created_at').aggregate(
            count=Sum('id')
        )
        # print(66666666666666)
        # print(buying_agents)
        agent_summary = dict(number_agents=number_agents,
                             buying_agents=buying_agents)
        return agent_summary

    @classmethod
    def can_transfer(cls, agent_id, amount):
        agent = cls.objects.select_related('tier').get(id=agent_id)
        if agent.tier.transfer_limit >= amount:
            return True
        else:
            return False


class AccountLogin(models.Model):
    username = models.CharField(max_length=12, unique=True)
    password = models.CharField(max_length=255, null=True, blank=True)
    device_id = models.CharField(max_length=255, null=True, blank=True)
    transaction_pin = models.CharField(max_length=255, null=True, blank=True)
    pin = models.CharField(max_length=255, null=True, blank=True)
    device_reg_pin = models.CharField(max_length=255, null=True, blank=True)
    account = models.OneToOneField('Account', on_delete=models.CASCADE)
    status = models.BooleanField(default=True)
    session_id = models.CharField(max_length=255, null=True, blank=True)

    objects = models.Manager()

    class Admin:
        pass

    def __str__(self):
        return self.account.account_name

    @classmethod
    def hash_password(cls, ppt):
        bppt = ppt.encode()
        pct = hashlib.pbkdf2_hmac('sha256', bppt, b"5@l1m", 10000)
        dehex = binascii.hexlify(pct)
        hash_pass = dehex.decode()
        return hash_pass

    @classmethod
    def create_login(cls, username, pin, account):
        hashed_password = cls.hash_password(pin)
        cls(username=username,
            account=account,
            pin=hashed_password).save()

    @classmethod
    def validate_credentials(cls, username, password):
        try:
            credentials = cls.objects.get(username=username)
            if (credentials.password or credentials.pin) == cls.hash_password(password):
                return True
            else:
                return False
        except cls.DoesNotExist:
            return False

    @classmethod
    def reset_credentials(cls, username, pin):
        try:
            credentials = cls.objects.get(username=username)
            # if credentials.pin:
            #     return False
            # else:
            credentials.pin = cls.hash_password(pin)
            credentials.password = None
            credentials.transaction_pin = None
            credentials.save(
                update_fields=['pin', 'password', 'transaction_pin'])
            return True
        except cls.DoesNotExist:
            return False

    @classmethod
    def login(cls, request, username=None, password=None, device_id=None):
        try:
            credentials = cls.objects.get(username=username)
            request.session['account_id'] = credentials.account_id
            request.session['username'] = username
            if credentials.pin:
                if credentials.pin == cls.hash_password(password):
                    url = '/agent/change_password'
                    return {'status': True, 'url': url, 'device_id': device_id}
                else:
                    message = "Your OTP is wrong."
                    return {'status': False, 'message': message}
            else:
                if credentials.device_id and credentials.device_id == device_id:
                    if credentials.password == cls.hash_password(password):
                        url = '/agent/wallet'
                        return {'status': True, 'url': url}
                    else:
                        message = 'Your password is incorrect'
                        return {'status': False, 'message': message}
                else:
                    message = "Your device is not registered."
                    return {'status': False, 'message': message}
        except cls.DoesNotExist:
            message = "Username is incorrect."
            return {'status': False, 'message': message}

    @classmethod
    def validate_pin(cls, username, pin):
        credentials = cls.objects.get(username=username)
        if credentials.transaction_pin == cls.hash_password(pin):
            return True
        else:
            return False

    @classmethod
    def update_credentials(cls, **kwargs):
        if 'username' in kwargs:
            username = kwargs.pop('username')
            status = cls.objects.filter(username=username).update(**kwargs)
            return status
        elif 'account_id' in kwargs:
            account_id = kwargs.pop('account_id')
            status = cls.objects.filter(account_id=account_id).update(**kwargs)
            return status
        else:
            return None

    @classmethod
    def get_credentials(cls, **kwargs):
        if 'account_id' in kwargs:
            filters = {"account_id": kwargs['account_id']}
        elif 'username' in kwargs:
            filters = {"username": kwargs['username']}
        else:
            return None
        try:
            credentials = cls.objects.select_related('account').get(**filters)
            return credentials
        except cls.DoesNotExist:
            return None

        # if 'account_id' in kwargs:
        #     try:
        #         credentials = cls.objects.get(account_id=kwargs['account_id'])
        #         return credentials
        #     except cls.ObjectDoesNotExist:
        #         return None
        # else:
        #     return None

    @classmethod
    def change_password(cls, username=None, password=None, device_id=None, transaction_pin=None):
        try:
            credentials = cls.objects.get(username=username)
            if credentials.pin:
                password = cls.hash_password(password)
                transaction_pin = cls.hash_password(transaction_pin)
                update = cls.update_credentials(username=username,
                                                password=password,
                                                transaction_pin=transaction_pin,
                                                device_id=device_id,
                                                pin=None)
                if update:
                    return {'status': True}
                else:
                    return {'status': False}
            else:
                return {'status': False}
        except cls.DoesNotExist:
            message = "Username is incorrect."
            return {'status': False, 'message': message}


class Account(ModelMixin):
    """
     Model to store agent account .
    """
    TYPE_CHOICES = (
        ('primary', 'primary'),
        ('secondary', 'secondary')
    )

    account_number = models.CharField(max_length=12, unique=True)
    bank_account_number = models.CharField(
        max_length=255, null=True, blank=True)
    bank_name = models.CharField(max_length=255, null=True, blank=True)
    bank_code = models.CharField(max_length=255, null=True, blank=True)
    account_type = models.CharField(max_length=10, default='primary')
    balance = models.DecimalField(default=0, max_digits=19, decimal_places=2)
    status = models.BooleanField(default=False)

    agent = models.OneToOneField('Agent', on_delete=models.CASCADE)

    objects = models.Manager()

    class Meta:
        ordering = ['pk']
        indexes = [
            models.Index(fields=['account_number', ]),
        ]

    class Admin:
        pass

    def __str__(self):
        return "%s_%s" % (self.name, self.account_name)

    @classmethod
    def create_account(cls, **kwargs):
        with transaction.atomic():
            try:
                account = cls.objects.create(
                    account_number=kwargs['account_number'],
                    agent=kwargs['agent']
                )
                AccountLogin.create_login(username=kwargs['account_number'],
                                          pin=kwargs['pin'],
                                          account=account)
                return account

            except IntegrityError as e:
                return {'account': None, "message": e.args[0]}

    @classmethod
    def get_account(cls, **kwargs):
        if 'account_id' in kwargs:
            filters = {"id": kwargs['account_id']}
        elif 'account_number' in kwargs:
            filters = {"account_number": kwargs['account_number']}
        else:
            return None

        try:
            account = cls.objects.select_related('agent').get(**filters)
            return account
        except cls.DoesNotExist:
            return None

    @classmethod
    def update_account(cls, **kwargs):
        if 'account_id' in kwargs:
            filters = {"id": kwargs['account_id']}
            kwargs.pop('account_id')
        elif 'account_number' in kwargs:
            filters = {"account_number": kwargs['account_number']}
            kwargs.pop('account_number')
        else:
            return None

        try:
            update = cls.objects.filter(**filters).update(**kwargs)
            return update
        except cls.FieldDoesNotExist:
            return None

    @classmethod
    def get_accounts(cls):
        accounts = cls.objects.values('id', 'account_number', 'account_name')
        return accounts

    @classmethod
    def get_secondary_accounts(cls, account_id):
        try:
            primary_account = cls.objects.select_related(
                'agent').get(id=account_id)
            secondary_accounts = cls.objects.filter(
                agent=primary_account.agent).values()
            return secondary_accounts
        except cls.DoesNotExist:
            return None

    @classmethod
    def get_balance(cls, account_id):
        account = cls.objects.get(id=account_id)
        return {'balance': account.balance, 'lien': account.lien}

    @classmethod
    def get_balance_for_update(cls, account_id):
        account = cls.objects.select_for_update().get(id=account_id)
        return account.balance

    @classmethod
    def get_balance_for_update2(cls, account_id):
        account = cls.objects.select_for_update().get(id=account_id)
        return {'balance': account.balance, 'lien': account.lien, 'commission_due': account.commission_due, }

    @classmethod
    def get_lien(cls, account_id):
        account = cls.objects.get(id=account_id)
        return account.lien

    @classmethod
    def update_account_balance(cls, account_id, amount, commission=None, transaction_type='debit', com_due_stat=None):
        balance = cls.get_balance_for_update(account_id)

        if transaction_type == 'credit':
            new_balance = balance + Decimal(amount)
        else:
            new_balance = balance - Decimal(amount)

        if com_due_stat:
            cls.objects.filter(id=account_id).update(
                commission_due=0,
                commission_due_status=False,
            )

        if commission:
            new_commission = cls.objects.get(
                id=account_id).commission + Decimal(commission)
            cls.objects.filter(id=account_id).update(
                balance=new_balance,
                commission=new_commission
            )
        else:
            cls.objects.filter(id=account_id).update(
                balance=new_balance,
            )

    @classmethod
    def reset_commissions(cls, account_id, amount):
        with transaction.atomic():
            try:
                account = cls.objects.select_for_update().get(id=account_id)
                status = True
                new_commission = 0
                commission_due = amount
                if amount == 0:
                    status = False

                if account.commission != amount:
                    commission_diff = account.commission - amount

                account.commission = new_commission
                account.commission_due = commission_due
                account.commission_due_status = status
                account.save(update_fields=[
                             'commission', 'commission_due', 'commission_due_status'])
                return True
            except Exception as e:
                print(e)
                transaction.set_rollback(True)
                return False

    @classmethod
    def update_account_lien(cls, account_id, amount, transaction_type='debit'):
        account = cls.get_balance_for_update2(account_id)

        if transaction_type == 'credit':
            new_lien = account['lien'] + Decimal(amount)
        else:
            new_lien = account['lien'] - Decimal(amount)

        cls.objects.filter(id=account_id).update(
            lien=new_lien,
        )

    @classmethod
    def balance_check(cls, account_id, deductible, breakdown, is_reversal=False):
        account = cls.get_balance_for_update2(account_id)
        balance = account['balance']

        if account['lien'] > 0:
            balance -= account['lien']
        if is_reversal:
            breakdown['balance'] = balance
            breakdown['deductible'] = deductible
            breakdown['new_balance'] = balance - deductible
            breakdown['status'] = True
            return breakdown

        if deductible <= balance:
            breakdown['balance'] = balance
            breakdown['deductible'] = deductible
            breakdown['new_balance'] = balance - deductible
            breakdown['status'] = True
            return breakdown
        else:
            message = "Insufficient balance"
            return {"status": False, "message": message}

    @classmethod
    def fetch_accounts(cls):
        accounts_list = list()

        accounts = cls.objects.select_related('agent').all().prefetch_related(
            Prefetch('transaction_set',
                     queryset=Transaction.objects.filter(created_at__startswith=datetime.datetime.now().date(),
                                                         status='paid'),
                     to_attr='purchases'
                     ),

            Prefetch('transaction_set',
                     queryset=Transaction.objects.filter(created_at__startswith=datetime.datetime.now().date(),
                                                         status='packaged'),
                     to_attr='packaged'
                     )
        )

        for acc in accounts:
            acc_dict = dict(name=acc.agent.first_name + ' ' + acc.agent.surname,
                            agent_id=acc.agent.id,
                            status=acc.agent.status)
            # acc.transaction_set.all().count()
            acc_dict['purchases'] = len(acc.purchases)
            acc_dict['packaged'] = len(acc.packaged)
            accounts_list.append(acc_dict)
        return accounts_list

    @classmethod
    def get_accounts_summary(cls):
        accounts_summary = cls.objects.aggregate(number_accounts=Count('id'),
                                                 balances=Sum('balance'),
                                                 )
        return accounts_summary


class ReferenceNumbers(models.Model):
    reference_number = models.CharField(max_length=10, unique=True)

    objects = models.Manager()

    class Admin:
        pass

    class Meta:
        ordering = ['pk']
        indexes = [
            models.Index(fields=['reference_number', ]),
        ]

    def __str__(self):
        return self.reference_number

    @classmethod
    def create_reference_number(cls):
        while True:  # check for uniqueness of transaction reference number
            num = get_random_string(length=4,
                                    allowed_chars='1234567890')
            char = get_random_string(length=4,
                                     allowed_chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ')
            ref = num[:3] + char[:3] + num[-1:] + char[-1:]
            try:
                ReferenceNumbers.objects.get(reference_number=ref)
            except cls.DoesNotExist:  # if reference is unique create it and return it
                ReferenceNumbers(reference_number=ref).save()
                return ref


class Transaction(ModelMixin):
    STATUS = (
        ("paid", "paid"),
        ("pending", "pending"),
        ("failed", "failed"),
        ("packaged", "packaged"),
        ("collected", "collected"),
    )

    TXN_TYPE = (
        ("credit", "credit"),
        ("debit", "debit"),
    )

    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    product = models.ForeignKey(
        'Product', on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.IntegerField(default=0)
    amount = models.DecimalField(default=0, max_digits=19, decimal_places=2)
    reference_number = models.CharField(max_length=10, unique=True)
    third_party_ref = models.CharField(max_length=255, null=True, blank=True)
    beneficiary_account_name = models.CharField(
        max_length=255, null=True, blank=True)
    account_number = models.CharField(max_length=255, null=True, blank=True)
    bank = models.CharField(max_length=255, null=True, blank=True)
    fi = models.CharField(max_length=255, null=True, blank=True)
    remarks = models.CharField(max_length=255, null=True, blank=True)

    charges = models.DecimalField(default=0, max_digits=19, decimal_places=2)
    service_charges = models.DecimalField(
        default=0, max_digits=19, decimal_places=2)
    balance_before = models.DecimalField(
        default=0, max_digits=19, decimal_places=2)
    balance_after = models.DecimalField(
        default=0, max_digits=19, decimal_places=2)

    transaction_type = models.CharField(max_length=255, choices=TXN_TYPE)
    transaction_description = models.CharField(
        max_length=255, null=True, blank=True)
    transaction_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(
        max_length=10, choices=STATUS, default="successful")
    is_reversed = models.BooleanField(default=False)
    is_reversal = models.BooleanField(default=False)
    is_lien = models.BooleanField(default=False)
    parent = models.ForeignKey(
        'Transaction', on_delete=models.SET_NULL, null=True, blank=True)

    objects = models.Manager()

    class Meta:
        ordering = ['-pk']
        indexes = [
            models.Index(fields=['reference_number',
                                 'third_party_ref',
                                 'account_number',
                                 'account',
                                 'product']
                         ),
        ]

    class Admin:
        pass

    def __str__(self):
        return self.reference_number

    @classmethod
    def create_transaction(cls, **kwargs):
        if kwargs['transaction_description'] == "bank transfer":
            try:
                new_transaction = cls.objects.create(
                    account_id=kwargs['account_id'],
                    service_id=kwargs['service_id'],
                    reference_number=kwargs['reference_number'],
                    transaction_type="debit",
                    transaction_description='bank transfer',
                    amount=kwargs['amount'],
                    beneficiary_account_name=kwargs['beneficiary_account_name'],
                    account_number=kwargs['account_number'],
                    bank=kwargs['bank'],
                    fi=kwargs['fi'],
                    remarks=kwargs['remarks'],
                    balance_before=kwargs['balance_before'],
                    balance_after=kwargs['balance_after'],
                    charges=kwargs['agent_commission'] +
                    kwargs['company_commission'] + kwargs['bank_charges'],
                    agent_commission=kwargs['agent_commission'],
                    company_commission=kwargs['company_commission'],
                    bank_charges=kwargs['bank_charges'],
                    status='pending'
                )
                return new_transaction
            except IntegrityError:
                return False

        if kwargs['transaction_description'] == "bank transfer reversal":
            with transaction.atomic():
                try:

                    parent = cls.objects.get(reference_number=kwargs['parent_reference_number'],
                                             is_reversed=False)
                    parent.is_reversed = True
                    parent.save(update_fields=['is_reversed'])
                except cls.DoesNotExist:
                    return False

                try:
                    new_transaction = cls.objects.create(
                        account_id=kwargs['account_id'],
                        service_id=kwargs['service_id'],
                        reference_number=kwargs['reference_number'],
                        third_party_ref=kwargs['third_party_ref'],
                        transaction_type="credit",
                        transaction_description='bank transfer reversal',
                        amount=kwargs['amount'],
                        beneficiary_account_name=kwargs['beneficiary_account_name'],
                        account_number=kwargs['account_number'],
                        bank=kwargs['bank'],
                        fi=kwargs['fi'],
                        remarks=kwargs['remarks'],
                        balance_before=kwargs['balance_before'],
                        balance_after=kwargs['balance_after'],
                        charges=kwargs['agent_commission'] +
                        kwargs['company_commission'] + kwargs['bank_charges'],
                        agent_commission=kwargs['agent_commission'],
                        company_commission=kwargs['company_commission'],
                        bank_charges=kwargs['bank_charges'],
                        is_reversal=True,
                        parent=parent
                    )
                    return new_transaction
                except IntegrityError:
                    transaction.set_rollback(True)
                    return False

    @classmethod
    def create_funding_transaction(cls, **kwargs):
        if kwargs['transaction_description'] == "funding":
            try:
                new_transaction = cls.objects.create(
                    account_id=kwargs['account_id'],
                    service_id=kwargs['service_id'],
                    reference_number=kwargs['reference_number'],
                    transaction_type=kwargs['transaction_type'],
                    transaction_description=kwargs['transaction_description'],
                    amount=kwargs['amount'],
                    fi=kwargs['fi'],
                    balance_before=kwargs['balance_before'],
                    balance_after=kwargs['balance_after'],
                    charges=kwargs['charges'],
                    agent_commission=kwargs['agent_commission'],
                    company_commission=kwargs['company_commission'],
                    bank_charges=kwargs['bank_charges'],
                    status=kwargs['status'],
                )
                return new_transaction
            except IntegrityError:
                return False

        if kwargs['transaction_description'] == "funding reversal":
            with transaction.atomic():
                try:
                    parent = cls.objects.get(reference_number=kwargs['reference_number'],
                                             is_reversed=False)
                    parent.is_reversed = True
                    parent.save(update_fields=['is_reversed'])
                except cls.DoesNotExist:
                    return False
                except IntegrityError:
                    return False

                try:
                    new_transaction = cls.objects.create(
                        account_id=kwargs['account_id'],
                        service_id=kwargs['service_id'],
                        reference_number=kwargs['reference_number'],
                        transaction_type="debit",
                        transaction_description='funding reversal',
                        amount=kwargs['amount'],
                        fi=kwargs['fi'],
                        balance_before=kwargs['balance_before'],
                        balance_after=kwargs['balance_after'],
                        charges=kwargs['charges'],
                        agent_commission=kwargs['agent_commission'],
                        company_commission=kwargs['company_commission'],
                        bank_charges=kwargs['bank_charges'],
                        status='successful',
                        is_reversal=True,
                        parent=parent
                    )
                    return new_transaction
                except IntegrityError as e:
                    transaction.set_rollback(True)
                    return False

    @classmethod
    def create_deduction_transaction(cls, **kwargs):
        if kwargs['transaction_description'] == "deduction":
            try:
                new_transaction = cls.objects.create(**kwargs)
                return new_transaction
            except IntegrityError:
                return False

        if kwargs['transaction_description'] == "deduction reversal":
            with transaction.atomic():
                try:
                    parent = cls.objects.get(reference_number=kwargs['reference_number'],
                                             is_reversed=False)
                    parent.is_reversed = True
                    parent.save(update_fields=['is_reversed'])
                except cls.DoesNotExist:
                    return False

                try:
                    new_transaction = cls.objects.create(
                        **kwargs,
                        parent=parent
                    )
                    return new_transaction
                except IntegrityError:
                    transaction.set_rollback(True)
                    return False

    @classmethod
    def update_transaction(cls, obj, **kwargs):
        obj.third_party_ref = kwargs['third_party_ref']
        obj.status = kwargs['status']
        if 'token' in kwargs:
            obj.token = kwargs['token']

        if kwargs['status'] == 'failed':
            '''
                Added balance after to kwargs to be used later in 
                unpacking during update_fields of the save method.
            '''
            kwargs['balance_after'] = obj.balance_before
            obj.balance_after = kwargs['balance_after']
            obj.charges = 0
            obj.agent_commission = 0
            obj.company_commission = 0
            obj.bank_charges = 0

            kwargs['charges'] = obj.charges
            kwargs['agent_commission'] = obj.agent_commission
            kwargs['company_commission'] = obj.company_commission
            kwargs['bank_charges'] = obj.bank_charges

        return obj.save(update_fields=[*kwargs])

    @classmethod
    def update_transaction_details(cls, reference_number, **kwargs):
        update = cls.objects.filter(
            reference_number=reference_number).update(**kwargs)
        return update

    @classmethod
    def get_transactions(cls, filters=None):
        queryset = None
        if filters:
            pass
        else:
            queryset = cls.objects.all().order_by('-created_at')[:500].values(
                'account__id', 'account__account_name', 'service__code', 'amount', 'reference_number',
                'third_party_ref', "token",
                'rrn', 'terminal_id', 'beneficiary_account_name', 'account_number', 'card_number', 'bank', 'fi',
                'remarks',
                'charges', 'agent_commission', 'company_commission', 'bank_charges', 'balance_before', 'balance_after',
                'transaction_type', 'transaction_description', 'transaction_date', 'status', 'is_reversed',
                'is_reversal', 'parent', 'created_at', 'is_lien'
            )

        return queryset

    @classmethod
    def transfer_summary(cls, account_id, date=None):
        if date:
            created_at = date
        else:
            created_at = timezone.now().date()
        values = cls.objects.values('account_id').annotate(num_transfers=Count('id'),
                                                           bank_transfers_net=Sum(
                                                               'amount'),
                                                           charges=Sum(
                                                               'charges')
                                                           ).filter(account_id=account_id,
                                                                    service_id=1,
                                                                    is_reversed=False,
                                                                    is_reversal=False,
                                                                    status='successful',
                                                                    created_at__startswith=created_at).order_by()

        if values.count() == 0:
            return {"num_transfers": 0, "bank_transfers_net": 0}
        return values[0]

    @classmethod
    def get_transaction_summary(cls, account_id, date):
        transfer_summary = cls.transfer_summary(account_id, date=date)
        withdrawal_summary = cls.withdrawal_summary(account_id, date=date)
        bills_summary = cls.bills_summary(account_id, date=date)
        query = cls.objects.filter(account_id=account_id, created_at__startswith=date).aggregate(
            commissions=Sum('agent_commission')
        )
        past_day = date.day - 1
        past_day_date = date.replace(day=past_day)
        closing_query = cls.objects.filter(
            account_id=account_id, created_at__startswith=date).order_by('-created_at')[:1]
        opening_query = cls.objects.filter(
            account_id=account_id, created_at__startswith=past_day_date).order_by('-created_at')[:1]
        if closing_query.count() == 0:
            return False
        if opening_query.count() == 0:
            opening_balance = 0
        else:
            opening_balance = opening_query[0].balance_after
        summary = dict(closing_balance=closing_query[0].balance_after,
                       opening_balance=opening_balance, commissions=query['commissions'])
        summary.update(bills_summary)
        summary.update(withdrawal_summary)
        summary.update(transfer_summary)
        return summary

    @classmethod
    def get_company_earned_commission(cls, account_id, month, year):
        # earned_commission = cls.objects.values('account_id').annotate(commission=Sum('company_commission')).filter(
        #     account_id=account_id,
        #     created_at__month=month,
        #     created_at__year=year,
        #     status='successful',
        #     is_reversed=False
        # ).order_by()

        query = cls.objects.filter(
            account_id=account_id,
            created_at__month=month,
            created_at__year=year,
            status='successful',
            is_reversed=False
        ).aggregate(commission=Sum('company_commission'))
        if query['commission']:
            return query['commission']
        else:
            return 0

    @classmethod
    def get_agent_earned_commission(cls, month, year):
        account_dict = dict()
        earned_commissions = cls.objects.values('account_id', 'account__account_name', 'account__agent__business_name'
                                                ).annotate(commission=Sum('agent_commission')).filter(
            created_at__month=month,
            created_at__year=year,
            status='successful',
            is_reversed='False',
            is_reversal='False'
        ).order_by()

        for com in earned_commissions:
            account_dict[com['account_id']] = com

        return account_dict


class Category(ModelMixin):
    name = models.CharField(max_length=20, unique=True)

    objects = models.Manager()

    class Meta:
        ordering = ['pk']

    class Admin:
        pass

    def __str__(self):
        return self.name


class Product(ModelMixin):
    category = models.ForeignKey(
        Category, null=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=255, unique=True)
    quantity = models.IntegerField(default=0)
    unit_price = models.DecimalField(
        default=0, max_digits=19, decimal_places=2)
    agent_price = models.DecimalField(
        default=0, max_digits=19, decimal_places=2)
    quantity_left = models.IntegerField(default=0)
    in_stock = models.BooleanField(default=True)
    stock_date = models.DateTimeField(default=timezone.now)
    sold_date = models.DateTimeField(null=True)

    objects = models.Manager()

    class Meta:
        ordering = ['pk']

    class Admin:
        pass

    def __str__(self):
        return "%s" % (self.name)

    @classmethod
    def create_product(cls, **kwargs):
        try:
            product = cls.objects.create(**kwargs)
            return product
        except IntegrityError as e:
            return {'account': None, "message": e.args[0]}

    @classmethod
    def get_product(cls, **kwargs):
        try:
            account = cls.objects.get(**kwargs)
            return account
        except cls.DoesNotExist:
            return None

    @classmethod
    def update_product(cls, product_id, **kwargs):
        try:
            update = cls.objects.filter(**product_id).update(**kwargs)
            return update
        except cls.FieldDoesNotExist:
            return None

    @classmethod
    def get_products(cls, in_stock=None, sold=None):
        if not in_stock and not sold:
            products = cls.objects.values('name', 'quantity', 'category__name', 'unit_price',
                                          'agent_price', 'quantity_left', 'in_stock', 'stock_date', 'sold_date')
            print('whyyy')
        else:
            filters = dict()
            if in_stock == True:
                filters['in_stock'] = True
            elif sold:
                filters['in_stock'] = False

            products = cls.objects.filter(**filters).values('name', 'quantity', 'category__name', 'unit_price',
                                                            'agent_price', 'quantity_left', 'in_stock', 'stock_date', 'sold_date')

        return list(products)

    @classmethod
    def get_balance(cls, account_id):
        account = cls.objects.get(id=account_id)
        return {'balance': account.balance, 'lien': account.lien}

    @classmethod
    def get_product_stock_for_update(cls, product_id):
        product = cls.objects.select_for_update().get(id=product_id)
        return product.quantity_left

    @classmethod
    def update_product_balance(cls, product_id, number, transaction_type='debit'):
        quantity = cls.get_product_stock_for_update(product_id)

        if transaction_type == 'credit':
            quantity_left = quantity + number
        else:
            quantity_left = quantity - number

        update = cls.objects.filter(id=product_id).update(
            quantity_left=quantity_left)
        return update

    @classmethod
    def get_products_summary(cls):
        summary = cls.objects.filter(in_stock=True).aggregate(
            total_stock=Sum('quantity'),
            stock_left=Sum('quantity_left'),
        )

        return summary


class ProductImage(ModelMixin):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, null=True, blank=True)
    description = models.CharField(max_length=255, null=True, blank=True)
    image = models.ImageField(null=True, blank=True,
                              upload_to="media/products")

    objects = models.Manager()

    class Meta:
        ordering = ['pk']

    class Admin:
        pass

    def __str__(self):
        return "%s_%s" % (self.name, self.product.name)

    @classmethod
    def compressImage(cls, image):
        im = Image.open(image)
        imageObj = BytesIO()

        im.save(imageObj, format='JPEG', quality=70)
        return File(imageObj, name=image.name)

    @classmethod
    def create_product_image(cls, **kwargs):
        try:
            product = cls.objects.create(**kwargs)
            return product
        except IntegrityError as e:
            return {"message": e.args[0]}

    @classmethod
    def get_product_images(cls, product_id):
        try:
            images = cls.objects.filter(
                product_id=product_id).values_list('image', flat=True)
            return images
        except cls.DoesNotExist:
            return None

    @classmethod
    def get_product_image(cls, product_id):
        images = cls.objects.select_related(
            'Product').filter(product_id=product_id)
        return images


class EmailTracker(ModelMixin):
    address = models.EmailField()
    message = models.TextField()
    status = models.BooleanField(default=True)

    objects = models.Manager()

    class Admin:
        pass

    def __str__(self):
        return self.address

    @classmethod
    def create_record(cls, **kwargs):
        cls(**kwargs).save()
