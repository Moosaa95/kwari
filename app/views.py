from datetime import datetime

from django.conf import settings
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import FormView
from django.views.generic.base import View

from .functions import money_format
from .models import Agent, Account, Transaction, Category, Product
from login.models import User


from .mixins import LoginRequiredMixin, PermissionRequiredMixin
from .models import Activity, ActivityLogs


class Dashboard(LoginRequiredMixin, PermissionRequiredMixin, View):
    template = "dashboard.html"
    permission = "staff"

    def get(self, request, *args, **kwargs):
        context = {}
        return render(request, self.template, context)

    def post(self, request, *args, **kwargs):
        context = {}
        return render(request, self.template, context)


class AgentView(LoginRequiredMixin, PermissionRequiredMixin, View):
    template = "agents.html"
    permission = "staff"
    context = {}

    def get(self, request, *args, **kwargs):
        agents_summary = Agent.get_agents_summary()
        self.context['number_agents'] = agents_summary['number_agents']
        if not agents_summary['buying_agents']['count']:
            agents_summary['buying_agents']['count'] = 0
        self.context['buying_agents'] = agents_summary['buying_agents']['count']
        return render(request, self.template, self.context)


class ProductsManagementView(LoginRequiredMixin, PermissionRequiredMixin, View):
    template = "product_management.html"
    permission = "staff"
    context = {}

    def get(self, request, *args, **kwargs):
        total_products = len(Product.objects.all());
        tpis = len(Product.objects.filter(in_stock=True));
        tpos = len(Product.objects.filter(in_stock=False));
        categories = Category.objects.all()
        self.context['categories'] = categories
        self.context['total_products'] = total_products
        self.context['tpis'] = tpis
        self.context['tpos'] = tpos
        return render(request, self.template, self.context)


class TransactionsView(LoginRequiredMixin, PermissionRequiredMixin, View):
    template = "transactions.html"
    permission = 'staff'
    context = {}

    def get(self, request, *args, **kwargs):
        return render(request, self.template, self.context)


class ReportsView(LoginRequiredMixin, PermissionRequiredMixin, View):
    template = "reports.html"
    permission = 'staff'
    context = {}

    def get(self, request, *args, **kwargs):
        self.context['merchant_id'] = settings.MERCHANT_ID
        return render(request, self.template, self.context)
