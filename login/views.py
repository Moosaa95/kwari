from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt

from .forms import *
from .models import *
from .functions import *
from .decorators import permission_required, login_required


def login(request, url='/app/dashboard'):
    template = "login.html"
    app_name = settings.APP_NAME
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user_login = User.login_user(username, password)
            dic = {}
            if user_login['status']:
                request.session['user_id'] = user_login["pk"]
                request.session["permissions"] = user_login["permissions"]
                dic['url'] = url
            else:
                dic['emessage'] = user_login['message']

            return JsonResponse(dic, safe=False)
        else:
            message = form.errors
            form = LoginForm(request.POST)
            context = {"form": form, "emessage": message, 'app_name': app_name}
            return render(request, template, context)
    else:
        form = LoginForm()
        context = {"form": form, 'app_name': app_name}
        return render(request, template, context)


def logout(request):
    if 'user_id' in request.session:
        del request.session['user_id']
        request.session.flush()
        return redirect('login')
    else:
        template = "login.html"
        message = "The user is not signed in"
        context = {"message": message}
    return render(request, template, context)


@login_required
@permission_required(per='admin', url='/app/dashboard')
def add_user(request, template="add_user.html"):
    # if 'user_id' in request.session:
    if request.method == "POST":
        form = AddUserForm(request.POST)
        if form.is_valid():
            user_id = form.cleaned_data['user_id']
            email = form.cleaned_data['email']
            status = form.cleaned_data['status']
            user_type = form.cleaned_data['user_type']

            permissions = request.POST.getlist('permissions[]', [])
            new_user = User.create_user(
                user_id=user_id,
                email=email,
                status=status,
                user_type=user_type,
                permissions=json.dumps(permissions)
            )

            if new_user['status']:
                form = AddUserForm()
                context = {'form': form, 'message': new_user["message"],
                           'user_id': user_id, "permissions": settings.PERMISSIONS}
                return render(request, template, context)
            else:
                context = {'emessage': new_user['message'], 'form': form,
                           'user_id': user_id, "permissions": settings.PERMISSIONS}
                return render(request, template, context)
        else:
            emessage = form.errors
            context = {'form': form, 'emessage': emessage, "permissions": settings.PERMISSIONS}
            return render(request, template, context)
    else:
        form = AddUserForm()
        context = {"form": form, "permissions": settings.PERMISSIONS}
        return render(request, template, context)
    # else:
    #     return HttpResponseRedirect('/login/')


@login_required
@csrf_exempt
def profile(request, template="profile.html"):
    if request.method == "POST":
        form = AddProfileForm(request.POST)
        if form.is_valid():
            first_name = form.cleaned_data['first_name']
            surname = form.cleaned_data['surname']
            other_name = form.cleaned_data['other_name']
            position = form.cleaned_data['position']
            mobile = form.cleaned_data['mobile_number']
            # email = form.cleaned_data['email']
            address = form.cleaned_data['address']

            get_profile = Profile.get_profile(user_id=request.session["user_id"])

            if get_profile["status"]:
                new_profile = Profile.update_profile(
                   user_id=request.session["user_id"],
                   first_name=first_name,
                   surname=surname,
                   other_name=other_name,
                   position=position,
                   address=address,
                   mobile_number=mobile
                )
            else:
                new_profile = Profile.add_profile(
                    user_id=request.session["user_id"],
                    first_name=first_name,
                    surname=surname,
                    other_name=other_name,
                    position=position,
                    address=address,
                    mobile_number=mobile
                    )

            if new_profile['status']:
                return JsonResponse(data={"message": "Your profile has been update"})
            else:
                return JsonResponse(data={"message": new_profile['message'], "error": True})
        else:
            emessage = form.errors
            return JsonResponse(data={"message": emessage, "error": True})
    else:
        context = {}
        user_profile = Profile.get_profile(user_id=request.session['user_id'])
        if user_profile['status']:
            context["user_data"] = json.dumps(user_profile['profile_data'])
        else:
            context["user_data"] = json.dumps({})

        return render(request, template, context)


@login_required
@csrf_exempt
def change_password(request):
    """
    Take user_id and new passeord from request post variables and update user password to the new one
    :param request: user_id, password
    :return: Json objects
    """
    if request.method == "POST":
        password = request.POST['password']
        confirm_password = request.POST['confirmPassword']
        if password == confirm_password:
            user = request.session["user_id"]  # get user_id from session variable
            update = User.update_password(user, password)
            if update:
                return JsonResponse(data={"message": "password has been changed successfully"})
            else:
                return JsonResponse(data={"message": "password change unsuccessfully", "error": True})
    else:
        return HttpResponseRedirect("dashboard")


def reset_password(request):
    """
    Take user_id from request post variables and send a new
    :param request:
    :return:
    """

    if request.method == "POST":
        user_id = request.POST['user_id']
        user = None  # initialize user to none
        dic = {}
        try:
            user = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            emessage='user does not exist'
            dic['emessage'] = emessage
            return JsonResponse(dic, safe=False)

        pin = get_random_string(length=6, allowed_chars='1234567890')
        message = settings.RESET_MESSAGE % pin
        recipient = [user.email]
        try:
            response = send_mail(settings.SENDER_ID, message, settings.SENDER_EMAIL, recipient)
            if response == 1:
                password = hash_password(pin)
                User.objects.filter(user_id=user_id).update(password=password)
                message = 'Password reset successful. Check your mail'
                dic['message'] = message
                return JsonResponse(dic)
        except smtplib.SMTPAuthenticationError:
            emessage = "Password reset unsuccessful.Error! can't access mail server. check back later"
            dic['emessage'] = emessage
            return JsonResponse(dic, safe=False)