# subscriptions/management/commands/fix_subscriptions.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import User
from subscriptions.models import Plan, Subscription
from onboarding.models import UserOnboarding
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Fixes subscription records for users who have paid but do not have proper subscription records'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-email',
            help='Fix subscription only for a specific user by email',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Fix all users with completed onboarding but missing subscriptions',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Only show what would be fixed without making changes',
        )

    def handle(self, *args, **options):
        user_email = options.get('user_email')
        fix_all = options.get('all')
        dry_run = options.get('dry_run')

        if not (user_email or fix_all):
            self.stdout.write(self.style.ERROR('Please provide either --user-email or --all flag'))
            return

        if user_email:
            try:
                users = User.objects.filter(email=user_email)
                if not users.exists():
                    self.stdout.write(self.style.ERROR(f'No user found with email: {user_email}'))
                    return
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error finding user: {str(e)}'))
                return
        else:
            # Find all users with completed onboarding
            users = User.objects.filter(
                useronboarding__is_complete=True
            )

        fixed_count = 0
        skipped_count = 0

        for user in users:
            try:
                # Check if user already has an active subscription
                existing_sub = Subscription.objects.filter(user=user, status='active').exists()
                
                if existing_sub:
                    self.stdout.write(f'User {user.email} already has an active subscription, skipping')
                    skipped_count += 1
                    continue

                # Get user's onboarding data
                onboarding = UserOnboarding.objects.get(user=user)
                
                if not onboarding.is_complete:
                    self.stdout.write(f'User {user.email} has not completed onboarding, skipping')
                    skipped_count += 1
                    continue
                
                # Check if the onboarding has a selected plan
                if not onboarding.data or 'selected_plan_id' not in onboarding.data:
                    self.stdout.write(f'User {user.email} has no selected plan in onboarding data, skipping')
                    skipped_count += 1
                    continue
                
                selected_plan_id = onboarding.data.get('selected_plan_id')
                
                # Find the plan
                try:
                    plan = Plan.objects.get(stripe_price_id=selected_plan_id)
                except Plan.DoesNotExist:
                    # Try to find by any field containing the ID
                    plans = Plan.objects.filter(stripe_price_id__contains=selected_plan_id.split('_')[-1])
                    if plans.exists():
                        plan = plans.first()
                    else:
                        # Fallback to any active plan
                        plans = Plan.objects.filter(is_active=True)
                        if plans.exists():
                            plan = plans.first()
                        else:
                            self.stdout.write(self.style.ERROR(f'No plans found for user {user.email}'))
                            skipped_count += 1
                            continue
                
                self.stdout.write(f'Will create subscription for {user.email} with plan {plan.name}')
                
                if not dry_run:
                    # Create subscription
                    Subscription.objects.create(
                        user=user,
                        plan=plan,
                        status='active',
                        stripe_subscription_id=f'manual_fix_{timezone.now().timestamp()}',
                        current_period_end=timezone.now() + timezone.timedelta(days=30)
                    )
                    
                    # Make sure onboarding data reflects payment
                    if not onboarding.data:
                        onboarding.data = {}
                    
                    onboarding.data['payment_step_completed'] = True
                    onboarding.save()
                    
                    self.stdout.write(self.style.SUCCESS(f'Created subscription for {user.email}'))
                else:
                    self.stdout.write(f'[DRY RUN] Would create subscription for {user.email} with plan {plan.name}')
                
                fixed_count += 1
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error fixing subscription for {user.email}: {str(e)}'))
                skipped_count += 1

        if dry_run:
            self.stdout.write(self.style.SUCCESS(
                f'Dry run completed. Would fix {fixed_count} subscriptions. Skipped {skipped_count}.'
            ))
        else:
            self.stdout.write(self.style.SUCCESS(
                f'Successfully fixed {fixed_count} subscriptions. Skipped {skipped_count}.'
            ))
