# onboarding/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompleteOnboardingAPIView, OnboardingStepListAPIView, UserOnboardingViewSet, UserOnboardingStatusAPIView, CompanyInfoAPIView, UpdateOnboardingStepAPIView, UpdatePaymentInfoAPIView, PaymentCompleteAPIView

router = DefaultRouter()
router.register(r'user-onboarding', UserOnboardingViewSet, basename='user-onboarding')

urlpatterns = [
    path('steps/', OnboardingStepListAPIView.as_view(), name='onboarding-step-list'),
    path('user-onboarding-status/', UserOnboardingStatusAPIView.as_view(), name='user-onboarding-status'),
    path('user-onboarding-status/payment/', PaymentCompleteAPIView.as_view(), name='payment-complete'),
    path('complete/', CompleteOnboardingAPIView.as_view(), name='complete-onboarding'),
    path('company/', CompanyInfoAPIView.as_view(), name='company-info'),
    path('update-step/', UpdateOnboardingStepAPIView.as_view(), name='update-onboarding-step'),
    path('update-payment-info/', UpdatePaymentInfoAPIView.as_view(), name='update-payment-info'),
    path('', include(router.urls)),  # This includes all ViewSet URLs
]
