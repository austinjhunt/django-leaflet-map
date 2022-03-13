from django.conf import settings  
def context_processor(request):

    return {
        'app_title': settings.APP_NAME,
        'mapbox_access_token': settings.MAPBOX_ACCESS_TOKEN, 
        'styles': settings.MAPBOX_STYLES_LIST,
        'mapbox_username': settings.MAPBOX_USERNAME # must be used as <>/ prefix on style id
    }