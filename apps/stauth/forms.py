from django import forms
from apps.forms import FormMixin
from django.core.cache import cache
from .models import User

class LoginForm(forms.Form, FormMixin):
    email = forms.EmailField(max_length=100, error_messages={
        "required": "Email is required",
        "invalid": "Please enter a valid email address",
        "max_length": "Your email should not be more then 100 characters."
    })
    password = forms.CharField(max_length=20,min_length=6,error_messages={
        "max_length": "Password should be less than 20 characters",
        "min_length": "Password should be more than 6 characters",
        "required": "Password is required"})
    remember = forms.IntegerField(required=False)

class RegisterForm(forms.Form, FormMixin):
    email = forms.EmailField(max_length=100)
    username = forms.CharField(max_length=20)
    password1 = forms.CharField(max_length=20, min_length=6, error_messages={
        "max_length": "Password should be less than 20 characters",
        "min_length": "Password should be more than 6 characters",
        "required": "Password is required"
    })
    password2 = forms.CharField(max_length=20, min_length=6, error_messages={
        "max_length": "Password should be less than 20 characters",
        "min_length": "Password should be more than 6 characters",
        "required": "Confirmed password is required"
    })
    img_captcha = forms.CharField(min_length=4, max_length=4)
    email_captcha = forms.CharField(min_length=4, max_length=4)

    def clean(self):
        cleaned_data = super(RegisterForm, self).clean()

        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')

        if password1 != password2:
            raise forms.ValidationError("The passwords are not match!")

        img_captcha = cleaned_data.get('img_captcha')
        cached_img_captcha = cache.get(img_captcha.lower())

        if not cached_img_captcha or img_captcha.lower() != cached_img_captcha.lower():
            raise forms.ValidationError("Invalid image code!")

        email = cleaned_data.get('email')
        email_captcha = cleaned_data.get('email_captcha')
        cached_email_captcha = cache.get(email)

        if not cached_email_captcha or email_captcha.lower() != cached_email_captcha.lower():
            raise forms.ValidationError("Invalid email verification code!")

        exists = User.objects.filter(email=email).exists()
        if exists:
            raise forms.ValidationError("The email already exists!")