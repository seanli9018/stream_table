from apps.forms import FormMixin
from django import forms
from .models import Course

class PubCourseForm(forms.ModelForm, FormMixin):
    category_id = forms.IntegerField()
    teacher_id = forms.IntegerField()
    class Meta:
        model = Course
        exclude = ['category', 'teacher']