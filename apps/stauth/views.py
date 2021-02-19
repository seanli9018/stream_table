from django.contrib.auth import login, logout, authenticate, get_user_model
from django.views.decorators.http import require_POST
from django.shortcuts import redirect, reverse
from .forms import LoginForm, RegisterForm

#from django.http import JsonResponse
from utils import restful
from utils.captcha.stcaptcha import Captcha
from io import BytesIO
from django.http import HttpResponse
from django.core.mail import send_mail
from django.core.cache import cache


#get User model defined by ourselves
User = get_user_model()
# use ajax to pass the data, so we need Json data
#{"code":200, "message":"", "data":{"username":"Sean", "email":"seanli@gmail.com"}}
# the json data is created in utils that we defined.

@require_POST
def login_view(request):
    form = LoginForm(request.POST)
    if form.is_valid():
        email = form.cleaned_data.get('email')
        password = form.cleaned_data.get('password')
        remember = form.cleaned_data.get('remember')
        user = authenticate(request, username=email, password=password)

        if user:
            if user.is_active:
                login(request, user)
                if remember:
                    request.session.set_expiry(None)
                else:
                    request.session.set_expiry(0)
                return restful.ok()
            else:
                return restful.unauth_error(message="Your account is blocked!")
        else:
            return restful.params_error(message="Your enterned a wrong username or password!")
    else:
        errors = form.get_errors()
        return restful.params_error(message=errors)

@require_POST
def register(request):
    form = RegisterForm(request.POST)
    if form.is_valid():
        email = form.cleaned_data.get('email')
        password = form.cleaned_data.get('password1')
        username = form.cleaned_data.get('username')
        #after pass form validating and registering, create user.
        user = User.objects.create_user(email=email, password=password, username=username)
        # then immediately login user
        login(request, user)
        return restful.ok()
    else:
        return restful.params_error(message=form.get_errors())

def logout_view(request):
    logout(request)
    return redirect(reverse('index'))

def img_captcha(request):
    text, image = Captcha.gene_code()
    # BytesIO is like a tube to save image stream data
    out = BytesIO()
    # image.save to save the image to BytesIO
    image.save(out, 'png')
    # to move to the begining part.
    out.seek(0)

    response = HttpResponse(content_type='image/png')
    # write ByteIO tube image data to response object
    response.write(out.read())
    response['Content-length'] = out.tell()
    
    #cache the text for backend verification
    cache.set(text.lower(), text.lower(), 5*60)
    return response

def email_captcha(request):
    email = request.GET.get('email')
    code = Captcha.gene_text()

    #send email
    send_mail('Streaming Table Verification Code', 'Your verification code is '+code, 'seanli9018@gmail.com', [email], fail_silently=False)

    #cache the email verification code for verification
    cache.set(email, code, 5*60)

    #have to return a js response instead of a HttpResponse
    return restful.ok()

# def cache_test(request):
#     cache.set('username', 'sean', 60)
#     result = cache.get('username')
#     print(result)
#     return HttpResponse("success")


