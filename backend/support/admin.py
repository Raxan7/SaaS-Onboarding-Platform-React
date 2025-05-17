from django.contrib import admin
from .models import SupportConversation, SupportMessage, SupportArticle

class SupportMessageInline(admin.TabularInline):
    model = SupportMessage
    extra = 0
    readonly_fields = ['created_at']

@admin.register(SupportConversation)
class SupportConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'title', 'created_at', 'updated_at', 'resolved']
    list_filter = ['resolved', 'created_at']
    search_fields = ['user__email', 'title']
    date_hierarchy = 'created_at'
    inlines = [SupportMessageInline]

@admin.register(SupportArticle)
class SupportArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'created_at', 'updated_at', 'is_published']
    list_filter = ['category', 'is_published', 'created_at']
    search_fields = ['title', 'content']
    prepopulated_fields = {'slug': ('title',)}
