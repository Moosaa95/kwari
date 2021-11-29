from django.urls import path
from .views import *
from .endpoints import *
from login.views import login

urlpatterns = [
    path("login", login, name="login"),
    path("dashboard", Dashboard.as_view(), name="dashboard"),
    path("agents", AgentView.as_view(), name="agents"),
    path("products", ProductsManagementView.as_view(), name="products"),
    path("accounts", AccountsManagementView.as_view(), name="accounts"),
    path("transactions", TransactionsView.as_view(), name="transactions"),
    path("reports", ReportsView.as_view(), name="reports"),
    # #################### Endpoints ######################################
    path("fetch_agents", GetAgentsList.as_view(), name="fetch_agents"),
    path("create_agent", CreateAgent.as_view(), name="create_agent"),
    path("create_product", CreateProduct.as_view(), name="create_agent"),
    path("get_products", GetProducts.as_view(), name="get_products"),
    path("add_product_image", AddProductImage.as_view(), name="add_product_image"),
    path("get_home_images", GetHomeProductsImages.as_view(), name="get_home_images"),
    path(
        "get_payment_accounts",
        GetPaymentAccounts.as_view(),
        name="get_payment_accounts",
    ),
    path(
        "create_payment_account",
        CreatePaymentAccount.as_view(),
        name="create_payment_account",
    ),
    path(
        "update_payment_account",
        UpdatePaymentAccount.as_view(),
        name="update_payment_account",
    ),
    path(
        "delete_payment_account",
        DeletePaymentAccount.as_view(),
        name="delete_payment_account",
    ),
]
