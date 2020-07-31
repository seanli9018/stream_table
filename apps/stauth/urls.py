from django.urls import path
from . import views

app_name='stauth'

urlpatterns = [
    path('login/', views.login_view, name="login"),
    path('logout/', views.logout_view, name="logout"),
    path('img_captcha/', views.img_captcha, name="img_captcha"),
    path('email_captcha/', views.email_captcha, name="email_captcha"),
    path('register/', views.register, name="register"),
]