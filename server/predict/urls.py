from django.urls import path

from . import views


urlpatterns = [
	path('', views.index, name='index'),	
	path('addrow', views.addrow, name='addrow'),
	path('takerow/', views.takerow, name='takerow'),
]