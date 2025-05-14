from django.db import models
from accounts.models import User

class OnboardingStep(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    order = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name

class UserOnboarding(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    current_step = models.ForeignKey(OnboardingStep, on_delete=models.SET_NULL, null=True)
    is_complete = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    data = models.JSONField(default=dict)  # Store any additional onboarding data

    def __str__(self):
        return f"{self.user.email} - Onboarding"
