from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'conversations', views.SupportConversationViewSet, basename='support-conversation')
router.register(r'articles', views.SupportArticleViewSet, basename='support-article')
router.register(r'admin/articles', views.AdminSupportArticleViewSet, basename='admin-support-article')

urlpatterns = [
    path('', include(router.urls)),
]
