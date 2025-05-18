# subscriptions/management/commands/seed_plans.py
from django.core.management.base import BaseCommand
from subscriptions.models import Plan
from django.db import transaction

class Command(BaseCommand):
    help = 'Creates initial subscription plans in the database'

    def handle(self, *args, **options):
        # First delete all existing plans
        with transaction.atomic():
            existing_plans_count = Plan.objects.count()
            if existing_plans_count > 0:
                Plan.objects.all().delete()
                self.stdout.write(self.style.SUCCESS(f'Deleted {existing_plans_count} existing plans'))
            
            # Now create fresh plans
            plans = [
            {
                'name': 'Basic Plan',
                'slug': 'basic-monthly',
                'stripe_price_id': 'price_1RO3HrLa8vPOEHR78kogds4D',  # Actual Stripe price ID
                'price': 29.00,
                'interval': 'month',
                'features': [
                    '2 qualified meetings included (Free Trial)',
                    'Access to AI-powered onboarding wizard',
                    'Personalized welcome guide',
                    'Secure account dashboard with real-time tracking',
                    'Enhanced onboarding use cases & video tutorials',
                    'Email support during extended business hours',
                    'Access to comprehensive FAQs & knowledge base',
                    'Basic analytics and meeting insights'
                ],
                'is_active': True
            },
            {
                'name': 'Pro Plan',
                'slug': 'pro-monthly',
                'stripe_price_id': 'price_1RO3I9La8vPOEHR7d9EzMNvl',  # Actual Stripe price ID
                'price': 99.00,
                'interval': 'month',
                'features': [
                    'Up to 10 qualified meetings per month',
                    'Advanced meeting tracking dashboard',
                    'Full feature walkthrough with real-time AI insights',
                    'Customizable onboarding workflows per client',
                    'Priority email & live chat support',
                    'Stripe billing integration & plan auto-upgrade',
                    'Customer testimonials management access',
                    'Enhanced analytics with custom reporting'
                ],
                'is_active': True
            },
            {
                'name': 'Enterprise Plan',
                'slug': 'enterprise-monthly',
                'stripe_price_id': 'price_1RPhD8La8vPOEHR7GtHdIp91',  # Actual Stripe price ID
                'price': 499.00,
                'interval': 'month',
                'features': [
                    'Unlimited qualified meetings',
                    'Dedicated success manager',
                    'Full API access & enterprise integrations (CRM, ERP)',
                    'Custom roles with granular permission controls',
                    '24/7 SLA-backed premium support & live onboarding',
                    'Comprehensive analytics with customizable exports',
                    'Advanced branding customization and white-labeling',
                    'SSO authentication & enhanced security features'
                ],
                'is_active': True
            }
        ]

        # Create all plans from scratch
        created_count = 0
        for plan_data in plans:
            plan = Plan.objects.create(**plan_data)
            created_count += 1
            self.stdout.write(self.style.SUCCESS(f'Created plan: {plan.name}'))
            
        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_count} plans'))