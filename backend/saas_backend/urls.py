"""
URL configuration for saas_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken import views
from accounts.api import UserRegisterAPIView, UserDetailAPIView, get_csrf_token, CustomAuthToken

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('rest_framework.urls')),
    path('api/auth/register/', UserRegisterAPIView.as_view(), name='register'),
    path('api/auth/user/', UserDetailAPIView.as_view(), name='user-detail'),
    path('api/auth/token/', CustomAuthToken.as_view(), name='api_token_auth'),
    path('api/auth/csrf/', get_csrf_token, name='get-csrf-token'),
    
    # Include other app URLs
    path('api/subscriptions/', include('subscriptions.urls')),
    path('api/onboarding/', include('onboarding.urls')),
    path('api/meetings/', include('meetings.urls')),
]
