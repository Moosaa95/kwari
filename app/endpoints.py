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
from .models import (
    Agent,
    Account,
    AccountLogin,
    ReferenceNumbers,
    Transaction,
    Product,
    ProductImage,
)

# from .tasks import send_email, manual_funding
# from .mixins import ActiveAgentRequiredMixin
from .tasks import send_email
from .functions import send_request


class GetAgentsList(APIView):
    @staticmethod
    def post(request):
        agents_list = Agent.fetch_agents()
        return JsonResponse(agents_list, safe=False)


class CreateAgent(APIView):
    def post(self, request):
        data = dict(request.POST.dict())
        url = settings.AGGREGATOR_URL + "api/vfd_create_wallet"

        if "bvn" in data and "date_of_birth" in data:
            data["date_of_birth"] = datetime.datetime.strptime(
                data["date_of_birth"], "%m/%d/%Y"
            )
            print(data)
            request_data = {"bvn": data["bvn"], "dob": data["date_of_birth"]}
            # response = send_request(url, request_data) TODO: UNCOMMENT THIS LATER!
            response = dict(status=True, account_number="9077179994")

            if response["status"]:
                data["account_number"] = response["account_number"]

                if data["status"] == "on":
                    data["status"] = True
                else:
                    data["status"] = False

                pin = get_random_string(length=6, allowed_chars="1234567890")

                message = (
                    f"Welcome to {settings.APP_NAME}.\n kindly use the username and pin below to "
                    f"login and change your password.\n"
                    f"USERNAME:{data['mobile_number']}\nPIN:{pin}"
                )
                new_agent = Agent.create_agent(**data, pin=pin)
                if new_agent and type(new_agent) is not dict:
                    send_email(data["email"], message)
                    return JsonResponse(data={"status": True})
                else:
                    return JsonResponse(
                        data={"status": False, "message": new_agent["message"]}
                    )
            else:
                return JsonResponse(
                    data={
                        "status": False,
                        "message": "An error occurred, please try again later",
                    }
                )
        else:
            return JsonResponse(
                data={
                    "status": False,
                    "message": "no bvn or date of birth supplied",
                }
            )


class GetProducts(APIView):
    @staticmethod
    def get(request):
        in_stock = request.query_params.get("in_stock", None)
        sold = request.query_params.get("sold", None)
        products = Product.get_products(in_stock=in_stock, sold=sold)
        return JsonResponse(data=products, safe=False)


class CreateProduct(APIView):
    @staticmethod
    def post(request):
        data = dict(request.POST.dict())
        if data["in_stock"] == "on":
            data["in_stock"] = True
        else:
            data["in_stock"] = False
        product = Product.create_product(**data)

        if product and type(product) is not dict:
            return JsonResponse(data={"status": True})
        else:
            return JsonResponse(data={"status": False, "message": product["message"]})


class AddProductImage(APIView):
    @staticmethod
    def post(request):
        data = dict(request.POST.dict())
        compressed_image = ProductImage.compress_image(request.FILES["image"])
        data["image"] = compressed_image
        product_image = ProductImage.create_product_image(**data)
        if product_image and type(product_image) is not dict:
            return JsonResponse(data={"status": True})
        else:
            return JsonResponse(
                data={"status": False, "message": product_image["message"]}
            )


@method_decorator(csrf_exempt, name="dispatch")
class GetHomeProductsImages(APIView):
    def post(self, request):
        tag = request.query_params.get("tag", None)
        if not tag:
            tag = "latest"
        products = ProductImage.get_products_and_images(
            filters={"product__tags__tag_id": tag}
        )
        return JsonResponse(data=products, safe=False)


class InitiateTransaction(APIView):
    def post(self, request):
        quantity = int(request.data.get("quantity", 1))
        amount = Decimal(request.data.get("amount", None))
        account_number = request.data.get("account_number", None)
        fi = request.data.get("fi", None)
        transaction_type = "debit"
        transaction_description = request.data.get("transaction_description", None)
        product_id = request.data.get("product_id", None)
        account_id = request.session["account_id"]
        service_charge = request.data.get("service_charge", 0)
        payment_type = request.data.get("payment_type", None)
        transaction_date = datetime.date.today()

        url = settings.AGGREGATOR_URL + "/api/"  # TODO: create url on aggregator

        payable_amount = (quantity * amount) + service_charge

        account = Account.get_account(account_id=account_id)

        reference_number = ReferenceNumbers.create_reference_number()

        details = {
            "agent": account.agent,
            "product_id": product_id,
            "quantity": quantity,
            "amount": amount,
            "reference_number": reference_number,
            "account_number": account_number,
            "fi": "vfd",
            "transaction_type": transaction_type,
            "transaction_description": transaction_description,
            "transaction_date": transaction_date,
            "balance_before": account.balance,
        }

        new_transaction = Transaction.create_transaction(**details)

        if new_transaction:
            if payment_type == "wallet transfer":
                request_data = {
                    "account_number": account_number,
                    "payable_amount": payable_amount,
                }

                # TODO: senf required fields and value to aggregator for forwarding

            else:
                return JsonResponse(data={"status": True})
        else:
            return JsonResponse(
                data={
                    "status": False,
                    "message": "An error has occurred, please try again",
                }
            )
