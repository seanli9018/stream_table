from utils import restful

def st_login_required(func):
    def wrapper(request,*arg, **kwarg):
        if request.user.is_authenticated:
            return func(request, *arg, **kwargs)
        else:
            if request.is_ajax():
                return restful.unauth_error(message='Please log in!')
            else:
                return redirect('/')
        
    return wrapper