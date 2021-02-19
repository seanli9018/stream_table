from django import template
from datetime import datetime
from django.utils.timezone import now as now_aware, localtime

#create a library object tp register a custom filter
register = template.Library()

#filter can only have maxium 2 params
#first param will always be value itself.
@register.filter
def time_since(value):
    if not isinstance(value, datetime):
        return value
    now = now_aware()

    #timedelay.total_seconds
    timestamp = (now - value).total_seconds()
    if timestamp < 60:
        return 'just now'
    elif timestamp >= 60 and timestamp < 60*60:
        minutes = int(timestamp/60)
        return "%s minutes ago"%minutes
    elif timestamp >= 60*60 and timestamp < 24*60*60:
        hours = int(timestamp/60/60)
        return "%s hours ago"%hours
    elif timestamp >= 24*60*60 and timestamp < 30*24*60*60:
        days = int(timestamp/60/60/24)
        return "%s days ago"%days
    else:
        return value.strftime("%m/%d/%Y %H:%M")
#instead of using decorator we can use the code below to register also
#register.filter("greet", greet)

@register.filter
def time_format(value):
    if not isinstance(value, datetime):
        return value
    
    return localtime(value).strftime("%m/%d/%Y %H:%M:%S")