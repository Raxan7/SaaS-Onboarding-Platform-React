from rest_framework import serializers
from .models import OnboardingStep, UserOnboarding

class OnboardingStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnboardingStep
        fields = ['id', 'name', 'description', 'order']

class UserOnboardingSerializer(serializers.ModelSerializer):
    current_step = OnboardingStepSerializer()
    
    class Meta:
        model = UserOnboarding
        fields = ['id', 'current_step', 'is_complete', 'completed_at', 'data']