import requests
from django.conf import settings 

def list_styles(): 
    """ Retrieve list of available styles """
    styles_list_url = (
        f'https://api.mapbox.com/styles/v1/{settings.MAPBOX_USERNAME}?access_token={settings.MAPBOX_ACCESS_TOKEN}'
    ) 
    response = requests.get(styles_list_url).json()
    return response
