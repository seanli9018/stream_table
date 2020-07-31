from django.db import models

class CourseCategory(models.Model):
    name = models.CharField(max_length=50)

class Teacher(models.Model):
    username = models.CharField(max_length=100)
    avatar = models.URLField()
    jobtitle = models.CharField(max_length=100)
    profile = models.TextField()

class Course(models.Model):
    title = models.CharField(max_length=100)
    category = models.ForeignKey('CourseCategory', on_delete=models.DO_NOTHING)
    teacher = models.ForeignKey('Teacher', on_delete=models.DO_NOTHING)
    video_url = models.URLField()
    cover_url = models.URLField()
    price = models.FloatField()
    duration = models.IntegerField()
    profile = models.TextField()
    pub_time = models.DateTimeField(auto_now_add=True)

class CourseOrder(models.Model):
    course = models.ForeignKey("Course", on_delete=models.DO_NOTHING)
    buyer = models.ForeignKey("stauth.User", on_delete=models.DO_NOTHING)
    amount = models.FloatField(default=0)
    pub_time = models.DateTimeField(auto_now_add=True)
    # 1：支付宝，2.微信支付
    istype = models.SmallIntegerField(default=0)
    # 1 means not paid yet, 2.sucessfully paid
    status = models.SmallIntegerField(default=1)