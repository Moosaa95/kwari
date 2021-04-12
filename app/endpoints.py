# Standard Lib
import datetime
import calendar
import json
import smtplib

# Third-party lib
from decimal import Decimal

import requests
from compat import JsonResponse
from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

# Django


# Local
# from agent.functions import send_request, money_format
from .models import Agent, Account, AccountLogin, ReferenceNumbers, Transaction, Product
# from .tasks import send_email, manual_funding
# from .mixins import ActiveAgentRequiredMixin
from .tasks import send_email


class GetAgentsList(APIView):
    def post(self, request):
        agents_list = Account.fetch_accounts()
        print(111111111111111111111)
        print(agents_list)
        print(11111111111111)
        return JsonResponse(agents_list, safe=False)


# @method_decorator(csrf_exempt, name='dispatch')
class CreateAgent(APIView):
    def post(self, request):

        data = dict(request.POST.dict())
        if data['status'] == 'on':
            data['status'] = True
        else:
            data['status'] = False

        pin = get_random_string(length=6, allowed_chars='1234567890')

        message = f"Welcome to {settings.APP_NAME}.\n kindly use the username and pin below to " \
                  f"login and change your password.\n" \
                  f"USERNAME:{data['mobile_number']}\nPIN:{pin}"
        new_agent = Agent.create_agent(
            **data,
            pin=pin
        )
        if new_agent and type(new_agent) is not dict:
            send_email(data['email'], message)
            return JsonResponse(data={'status': True})
        else:
            return JsonResponse(data={'status': False, 'message': new_agent['message']})


class GetProductsList(APIView):
    def get(self, request):
        in_stock = request.query_params.get('in_stock', None)
        sold = request.query_params.get('sold', None)
        products = Product.get_products(in_stock=in_stock, sold=sold)
        return JsonResponse(data=products, safe=False)

        # if in_stock:
        #     products = Product.get_products(in_stock=True, sold=None)
        #     print(products)
        # else:
        #     products = Product.get_products(in_stock=True, sold=None)
        #     print(products)

        # if request.query_params.get('in_stock'):
        #     products = Product.get_products(in_stock=True, sold=None)
        #     print(products)
        #     return JsonResponse(products, safe=False)
        # else:
        #     products = Product.get_products(in_stock=None, sold=None)
        #     return JsonResponse(products, safe=False)
    def post(self, request):
        data = dict(request.POST.dict())
        if data['in_stock'] == 'on':
            data['in_stock'] = True
        else:
            data['in_stock'] = False
        product = Product.create_product(**data)
        if product and type(product) is not dict: 
            return JsonResponse(data={"status": True})
        else:
            return JsonResponse(data={'status': False, 'message': product['message']})
            
