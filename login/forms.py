from django import forms
from .models import *


class LoginForm(forms.Form):
    username = forms.CharField(max_length=50)
    password = forms.CharField(
        widget=forms.PasswordInput,
        min_length=4,
        max_length=12)

    username.widget.attrs.update({
        'class': "form-control",
        'placeholder': "Username",
        'data-msg': "Please enter a valid user id"
    })
    password.widget.attrs.update({
        'class': "form-control",
        'placeholder': "Password",
        'data-rule': "minlen:8",
        'data-msg': "Please enter at least 8 characters"})


class AddUserForm(forms.Form):
    user_id = forms.CharField(max_length=255)
    email = forms.EmailField(max_length=255)
    status = forms.BooleanField(initial=False)
    user_type = forms.ChoiceField(choices=settings.USER_TYPES, initial="staff")

    user_id.widget.attrs.update({'class': "form-control"})
    email.widget.attrs.update({'class': "form-control"})
    status.widget.attrs.update({'class': "form-control"})
    user_type.widget.attrs.update({'class': "form-control"})
    # permissions.widget.attrs.update({'class': "form-control",


class AddProfileForm(forms.Form):
    first_name = forms.CharField(max_length=255)
    surname = forms.CharField(max_length=255)
    other_name = forms.CharField(max_length=255)
    position = forms.CharField(max_length=255)
    mobile_number = forms.CharField(max_length=255)
    email = forms.EmailField(max_length=255)
    address = forms.CharField(max_length=255)


class ResetPasswordForm(forms.Form):
    username = forms.CharField(max_length=20)
    username.widget.attrs.update({
        'placeholder': "Username",
    })
