# subscriptions/serializers.py
from rest_framework import serializers
from .models import Plan, Subscription

class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ['id', 'name', 'slug', 'price', 'interval', 'features', 'is_active']

class SubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)
    days_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'plan', 'status', 'current_period_end', 
            'cancel_at_period_end', 'stripe_subscription_id',
            'created_at', 'updated_at', 'days_remaining'
        ]
    
    def get_days_remaining(self, obj):
        from django.utils import timezone
        if not obj.current_period_end:
            return 0
            
        now = timezone.now()
        if now > obj.current_period_end:
            return 0
            
        delta = obj.current_period_end - now
        return delta.days
