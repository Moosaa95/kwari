# Standard Lib
import datetime
import calendar
import smtplib

# Third-party lib
import requests

# Django
# from django.db.models import Q
from django.shortcuts import render, redirect
from django.http import HttpResponseRedirect, JsonResponse
from django.db import IntegrityError
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.utils.crypto import get_random_string
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import FormView
from django.views.generic.base import View
from django_select2.forms import *

# Local
from agent.models import *
from .forms import *
from .mixins import LoginRequiredMixin

# from agent.forms import *
# from agent.functions import *
from app.models import CategoryImage, Tag, Product


class AgentRegistration(FormView):
    form_class = AgentRegisterForm
    template_name = "agent_registration.html"
    success_url = "register"

    def form_valid(self, form):
        pin = get_random_string(length=6, allowed_chars="1234567890")
        account_number = form.cleaned_data["mobile_number"][1:]
        message = (
            f"Welcome to {settings.APP_NAME}.\n kindly use the username and pin below to "
            f"login and change your password.\n"
            f"USERNAME:{account_number}\nPIN:{pin}"
        )
        new_agent = Agent.create_agent(
            first_name=form.cleaned_data["first_name"],
            surname=form.cleaned_data["surname"],
            last_name=form.cleaned_data["last_name"],
            business_name=form.cleaned_data["business_name"],
            mobile_number=form.cleaned_data["mobile_number"],
            email=form.cleaned_data["email_address"],
            address=form.cleaned_data["address"],
            state=form.cleaned_data["state"],
            pin=pin,
        )
        send_email(form.cleaned_data["email_address"], message)
        if new_agent and type(new_agent) is not dict:
            return JsonResponse(data={"status": True})
        else:
            return JsonResponse(data={"status": False, "message": new_agent["message"]})

    def form_invalid(self, form):
        errors = form.errors
        return JsonResponse(data={"status": False, "message": errors})


class AgentLogin(FormView):
    form_class = AgentLoginForm
    template_name = "agent_login.html"
    success_url = "login"

    def form_valid(self, form):
        username = form.cleaned_data["username"]
        password = form.cleaned_data["password"]
        device_id = form.cleaned_data["device_id"]
        login = AccountLogin.login(
            self.request, username=username, password=password, device_id=device_id
        )
        return JsonResponse(data=login)

    def form_invalid(self, form):
        message = form.errors
        return JsonResponse(data={"status": False, "message": message})


class AgentLogout(LoginRequiredMixin, View):
    def get(self, request):

        if "account_id" in self.request.session:
            del request.session["account_id"]
            request.session.flush()
            return HttpResponseRedirect("/agent/login")
        else:
            template = "agent_login.html"
            message = "The user is not signed in"
            context = {"message": message}
        return render(request, template, context)


class ChangePassword(FormView):
    form_class = ChangePasswordForm
    template_name = "agent_change_password.html"
    success_url = "change_password"

    def form_valid(self, form):
        confirm_password = form.cleaned_data["confirm_password"]
        password = form.cleaned_data["password"]
        transaction_pin = form.cleaned_data["transaction_pin"]
        confirm_transaction_pin = form.cleaned_data["confirm_transaction_pin"]
        device_id = form.cleaned_data["device_id"]
        if confirm_password == password:
            if transaction_pin == confirm_transaction_pin:
                update = AccountLogin.change_password(
                    username=self.request.session["username"],
                    password=password,
                    transaction_pin=transaction_pin,
                    device_id=device_id,
                )
                return JsonResponse(data=update)
            else:
                message = "Transaction pins do not match"
                return JsonResponse(data={"status": False, "message": message})
        else:
            message = "Passwords do not match"
            return JsonResponse(data={"status": False, "message": message})

    def form_invalid(self, form):
        message = form.errors
        return JsonResponse(data={"status": False, "message": message})


class Home(View):
    template = "home.html"
    context = {}

    def get(self, request, *args, **kwargs):
        categories = CategoryImage.get_categories_and_image()
        tags = Tag.get_tags(all=True)
        init_data = dict(categories=categories, tags=tags)
        self.context.update(init_data=init_data)
        return render(request, self.template, self.context)


class ProductDetail(View):
    template = "product_detail.html"
    context = {}

    def get(self, request, *args, **kwargs):
        product_id = request.GET.get("product_id")
        product = Product.get_product(id=product_id)
        print("##################")
        print(product)
        self.context.update(product_data=product)
        return render(request, self.template, self.context)
