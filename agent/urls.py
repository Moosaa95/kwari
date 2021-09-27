from django.urls import path

from app.views import TransactionsView
from .views import Home, ProductDetail, AgentLogin, AgentRegistration

urlpatterns = [
    path("", AgentLogin.as_view(), name="agent_login"),
    path("login", AgentLogin.as_view(), name="agent_login"),
    path("register", AgentRegistration.as_view(), name="register"),
    path("home", Home.as_view(), name="home"),
    path("product_detail", ProductDetail.as_view(), name="product_detail"),
    path("transactions", TransactionsView.as_view(), name="transactions"),
]
