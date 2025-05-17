from django.urls import path
from .stripe_utils import create_checkout_session, stripe_webhook
from .views import PlanListAPIView, PaymentCompleteView, UserSubscriptionView

urlpatterns = [
    path('create-checkout-session/', create_checkout_session, name='create-checkout-session'),
    path('webhook/', stripe_webhook, name='stripe-webhook'),
    path('plans/', PlanListAPIView.as_view(), name='plan-list'),
    path('payment-complete/', PaymentCompleteView.as_view(), name='payment-complete'),
    path('user-subscription/', UserSubscriptionView.as_view(), name='user-subscription'),
]