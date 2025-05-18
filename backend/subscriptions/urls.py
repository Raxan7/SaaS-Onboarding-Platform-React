from django.urls import path
from .stripe_utils import (
    create_checkout_session, 
    stripe_webhook, 
    check_payment_status,
    confirm_payment_completion
)
from .views import PlanListAPIView, UserSubscriptionView

urlpatterns = [
    path('create-checkout-session/', create_checkout_session, name='create-checkout-session'),
    path('check-payment-status/', check_payment_status, name='check-payment-status'),
    path('confirm-payment/', confirm_payment_completion, name='confirm-payment'),
    path('webhook/', stripe_webhook, name='stripe-webhook'),
    path('plans/', PlanListAPIView.as_view(), name='plan-list'),
    path('user-subscription/', UserSubscriptionView.as_view(), name='user-subscription'),
]