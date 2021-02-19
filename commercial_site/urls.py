"""commercial_site URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.urls import path, include
from apps.news import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    #index page: and also the news index page
    path('', views.index, name='index'),
    #other news pages
    path('news/', include("apps.news.urls")),
    #search page
    path('search/', views.news_search, name='news_search'),
    #cms pages
    path('cms/', include("apps.cms.urls")),
    #authentication page
    path('account/', include("apps.stauth.urls")),
    #course page
    path('course/', include("apps.course.urls")),
    #premium page
    path('premium/', include("apps.premium.urls")),
    #ueditor page
    path('ueditor/', include("apps.ueditor.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    import debug_toolbar
    urlpatterns.append(path("__debug__/", include(debug_toolbar.urls)))