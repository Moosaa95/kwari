from django.http import HttpResponseRedirect


class LoginRequiredMixin:
    def dispatch(self, request, *args, **kwargs):
        if "user_id" in request.session:
            return super().dispatch(request, *args, **kwargs)
        else:
            return HttpResponseRedirect('login')


class PermissionRequiredMixin:
    def dispatch(self, request, *args, **kwargs):
        if self.permission in request.session["permissions"] or 'admin' in request.session["permissions"]:
            return super().dispatch(request, *args, **kwargs)
        else:
            return HttpResponseRedirect('dashboard')


# class ActiveAgentRequiredMixin:
#     def dispatch(self, request, *args, **kwargs):
#         if "account_id" in request.session:
#             account = Account.get_account(account_id=request.session['account_id'])
#             if account.status:
#                 return super().dispatch(request, *args, **kwargs)
#             else:
#                 return JsonResponse(data={'status': False, "message": 'You are not allowed to perform this transaction'})
#         else:
#             return HttpResponseRedirect('login')
