# 自定义User模型，cms与front用的是同一个user模型
# 步骤1: 创建一个stauth的app，用来管理用户系统
# 步骤2：继承AbstractBaseUser，重写django内置的User
# 步骤3：定义UserManger 也就是User.objects对象
# 步骤4：在settings中设置AUTH_USER_MODEL
# 步骤5：映射到数据库中

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from shortuuidfield import ShortUUIDField
from django.db import models

class UserManager(BaseUserManager):
    def _create_user(self, email, username, password, **kwargs):
        if not email:
            raise ValueError('Please enter a valid email')
        if not username:
            raise ValueError('Please enter a username')
        if not password:
            raise ValueError('Please enter a valid password')

        user = self.model(email=email, username=username, **kwargs)
        user.set_password(password)
        user.save()
        return user

    def create_user(self, email, username, password, **kwargs):
        kwargs['is_superuser'] = False
        return self._create_user(email=email, username=username, password=password, **kwargs)

    def create_superuser(self, email, username, password, **kwargs):
        kwargs['is_superuser'] = True
        kwargs['is_staff'] = True
        return self._create_user(email=email, username=username, password=password, **kwargs)

class User(AbstractBaseUser, PermissionsMixin):
    # We don't use builtin Increamtal ID.
    # We use shortuuid from django-shortuuidfield plugin.
    uid = ShortUUIDField(primary_key=True)
    email = models.EmailField(max_length=100, unique=True)
    password = models.CharField(max_length=200)
    telephone = models.CharField(max_length=11)
    username = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    #USERNAME_FIELD is for authentication
    USERNAME_FIELD = 'email'
    #email, username, password, are required for a user.
    REQUIRED_FIELDS = ['username']
    EMAIL_FIELD = 'email'

    objects = UserManager()

    def get_full_name(self):
        return self.username

    def get_short_name(self):
        return self.username