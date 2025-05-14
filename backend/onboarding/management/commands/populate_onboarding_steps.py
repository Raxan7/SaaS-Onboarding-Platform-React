from django.core.management.base import BaseCommand
from onboarding.models import OnboardingStep

class Command(BaseCommand):
    help = 'Populate the OnboardingStep table with default steps'

    def handle(self, *args, **kwargs):
        steps = [
            {'name': 'Account Setup', 'description': 'Set up your account details.', 'order': 1},
            {'name': 'Company Info', 'description': 'Provide your company information.', 'order': 2},
            {'name': 'Meeting Scheduling', 'description': 'Schedule your first meeting.', 'order': 3},
            {'name': 'Payment', 'description': 'Set up your payment details.', 'order': 4},
        ]

        for step in steps:
            OnboardingStep.objects.update_or_create(
                order=step['order'],
                defaults={
                    'name': step['name'],
                    'description': step['description'],
                    'is_active': True,
                }
            )

        self.stdout.write(self.style.SUCCESS('Successfully populated the OnboardingStep table.'))