from django.contrib import admin
from app.models import Product, Account, AccountLogin, Agent, Activity, ActivityLogs, Transaction

admin.site.register(Product)
admin.site.register(Account)
admin.site.register(AccountLogin)
admin.site.register(Agent)
admin.site.register(Activity)
admin.site.register(ActivityLogs)
admin.site.register(Transaction)
