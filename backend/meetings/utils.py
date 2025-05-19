from django.db.models import Count
from django.utils import timezone
from datetime import datetime
from .models import Meeting
from subscriptions.models import Subscription, Plan

def get_meeting_limits(user):
    """
    Returns the meeting limits based on user's subscription plan.
    Returns a tuple of (limit, current_count, is_unlimited)
    """
    # Default limits for different plans
    BASIC_LIMIT = 2
    PRO_LIMIT = 11
    ENTERPRISE_LIMIT = float('inf')  # unlimited
    
    # Default values for free/no subscription users
    limit = BASIC_LIMIT
    is_unlimited = False
    
    # Check if user has an active subscription
    subscription = Subscription.objects.filter(
        user=user, 
        status='active',
    ).first()
    
    if subscription:
        plan_name = subscription.plan.name.lower()
        
        if 'basic' in plan_name:
            limit = BASIC_LIMIT
        elif 'pro' in plan_name:
            limit = PRO_LIMIT
        elif 'enterprise' in plan_name:
            limit = ENTERPRISE_LIMIT
            is_unlimited = True
    
    # Count meetings created this month
    current_month = timezone.now().month
    current_year = timezone.now().year
    
    current_count = Meeting.objects.filter(
        user=user,
        created_at__month=current_month,
        created_at__year=current_year
    ).count()
    
    return (limit, current_count, is_unlimited)

def can_create_meeting(user):
    """
    Checks if a user can create a new meeting based on their subscription plan limits.
    Returns a tuple of (can_create, limit, current_count, remaining)
    """
    limit, current_count, is_unlimited = get_meeting_limits(user)
    
    if is_unlimited:
        return (True, limit, current_count, float('inf'))
    
    remaining = max(0, limit - current_count)
    can_create = current_count < limit
    
    return (can_create, limit, current_count, remaining)
