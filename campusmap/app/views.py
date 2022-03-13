from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.generic import TemplateView, View, DetailView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.conf import settings
from .models import * 
from .mixins import * 
import json 

# Create your views here.
class HomeView(View):
    template_name = 'index.html'
    def get(self, request): 
        return render(
            request=request,
            template_name=self.template_name,
            context={
                'layers': FeatureCollection.objects.all()
            }
        )

class EditLayerView(View):
    def get(self, request, pk):  
        return render(
            request=request,
            template_name='forms/edit-layer.html',
            context={'layer': FeatureCollection.objects.get(id=pk)}
        )
    def post(self, request, pk): 
        title = request.POST.get('title', None)
        description = request.POST.get('description', None)
        geojson = request.POST.get('geojson', None) 
        if title and description and geojson: 
            try:
                geojson_decoded = json.loads(geojson) 
                fc = FeatureCollection.objects.get(id=pk)
                fc.title = title
                fc.description = description 
                fc.geojson = geojson
                fc.save() 
                return redirect('home')
            except json.decoder.JSONDecodeError:
                print('geojson was not valid JSON, not saving') 
                return redirect('create-layer') 
        else:
            return redirect('create-layer') 

class DeleteLayerView(View):
    def get(self, request, pk):  
        return render(
            request=request,
            template_name='forms/delete-layer.html',
            context={'layer': FeatureCollection.objects.get(id=pk)}
        )
    def post(self, request, pk): 
        try:
            fc = FeatureCollection.objects.get(id=pk)
            UserGroup.objects.filter(feature_collection_id=fc.id).delete()
            fc.delete()
        except:
            pass 
        return redirect('home')


class CreateLayerView(View):  
    def get(self, request):
        return render(
            request=request,
            template_name='forms/create-layer.html',
            context={}
        )
    def post(self, request): 
        title = request.POST.get('title', None)
        description = request.POST.get('description', None)
        geojson = request.POST.get('geojson', None) 
        if title and description and geojson: 
            try:
                geojson_decoded = json.loads(geojson) 
                fc = FeatureCollection(
                    title=title,
                    description=description,
                    geojson=geojson
                )
                fc.save()
                # Create a corresponding User Group which will have permissions
                # to manage this layer
                UserGroup(feature_collection=fc).save() 
                return redirect('home')
            except json.decoder.JSONDecodeError:
                print('geojson was not valid JSON, not saving') 
                return redirect('create-layer') 
        else:
            return redirect('create-layer') 

class ManageAllLayersView(View, StaffRoleRequiredMixin):
    def get(self, request): 
        return render(
            request=request,
            template_name='manage.html',
            context={
                'layers': FeatureCollection.objects.all()
            }
        )

class GetLayerView(View):
    def get(self, request, pk):
        fc = FeatureCollection.objects.get(id=pk) 
        data = {   
                    'id': fc.id,
                    'title': fc.title,
                    'description': fc.description,
                    'geojson': fc.geojson
                }
        return JsonResponse(data, safe=False)

class GetMapboxConfig(View, LoginRequiredMixin):
    def get(self, request): 
        data = {
            'accessToken': settings.MAPBOX_ACCESS_TOKEN, 
            'center' : settings.MAPBOX_CENTER_COORDINATES,
            'zoom': settings.MAPBOX_INITIAL_ZOOM,
            'username': settings.MAPBOX_USERNAME
        }
        return JsonResponse(data) 
