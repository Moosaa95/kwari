from django.urls import path
from .views import *
from .endpoints import *
from login.views import login

urlpatterns = [
    path("login", login, name="login"),
    path("dashboard", Dashboard.as_view(), name="dashboard"),
    path("agents", AgentView.as_view(), name="agents"),
    path("products", ProductsManagementView.as_view(), name="products"),
    path("transactions", TransactionsView.as_view(), name="transactions"),
    path("reports", ReportsView.as_view(), name="reports"),
    # #################### Endpoints ######################################
    path("fetch_agents", GetAgentsList.as_view(), name="fetch_agents"),
    path("create_agent", CreateAgent.as_view(), name="create_agent"),
    path("create_product", CreateProduct.as_view(), name="create_agent"),
    path("get_products", GetProducts.as_view(), name="get_products"),
    path("add_product_image", AddProductImage.as_view(), name="add_product_image"),
    path("get_home_images", GetHomeProductsImages.as_view(), name="get_home_images"),
]
