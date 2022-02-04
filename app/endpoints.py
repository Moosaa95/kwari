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
        print("======================")
        print(request.data)
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

        if not new_transaction:
            return JsonResponse(
                data={
                    "status": False,
                    "message": "An error has occurred, please try again",
                }
            )

        up = PaymentAccount.toggle_account_status(
            payment_account.account_number, "in-use"
        )

        if not up:
            return JsonResponse(
                data={
                    "status": False,
                    "message": "Account update failed",
                }
            )

        return JsonResponse(
            data={"status": True, "account_number": details["account_number"]}
        )


class PaymentNotification(APIView):
    """
    create new withdrawal transaction notice.
    """

    def post(self, request):
        data = dict()
        amount = Decimal(request.data.get("amount", 0))
        account_number = request.data.get("account_number", None)
        # account = Account.get_account(bank_account_number=account_number)
        sender_account = request.data.get("originator_account_number", None)
        sender_name = request.data.get("originator_account_name", None)
        bank_code = request.data.get("originator_bank", None)
        remarks = request.data.get("originator_narration", None)

        # if not account:
        #     message = {
        #         "response_code": "01",
        #         "error": True,
        #         "status": False,
        #         "account_number": account_number,
        #         "message": "Account number not assigned.",
        #     }
        #     return Response(message, status=status.HTTP_200_OK)

        details = dict(
            amount_paid=amount,
            account_number=account_number,
            sender_account=sender_account,
            sender_name=sender_name,
            bank_code=bank_code,
            remarks=remarks,
            status="paid",
        )
        txn = Transaction.get_transaction(
            account_number=account_number, status="pending"
        )

        if not txn:
            message = {
                "response_code": "01",
                "error": True,
                "status": False,
                "account_number": account_number,
                "message": "Transaction with Account number does not exist.",
            }
            return Response(message, status=status.HTTP_200_OK)

        Transaction.update_transaction_details(**details)
        PaymentAccount.toggle_account_status(account_number, "available")
        message = {
            "response_code": "00",
            "message": "Transaction successfully",
            "account_number": account_number,
            "error": False,
            "status": True,
        }
        return Response(message, status=status.HTTP_201_CREATED)


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


class GetTransactionSearchOptions(APIView):
    def post(self, request):
        data = dict(
            # agents=Agent.fetch_agent(),
            # accounts=Account.get_accounts(),
            # services=Service.get_services(),
        )
        return Response(data=data, status=status.HTTP_200_OK)


class TransactionFilter(APIView):
    """filters transactions for transaction search, agent transaction search, report generation"""

    def post(self, request, *args, **kwargs):
        count = request.POST.get("count", None)
        filters = request.POST.get("filter", None)
        name = request.POST.get("name", None)
        report = request.POST.get("report", None)
        or_condition = Q()
        and_condition = Q()
        combined_condition = Q()

        filtered = []

        if count:
            transactions = Transaction.get_transactions(count=count)
            return JsonResponse(data=transactions, safe=False)

        if not filters:
            return JsonResponse(data={"status": True, "data": filtered})

        filters = json.loads(filters)

        if len(filters) == 0:
            return JsonResponse(data={"status": True, "data": filtered})

        if "date" in filters:
            filters["created_at__startswith"] = datetime.datetime.strptime(
                filters.pop("date"), "%m/%d/%Y"
            ).date()

        if "end" in filters and "start" in filters:
            start_date = datetime.datetime.strptime(
                filters.pop("start"), "%m/%d/%Y"
            ).date()
            end_date = datetime.datetime.strptime(
                filters.pop("end"), "%m/%d/%Y"
            ).date() + datetime.timedelta(days=1)
            filters["created_at__range"] = [start_date, end_date]

        if "agent" in filters:
            filters["account__agent__id"] = filters.pop("agent")

        if "terminal_id" in filters:
            filters["terminal_id"] = filters.pop("terminal_id")

        if "no_third_party_ref" in filters:
            filters["rrn__isnull"] = True
            del filters["no_third_party_ref"]

        if "reference_number" in filters:
            reference_number = filters.pop("reference_number")
            filters["reference_number__icontains"] = reference_number
            or_condition.add(Q(third_party_ref__icontains=reference_number), Q.OR)
            or_condition.add(
                Q(parent__reference_number__icontains=reference_number), Q.OR
            )

        for key, value in filters.items():
            and_condition.add(Q(**{key: value}), Q.AND)

        combined_condition.add(and_condition, Q.OR)
        combined_condition.add(or_condition, Q.OR)

        filtered = Transaction.get_transactions(conditions=combined_condition)
        # filtered = list(queryset)
        data = {"status": True, "data": filtered}

        return JsonResponse(data=data, safe=False)
