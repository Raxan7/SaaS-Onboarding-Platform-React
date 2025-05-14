from django.contrib import admin
from .models import Plan, Subscription

@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'interval', 'is_active')
    search_fields = ('name',)
    list_filter = ('is_active', 'interval')

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'status', 'current_period_end')
    search_fields = ('user__email', 'plan__name')
    list_filter = ('status',)
