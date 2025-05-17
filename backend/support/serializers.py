from rest_framework import serializers
from .models import SupportConversation, SupportMessage, SupportArticle
from accounts.serializers import UserSerializer

class SupportMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportMessage
        fields = ['id', 'sender_type', 'message', 'created_at', 'read']
        read_only_fields = ['id', 'created_at']


class SupportConversationSerializer(serializers.ModelSerializer):
    messages = SupportMessageSerializer(many=True, read_only=True)
    user_email = serializers.SerializerMethodField()
    
    class Meta:
        model = SupportConversation
        fields = ['id', 'user', 'user_email', 'title', 'created_at', 'updated_at', 'resolved', 'messages']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_user_email(self, obj):
        return obj.user.email


class SupportArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportArticle
        fields = ['id', 'title', 'slug', 'content', 'category', 'created_at', 'updated_at', 'is_published']
        read_only_fields = ['id', 'created_at', 'updated_at']
