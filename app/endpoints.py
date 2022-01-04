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
    PaymentAccount,
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
            request_data = {"bvn": data["bvn"], "dob": data["date_of_birth"]}
            account_number = get_random_string(
                length=11, allowed_chars="1234567890"
            )  # remove later!
            # response = send_request(url, request_data) TODO: UNCOMMENT THIS LATER!
            response = dict(status=True, account_number=account_number)

            if response["status"]:
                data["account_number"] = response["account_number"]

                if data["status"] == "on":
                    data["status"] = True
                else:
                    data["status"] = False

                if "can_request_loan" in data:
                    data["can_request_loan"] = True

                if "can_request_discount" in data:
                    data["can_request_discount"] = True

                pin = get_random_string(length=6, allowed_chars="1234567890")

                message = (
                    f"Welcome to {settings.APP_NAME}.\n kindly use the username and pin below to "
                    f"login and change your password.\n"
                    f"USERNAME:{data['mobile_number']}\nPIN:{pin}"
                )
                new_agent = Agent.create_agent(**data, pin=pin)
                if new_agent and type(new_agent) is not dict:
                    send_email(data["email"], message)
                    return JsonResponse(
                        data={
                            "status": True,
                            "username": data["mobile_number"],
                            "pin": pin,
                        }
                    )
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
        data = json.loads(request.data.get("formData", dict()))
        data["price_structure"] = json.dumps(data["price_structure"])
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
        fi = "vfd"
        transaction_type = "debit"
        transaction_description = request.data.get("transaction_description", None)
        product_id = request.data.get("product_id", None)
        price = Decimal(request.data.get("price", 0))
        payment_type = request.data.get("payment_type", None)
        shipping_address = request.data.get("shipping_address", None)
        mobile_number = request.data.get("mobile_number", None)
        transaction_date = timezone.now()
        # url = settings.AGGREGATOR_URL + "/api/"  # TODO: create url on aggregator

        payable_amount = quantity * price

        # account = Account.get_account(account_id=account_id)

        reference_number = ReferenceNumbers.create_reference_number()

        payment_account = PaymentAccount.get_available_account()

        if payment_account is None:
            return JsonResponse(
                data={
                    "status": False,
                    "message": "An error has occurred, please try again",
                }
            )

        details = {
            "product_id": product_id,
            "quantity": quantity,
            "amount": payable_amount,
            "reference_number": reference_number,
            "account_number": payment_account.account_number,
            "fi": "vfd",
            "transaction_type": transaction_type,
            "transaction_description": transaction_description,
            "transaction_date": transaction_date,
            "shipping_address": shipping_address,
            "mobile_number": mobile_number,
            "price": price,
        }

        new_transaction = Transaction.create_transaction(**details)

        if new_transaction:
            payment_account = PaymentAccount.update_payment_account_status(
                payment_account.id, "in-use"
            )
            if payment_account:
                return JsonResponse(
                    data={"status": True, "account_number": details["account_number"]}
                )
            return JsonResponse(
                data={
                    "status": False,
                    "message": "Account update failed",
                }
            )

        return JsonResponse(
            data={
                "status": False,
                "message": "An error has occurred, please try again",
            }
        )


class GetPaymentAccounts(APIView):
    @staticmethod
    def get(request):
        payment_accounts = PaymentAccount.get_payment_accounts()
        return JsonResponse(data=payment_accounts, safe=False)


class CreatePaymentAccount(APIView):
    @staticmethod
    def post(request):
        rc_number = request.data.get("rc_number", None)
        company_name = request.data.get("company_name", None)
        incorporation_date = request.data.get("incorporation_date", None)
        status = request.data.get("status", "available")
        if status == "":
            status = "available"

        if incorporation_date:
            incorporation_date = datetime.datetime.strptime(
                incorporation_date, "%m/%d/%Y"
            ).strftime("%Y-%m-%d")

        url = settings.AGGREGATOR_URL + "api/vfd_create_corporate_account"
        data = dict(
            rc_number=rc_number,
            company_name=company_name,
            incorporation_date=incorporation_date,
            status=status,
        )

        with transaction.atomic():
            payment_account = PaymentAccount.create_payment_account(**data)
            if not payment_account:
                return JsonResponse(
                    data={"status": False, "message": "account creation failed"},
                    safe=False,
                )

            try:
                response = requests.post(
                    url,
                    data=json.dumps(data),
                    headers={
                        "Content-Type": "application/json",
                        "Username": settings.MERCHANT_ID,
                        "Authorization": settings.AUTHORIZATION,
                    },
                )
                if not response.ok:
                    message = "server error"
                    transaction.set_rollback(True)
                    return JsonResponse(
                        data={"status": False, "message": message}, safe=False
                    )
            except requests.exceptions.RequestException:
                message = "connection error"
                transaction.set_rollback(True)
                return JsonResponse(
                    data={"status": False, "message": message}, safe=False
                )

            try:
                response_data = response.json()
                if "status" in response_data and response_data["status"]:
                    account_number = response_data["result"]["account_number"]
                    update = PaymentAccount.update_payment_account(
                        payment_account.id, account_number=account_number
                    )
                    if update:
                        return JsonResponse(data={"status": True}, safe=False)
                    transaction.set_rollback(True)
                    return JsonResponse(
                        data={"status": False, "message": "account update failed"},
                        safe=False,
                    )
                else:
                    message = response_data["result"]["message"]
                    transaction.set_rollback(True)
                    return JsonResponse(
                        data={"status": False, "message": message}, safe=False
                    )
            except Exception:
                message = "decode error"
                transaction.set_rollback(True)
                return JsonResponse(
                    data={"status": False, "message": message}, safe=False
                )


class UpdatePaymentAccount(APIView):
    @staticmethod
    def post(request):
        rc_number = request.data.get("rc_number", None)
        company_name = request.data.get("company_name", None)
        incorporation_date = request.data.get("incorporation_date", None)
        status = request.data.get("status", "available")
        account_id = request.data.get("id", None)
        if status == "":
            status = "available"
        if incorporation_date:
            incorporation_date = datetime.datetime.strptime(
                incorporation_date, "%Y-%m-%d"
            )
        data = dict(
            rc_number=rc_number,
            company_name=company_name,
            incorporation_date=incorporation_date,
            status=status,
        )
        payment_account = PaymentAccount.update_payment_account(account_id, **data)
        if payment_account:
            return JsonResponse(data={"status": True}, safe=False)
        return JsonResponse(data={"status": False}, safe=False)


class DeletePaymentAccount(APIView):
    @staticmethod
    def post(request):
        account_id = request.data.get("account_id", None)
        payment_account = PaymentAccount.delete_payment_account(account_id)
        if payment_account:
            return JsonResponse(data={"status": True}, safe=False)
        return JsonResponse(data={"status": False}, safe=False)
