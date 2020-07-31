from django.shortcuts import render

# Create your views here.
def premium(request):
    return render(request, 'premium/premium_index.html')