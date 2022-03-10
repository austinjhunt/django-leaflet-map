"""app URL Configuration"""
from django.contrib import admin
from django.urls import path, include
from .views import *
urlpatterns = [ 
    path('', HomeView.as_view(), name='home'), 
    path('layer/create/', CreateLayerView.as_view(), name='create-layer'), 
    path('layer/edit/<slug:pk>/', EditLayerView.as_view(), name='edit-layer'),
    path('layer/delete/<slug:pk>/', DeleteLayerView.as_view(), name='delete-layer'),
    path('layer/<slug:pk>', GetLayerView.as_view(), name='get-layer'),
    path('layers/manage', ManageAllLayersView.as_view(), name='manage-all-layers')
]
