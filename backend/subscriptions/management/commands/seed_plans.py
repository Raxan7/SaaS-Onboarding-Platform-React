# subscriptions/management/commands/seed_plans.py
from django.core.management.base import BaseCommand
from subscriptions.models import Plan

class Command(BaseCommand):
    help = 'Creates initial subscription plans in the database'

    def handle(self, *args, **options):
        plans = [
            {
                'name': 'Basic Plan',
                'slug': 'basic-monthly',
                'stripe_price_id': 'price_basic_monthly_123',  # Replace with actual Stripe price ID
                'price': 29.00,
                'interval': 'month',
                'features': [
                    'Up to 100 users',
                    'Basic support',
                    'Core features'
                ],
                'is_active': True
            },
            {
                'name': 'Pro Plan',
                'slug': 'pro-monthly',
                'stripe_price_id': 'price_pro_monthly_456',  # Replace with actual Stripe price ID
                'price': 99.00,
                'interval': 'month',
                'features': [
                    'Up to 500 users',
                    'Priority support',
                    'All features'
                ],
                'is_active': True
            }
        ]

        for plan_data in plans:
            plan, created = Plan.objects.get_or_create(
                slug=plan_data['slug'],
                defaults=plan_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created plan: {plan.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Plan already exists: {plan.name}'))