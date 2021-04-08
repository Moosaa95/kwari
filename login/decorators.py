import json

from django.http import HttpResponseRedirect
from functools import wraps

from login.models import User


def login_required(f):
    @wraps(f)
    def wrap(request, *args, **kwargs):
        # check the session if user_id key exist, if not it will redirect to login page
        if 'user_id' not in request.session.keys():
            return HttpResponseRedirect("login")
        return f(request, *args, **kwargs)
    return wrap


def permission_required(per='admin', url=''):
    def permission_required_deco(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            # this check the session if permission key exist, if not it will redirect to login page
            if 'user_id' not in request.session.keys():
                return HttpResponseRedirect("login")
            else:
                user = User.objects.get(id=request.session['user_id'])
                permissions = json.loads(user.permissions)
                if per not in permissions:
                    return HttpResponseRedirect(url)
            return func(request, *args, **kwargs)
        return wrapper
    return permission_required_deco
