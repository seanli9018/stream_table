from django.shortcuts import render
from .models import News, NewsCategory, Banner
from django.conf import settings
from utils import restful
from .serializers import NewsSerializer, CommentSerializer
from django.http import Http404
from .forms import PublicCommentForm
from .models import Comment
from django.shortcuts import get_object_or_404
from apps.stauth.decorators import st_login_required

# Create your views here.
def index(request):
    count = settings.ONE_PAGE_NEWS_COUNT
    #newses = News.objects.all()[0:count]
    newses = News.objects.select_related('category', 'author').all()[0:count]
    categories = NewsCategory.objects.all()
    banners = Banner.objects.all()
    
    context = {
        'newses': newses,
        'categories': categories,
        'banners': banners,
    }
    return render(request, 'news/index.html', context=context)

def news_list(request):
    # this view is for dynamically send data to front without context=context method.
    # so newses = News.objects.order_by('-pub_time') will not be working without context rendering
    # since it returns a queryset not json data 
    
    # using p params to obtian current page
    # /news_list/?p=2
    #default p=1
    page = int(request.GET.get('p', 1))

    #default category is 0, means no category. but order by -time
    category_id = int(request.GET.get('category_id', 0))
    #0, 1
    #2, 3
    #4, 5
    start = (page-1)*settings.ONE_PAGE_NEWS_COUNT
    end = start + settings.ONE_PAGE_NEWS_COUNT

    #Queryset.values() will return a dict not a queryset to JS
    #{'id':1, 'title':'article title', 'category': 2, 'author': 3}
    # its not our needs, because it only gets category and author id number
    #newses = News.objects.order_by('-pub_time')[start:end].values()
    if category_id == 0:
        # so we choose to use django restful framework to serialize the data.
        newses = News.objects.select_related('category', 'author').all()[start:end]
    else:
        newses = News.objects.select_related('category', 'author').filter(category_id=category_id)[start:end]

    serializer = NewsSerializer(newses, many=True)
    #{'id':1, 'title':'article title', 'category': {'id': 2, 'name':'Trending'}}, 
    # 'author': {'id': 3, 'username':'seanli9018','email':'seanli9018@gmail.com'}}}
    data = serializer.data
    return restful.result(data=data)

def news_detail(request, news_id):
    try:
        news = News.objects.select_related('category', 'author').prefetch_related('comments__author').get(pk=news_id)
        context = {
            'news': news,
        }
        return render(request, 'news/news_detail.html', context=context)
    except News.DoesNotExist:
        raise Http404

def news_search(request):
    return render(request, 'search/search.html')

@st_login_required
def public_comment(request):
    form = PublicCommentForm(request.POST)
    
    if form.is_valid():
        news_id = form.cleaned_data.get('news_id')
        content = form.cleaned_data.get('content')
        try:
            news = News.objects.get(pk=news_id)
            comment = Comment.objects.create(content=content, 
            news=news, author=request.user)

            serializer = CommentSerializer(comment)
            data = serializer.data
            return restful.result(data=data)
        except:
            return restful.params_error(message="This news no longer exsits")
    else:
        return restful.params_error(message=form.get_errors())
