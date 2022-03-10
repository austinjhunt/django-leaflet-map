from django.db import models
from django.contrib.auth.models import User

class FeatureCollection(models.Model):
    title = models.CharField(max_length=512)
    description = models.TextField() 
    # use TextField() to store JSON; JSON not available for mysql database
    # generate these values with geojson.io
    geojson = models.JSONField()


class UserGroup(models.Model):
    """
    A user group is a group of users with permission to manage a specific set of layers (feature collections)
    A user can have many groups; a group can have many users
    Each group has permissions to manage only one layer.

    When a new layer gets added, a user group needs to be added for that layer. 
    Then users need to be added to that user group so they can manage the layer. 
    """ 
    users = models.ManyToManyField(User)   
    feature_collection = models.ForeignKey(FeatureCollection, on_delete=models.CASCADE)