from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.views.generic import View, ListView
from django.views.decorators.http import require_GET, require_POST
from apps.news.models import NewsCategory, News, Banner
from utils import restful
from .forms import EditNewsCategoryForm, WriteNewsForm, AddBannerForm, EditBannerForm, EditNewsForm
import os
from django.conf import settings
import qiniu
from django.utils.timezone import now as aware_now, make_aware
import pytz
from apps.news.serializers import BannerSerializer
from django.core.paginator import Paginator
from datetime import datetime
from urllib import parse

# Create your views here.

@staff_member_required(login_url='index')
def index(request):
    return render(request, 'cms/index.html')

def news_list(request):
    newses = News.objects.select_related('category', 'author').all()
    categories = NewsCategory.objects.all()
    context = {
        'newses': newses,
        'categories': categories,
    }
    return render(request, 'cms/news_list.html', context=context)


class NewsListView(View):
    def get(self, request):
        newses = News.objects.select_related('category', 'author').all()
        # for other filter conditions
        start = request.GET.get('start')
        end = request.GET.get('end')
        title = request.GET.get('title')
        category_id = int(request.GET.get('category', 0))
        if start or end:
            if start:
                start_date = datetime.strptime(start, '%m/%d/%Y')
            else:
                start_date = datetime(month=5, day=1, year=2020,)
            
            if end:
                end_date = datetime.strptime(end, '%m/%d/%Y')
            else:
                end_date = datetime.today()
            newses = newses.filter(pub_time__range=(make_aware(start_date), make_aware(end_date)))

        if title:
            newses = newses.filter(title__icontains=title)

        if category_id:
             newses = newses.filter(category__id=category_id)
        # create a new paginator obj, give a object lists, and 
        # the number of data rows we want in a page.
        paginator = Paginator(newses, 2)

        # get current page, from front html's param
        current_page_number = int(request.GET.get('p', 1) or 1)

        # once we have paginator obj, 
        # we can have its page_obj based on its current page number.
        page_obj = paginator.page(current_page_number)

        context={
            'categories': NewsCategory.objects.all(),
            'newses': page_obj.object_list,
            'page_obj':page_obj,
            'paginator':paginator,
            'start': start,
            'end': end,
            'title': title,
            'category_id': category_id,
            'url_query': '&'+parse.urlencode({
                'start':start or '',
                'end': end or '',
                'title': title or '',
                'category': category_id or 0
            })
        }
        # run self-define method to get more context we need
        extra_context = self.get_pagination_data(paginator, page_obj)

        # update extra context to the general context
        context.update(extra_context)

        return render(request, 'cms/news_list.html', context=context)

    # self defined method to deal with context we need
    # based on paginator and page_obj
    def get_pagination_data(self, paginator, page_obj, around_count=1):
        current_page = page_obj.number

        left_has_more = False
        right_has_more = False

        if current_page <= around_count + 2:
            left_pages = range(1, current_page)
        else:
            left_pages = range(current_page-around_count, current_page)
            left_has_more = True
        if current_page >= paginator.num_pages-around_count-1:
            right_pages = range(current_page+1, paginator.num_pages+1)
        else:
            right_pages = range(current_page+1, current_page+around_count+1)
            right_has_more = True

        return {
            'left_pages':left_pages,
            'right_pages':right_pages,
            'current_page':current_page,
            'left_has_more':left_has_more,
            'right_has_more':right_has_more,
            'num_pages':paginator.num_pages,
        }


class WriteNewsView(View):
    def get(self, request):
        categories = NewsCategory.objects.all()
        context = {
            'categories': categories
        }
        return render(request, 'cms/write_news.html', context=context)

    def post(self, request):
        form = WriteNewsForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data.get('title')
            desc = form.cleaned_data.get('desc')
            thumbnail = form.cleaned_data.get('thumbnail')
            content = form.cleaned_data.get('content')
            category_id = form.cleaned_data.get('category')

            category = NewsCategory.objects.get(pk=category_id)
            News.objects.create(title=title, desc=desc, thumbnail=thumbnail, 
            content=content, category=category, author=request.user)

            return restful.ok()
        else:
            return restful.params_error(message=form.get_errors())

class EditNewsView(View):
    def get(self, request):
        news_id = request.GET.get('news_id')
        news = News.objects.get(pk=news_id)
        context = {
            'news':news,
            'categories': NewsCategory.objects.all(),
        }
        return render(request, 'cms/write_news.html', context=context)

    def post(self, request):
        form = EditNewsForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data.get('title')
            desc = form.cleaned_data.get('desc')
            thumbnail = form.cleaned_data.get('thumbnail')
            content = form.cleaned_data.get('content')
            category_id = form.cleaned_data.get('category')
            category = NewsCategory.objects.get(pk=category_id)
            pk = form.cleaned_data.get("pk")
            News.objects.filter(pk=pk).update(title=title, desc=desc, thumbnail=thumbnail, 
            content=content, category=category)
            return restful.ok()
        else: 
            return restful.params_error(message=form.get_errors())

@require_POST
def delete_news(request):
    news_id = request.POST.get('news_id')
    News.objects.get(id=news_id).delete()
    return restful.ok()

@require_GET
def news_category(request):
    categories = NewsCategory.objects.all()
    context = {
        'categories': categories
    }
    return render(request, 'cms/news_category.html', context=context)

@require_POST
def add_news_category(request):
    name = request.POST.get('name')
    exists = NewsCategory.objects.filter(name=name).exists()
    if not exists:
        NewsCategory.objects.create(name=name)
        return restful.ok()
    else:
        return restful.params_error(message='The category already exisits!')

@require_POST
def edit_news_category(request):
    form = EditNewsCategoryForm(request.POST)
    if form.is_valid():
        pk = form.cleaned_data.get('pk')
        name = form.cleaned_data.get('name')
        try:
            NewsCategory.objects.filter(pk=pk).update(name=name)
            return restful.ok()
        except:
            return restful.params_error(message='There is no such category')
    else:
        return restful.params_error(message=form.get_errors())

@require_POST
def delete_news_category(request):
    pk = request.POST.get('pk')
    try:
        NewsCategory.objects.get(pk=pk).delete()
        return restful.ok()
    except:
        return restful.params_error(message='There is no such category')

def banners(request):
    return render(request, 'cms/banners.html')

def banner_list(request):
    banners = Banner.objects.all()
    serializer = BannerSerializer(banners, many=True)
    return restful.result(data=serializer.data)

def add_banner(request):
    form = AddBannerForm(request.POST)
    if form.is_valid():
        new_banner = form.save()
        return restful.result(data={"banner_id":new_banner.pk})
    else:
        return restful.params_error(message=form.get_errors())

def delete_banner(request):
    banner_id = request.POST.get('banner_id')
    Banner.objects.filter(pk=banner_id).delete()
    return restful.ok()

def edit_banner(request):
    form = EditBannerForm(request.POST)
    if form.is_valid():
        pk = form.cleaned_data.get('pk')
        image_url = form.cleaned_data.get('image_url')
        link_to = form.cleaned_data.get('link_to')
        priority = form.cleaned_data.get('priority')
        Banner.objects.filter(pk=pk).update(image_url=image_url, 
        link_to=link_to, priority=priority)
        return restful.ok()
    else:
        return restful.params_error(message=form.get_errors())

@require_POST
def upload_file(request):
    file = request.FILES.get('file')
    #get UTC aware time
    datetime = aware_now()
    #create pytz chicago time zone
    tz_chicago = pytz.timezone("America/Chicago")
    #convert UTC aware time to chicago timezone
    chicago_now = datetime.astimezone(tz_chicago)
    #stringfy datetime
    suffix = chicago_now.strftime("%m%d%Y%H%M%S")
    file_name = file.name.split('.')
    name = file_name[0] + suffix + '.' + file_name[1]
    with open(os.path.join(settings.MEDIA_ROOT, name), 'wb') as fp:
        for chunk in file.chunks():
            fp.write(chunk)
    #url = http://127.0.0.1/settings.MEDIA_URL + name
    url = request.build_absolute_uri(settings.MEDIA_URL+name)
    return restful.result(data={'url':url})

@require_GET
def qntoken(request):
    access_key = 'fmzkVnHynJ8DIoNA19WArj7qfQHUx9_MXUtK4TN2'
    secret_key = 'YJfkkoWk1HUpDIlGnoqUQ4WZ8PGwB-3sKbgchiDm'

    bucket = 'django-media-demo'
    q = qiniu.Auth(access_key, secret_key)
    token = q.upload_token(bucket)

    return restful.result(data={"token": token})
