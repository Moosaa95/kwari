from django.urls import path
from .views import *
from .endpoints import *
from login.views import login

urlpatterns = [
    path('login',  login, name="login"),
    path('dashboard',  Dashboard.as_view(), name="dashboard"),
    path('agents',  AgentView.as_view(), name="agents"),
    # path('accounts',  AccountView.as_view(), name="accounts"),
    # path('account_detail',  AccountDetailView.as_view(), name="account_detail"),
    path('products',  ProductsManagementView.as_view(), name="products"),
    # path('commission_structure_management',  CommissionStructureManagementView.as_view(), name="commission_structure_management"),
    path('transactions',  TransactionsView.as_view(), name="transactions"),
    path('reports',  ReportsView.as_view(), name="reports"),

    #################################################################
    path('fetch_agents', GetAgentsList.as_view(), name="fetch_agents"),
    path('create_agent', CreateAgent.as_view(), name="create_agent"),

]
