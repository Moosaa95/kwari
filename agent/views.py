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

# from agent.forms import *
# from agent.functions import *
from app.models import CategoryImage, Tag, Product


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
