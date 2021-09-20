from django.urls import path

from app.views import TransactionsView
from .views import Home, ProductDetail

urlpatterns = [
    path("home", Home.as_view(), name="home"),
    path("", Home.as_view(), name="home"),
    path("product_detail", ProductDetail.as_view(), name="product_detail"),
    path("transactions", TransactionsView.as_view(), name="transactions"),
]
