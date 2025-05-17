from django.db import models
from django.conf import settings
from accounts.models import User

class SupportConversation(models.Model):
    """
    A support conversation between a user and support staff
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_conversations')
    title = models.CharField(max_length=100, default="Support Conversation")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Conversation {self.id} - {self.user.email}"


class SupportMessage(models.Model):
    """
    Individual message in a support conversation
    """
    SENDER_CHOICES = (
        ('USER', 'User'),
        ('SUPPORT', 'Support'),
        ('SYSTEM', 'System'),
    )
    
    conversation = models.ForeignKey(SupportConversation, on_delete=models.CASCADE, related_name='messages')
    sender_type = models.CharField(max_length=10, choices=SENDER_CHOICES)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Message from {self.sender_type} in {self.conversation.id}"

    class Meta:
        ordering = ['created_at']


class SupportArticle(models.Model):
    """
    Knowledge base article for self-help support
    """
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    category = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=True)
    
    def __str__(self):
        return self.title

    class Meta:
        ordering = ['category', 'title']
