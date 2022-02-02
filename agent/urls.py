from django.urls import path

from app.views import TransactionsView
from app.endpoints import InitiateTransaction
from .views import Home, ProductDetail, AgentLogin, ChangePassword, AgentLogout

urlpatterns = [
    path("", Home.as_view(), name="home"),
    # path("login", AgentLogin.as_view(), name="agent_login"),
    # path("logout", AgentLogin.as_view(), name="agent_logout"),
    # path("change_password", ChangePassword.as_view(), name="change_password"),
    path("home", Home.as_view(), name="home"),
    path("product_detail", ProductDetail.as_view(), name="product_detail"),
    path("transactions", TransactionsView.as_view(), name="transactions"),
    path(
        "create_transaction", InitiateTransaction.as_view(), name="create_transaction"
    ),
]
