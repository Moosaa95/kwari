from django.contrib.sessions.models import Session
from django.http import HttpResponseRedirect
from app.models import AccountLogin


class LoginRequiredMixin:
    def dispatch(self, request, *args, **kwargs):
        if "account_id" in request.session:
            credentials = AccountLogin.get_credentials(
                account_id=request.session["account_id"]
            )
            if (
                credentials.session_id
                and credentials.session_id == request.session.session_key
            ):
                pass
            elif not credentials.session_id:
                AccountLogin.update_credentials(session_id=request.session.session_key)
            else:
                Session.objects.filter(session_key=credentials.session_id).delete()
                AccountLogin.update_credentials(session_id=request.session.session_key)
            return super().dispatch(request, *args, **kwargs)
        else:
            return HttpResponseRedirect("login")
