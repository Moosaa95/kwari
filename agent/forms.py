from django import forms


class AgentLoginForm(forms.Form):
    username = forms.CharField(max_length=20)
    password = forms.CharField(widget=forms.PasswordInput)
    username.widget.attrs.update(
        {
            "placeholder": "Username",
            "inputmode": "numeric",
            "pattern": "[0-9]*",
            "class": "form-control form-control-lg",
        }
    )
    password.widget.attrs.update(
        {
            "placeholder": "Password",
            "class": "form-control form-control-lg",
        }
    )


class ChangePasswordForm(forms.Form):
    password = forms.CharField(widget=forms.PasswordInput)
    confirm_password = forms.CharField(widget=forms.PasswordInput)

    password.widget.attrs.update(
        {
            "placeholder": "Password",
        }
    )

    confirm_password.widget.attrs.update(
        {
            "placeholder": "Confirm Password",
        }
    )
