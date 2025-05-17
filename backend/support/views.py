from django.shortcuts import render
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count, Max
from .models import SupportConversation, SupportMessage, SupportArticle
from .serializers import SupportConversationSerializer, SupportMessageSerializer, SupportArticleSerializer


class SupportConversationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for support conversations
    """
    serializer_class = SupportConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter conversations based on user role:
        - Regular users can only see their own conversations
        - Staff users can see all conversations
        """
        user = self.request.user
        if user.is_staff:
            return SupportConversation.objects.all().order_by('-updated_at')
        return SupportConversation.objects.filter(user=user).order_by('-updated_at')
    
    def perform_create(self, serializer):
        """Create conversation with current user as owner"""
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_message(self, request, pk=None):
        """Add a new message to the conversation"""
        conversation = self.get_object()
        data = {
            'conversation': conversation.id,
            'sender_type': 'USER' if not request.user.is_staff else 'SUPPORT',
            'message': request.data.get('message', '')
        }
        
        serializer = SupportMessageSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            
            # Update conversation timestamp
            conversation.save()  # This updates the updated_at field
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def mark_as_resolved(self, request, pk=None):
        """Mark conversation as resolved"""
        conversation = self.get_object()
        conversation.resolved = True
        conversation.save()
        return Response({'status': 'conversation marked as resolved'})
    
    @action(detail=True, methods=['post'])
    def reopen(self, request, pk=None):
        """Reopen a resolved conversation"""
        conversation = self.get_object()
        conversation.resolved = False
        conversation.save()
        return Response({'status': 'conversation reopened'})


class SupportArticleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for support articles
    """
    queryset = SupportArticle.objects.filter(is_published=True)
    serializer_class = SupportArticleSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'content', 'category']
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get list of all categories and their article counts"""
        categories = SupportArticle.objects.filter(is_published=True).values('category').annotate(
            count=Count('category')).order_by('category')
        return Response(categories)


class AdminSupportArticleViewSet(viewsets.ModelViewSet):
    """
    API endpoint for staff to manage support articles
    """
    queryset = SupportArticle.objects.all()
    serializer_class = SupportArticleSerializer
    permission_classes = [permissions.IsAdminUser]
