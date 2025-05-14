from django.contrib import admin
from .models import OnboardingStep, UserOnboarding

@admin.register(OnboardingStep)
class OnboardingStepAdmin(admin.ModelAdmin):
    list_display = ('name', 'order', 'is_active')
    search_fields = ('name',)
    list_filter = ('is_active',)

@admin.register(UserOnboarding)
class UserOnboardingAdmin(admin.ModelAdmin):
    list_display = ('user', 'current_step', 'is_complete', 'completed_at')
    search_fields = ('user__email', 'current_step__name')
    list_filter = ('is_complete',)
