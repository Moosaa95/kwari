from django.urls import path

from app.views import TransactionsView
from .views import Home, ProductDetail, AgentLogin, ChangePassword

urlpatterns = [
    path("", AgentLogin.as_view(), name="agent_login"),
    path("login", AgentLogin.as_view(), name="agent_login"),
    path("change_password", ChangePassword.as_view(), name="change_password"),
    path("home", Home.as_view(), name="home"),
    path("product_detail", ProductDetail.as_view(), name="product_detail"),
    path("transactions", TransactionsView.as_view(), name="transactions"),
]
