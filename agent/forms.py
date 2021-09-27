from django import forms


class AgentRegisterForm(forms.Form):
    STATES = (
        ("Adamawa", "Adamawa"),
        ("AkwaIbom", "AkwaIbom"),
        ("Abia", "Abia"),
        ("Anambra", "Anambra"),
        ("Bauchi", "Bauchi"),
        ("Bayelsa", "Bauchi"),
        ("Benue", "Benue"),
        ("Borno", "Borno"),
        ("CrossRiver", "CrossRiver"),
        ("Delta", "Delta"),
        ("Edo", "Edo"),
        ("Ekiti", "Ekiti"),
        ("Enugu", "Enugu"),
        ("Ebonyi", "Ebonyi"),
        ("FCT", "FCT"),
        ("Gombe", "Gombe"),
        ("Imo", "Imo"),
        ("Jigawa", "Jigawa"),
        ("Kano", "Kano"),
        ("Kaduna", "Kaduna"),
        ("Katsina", "Katsina"),
        ("Kebbi", "Kebbi"),
        ("Kogi", "Kogi"),
        ("Kwara", "Kwara"),
        ("Lagos", "Lagos"),
        ("Nasarawa", "Nasarawa"),
        ("Niger", "Niger"),
        ("Ogun", "Ogun"),
        ("Ondo", "Ondo"),
        ("Osun", "Osun"),
        ("Oyo", "Oyo"),
        ("Plateau", "Plateau"),
        ("Rivers", "Rivers"),
        ("Sokoto", "Sokoto"),
        ("Taraba", "Taraba"),
        ("Yobe", "Yobe"),
        ("Zamfara", "Zamfara"),
    )

    first_name = forms.CharField(max_length=20)
    surname = forms.CharField(max_length=20)
    last_name = forms.CharField(max_length=20, required=False)
    business_name = forms.CharField(max_length=255)
    mobile_number = forms.CharField(max_length=11)
    email_address = forms.EmailField(max_length=255)
    address = forms.CharField(max_length=255)
    state = forms.ChoiceField(widget=forms.Select, choices=STATES)

    first_name.widget.attrs.update(
        {
            "placeholder": "First Name",
        }
    )
    surname.widget.attrs.update({"placeholder": "Surname"})
    last_name.widget.attrs.update(
        {
            "placeholder": "Other Name",
        }
    )
    business_name.widget.attrs.update(
        {
            "placeholder": "Business Name",
        }
    )
    mobile_number.widget.attrs.update(
        {"placeholder": "Mobile Number", "maxlength": 11, "pattern": "[0-9]+"}
    )
    email_address.widget.attrs.update({"placeholder": "Email Address"})
    address.widget.attrs.update({"placeholder": "Address"})


class AgentLoginForm(forms.Form):
    username = forms.CharField(max_length=20)
    password = forms.CharField(widget=forms.PasswordInput)
    username.widget.attrs.update(
        {"placeholder": "Username", "inputmode": "numeric", "pattern": "[0-9]*"}
    )
    password.widget.attrs.update(
        {
            "placeholder": "Password",
        }
    )


class ChangePasswordForm(forms.Form):
    password = forms.CharField(widget=forms.PasswordInput)
    confirm_password = forms.CharField(widget=forms.PasswordInput)
    transaction_pin = forms.CharField(widget=forms.PasswordInput)
    confirm_transaction_pin = forms.CharField(widget=forms.PasswordInput)
    device_id = forms.CharField(widget=forms.HiddenInput)

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

    transaction_pin.widget.attrs.update(
        {
            "placeholder": "Pin",
        }
    )

    confirm_transaction_pin.widget.attrs.update(
        {
            "placeholder": "Confirm Pin",
        }
    )
