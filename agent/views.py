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
from app.models import CategoryImage, Tag, Product, AccountLogin, Agent


class AgentLogin(FormView):
    form_class = AgentLoginForm
    template_name = "agent_login.html"
    success_url = "login"

    def form_valid(self, form):
        username = form.cleaned_data["username"]
        password = form.cleaned_data["password"]
        login = AccountLogin.login(self.request, username=username, password=password)
        print(login)
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
        if confirm_password == password:
            update = AccountLogin.change_password(
                username=self.request.session["username"],
                password=password,
            )
            return JsonResponse(data=update)
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
