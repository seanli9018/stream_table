from rest_framework import serializers
from .models import News, NewsCategory, Comment, Banner
from apps.stauth.senrializers import UserSerializer

class NewsCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsCategory
        fields = ('id', 'name')


class NewsSerializer(serializers.ModelSerializer):
    category = NewsCategorySerializer()
    author = UserSerializer()
    class Meta:
        model = News
        fields = ['id', 'title', 'desc', 'thumbnail', 'pub_time','category', 'author']

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer()
    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'pub_time']

class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ['id', 'priority', 'link_to', 'image_url']
