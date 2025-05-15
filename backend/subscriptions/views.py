from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Plan
import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from .models import Subscription
from onboarding.models import UserOnboarding

stripe.api_key = settings.STRIPE_SECRET_KEY

class PlanListAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]  # Allow GET for everyone or authenticated users

    def get_queryset(self):
        return Plan.objects.filter(is_active=True)

    def list(self, request, *args, **kwargs):
        try:
            # First try to get plans from database
            db_plans = self.get_queryset()
            if db_plans.exists():
                data = [{
                    'id': plan.stripe_price_id,
                    'name': plan.name,
                    'price': f"${plan.price}/{plan.interval}",
                    'features': plan.features or []
                } for plan in db_plans]
                return Response(data)

            # Fallback to Stripe if no plans in database
            prices = stripe.Price.list(active=True, expand=['data.product'])
            data = [{
                'id': price.id,
                'name': price.product.name,
                'price': f"${price.unit_amount/100}/{price.recurring.interval}",
                'features': getattr(price.product, 'features', [])
            } for price in prices.data]

            return Response(data)

        except Exception as e:
            return Response([{
                'id': 'basic_monthly',
                'name': 'Basic Plan',
                'price': '$29/month',
                'features': ['Up to 100 users', 'Basic support']
            }, {
                'id': 'pro_monthly',
                'name': 'Pro Plan',
                'price': '$99/month',
                'features': ['Unlimited users', 'Priority support']
            }])

class PaymentCompleteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        # Mark payment as completed
        try:
            # Get the user's onboarding data to find their selected plan
            onboarding, _ = UserOnboarding.objects.get_or_create(user=user)
            
            # Initialize the data field if it's None
            if onboarding.data is None:
                onboarding.data = {}
            
            # Get the selected plan ID from the onboarding data
            selected_plan_id = onboarding.data.get('selected_plan_id')
            
            if not selected_plan_id:
                return Response({
                    'error': 'No plan selected. Please select a plan before completing payment.',
                    'detail': 'Missing plan ID in onboarding data'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Find the plan with the given stripe_price_id
            try:
                plan = Plan.objects.get(stripe_price_id=selected_plan_id)
                print(f"Found plan: {plan.name} with ID: {plan.id}")
            except Plan.DoesNotExist:
                # If plan doesn't exist with stripe_price_id, create a new one
                plan_name = "Selected Plan"  # Default name
                
                # Try to parse the price from the ID (common format: price_XXX)
                plan = Plan.objects.create(
                    name=plan_name,
                    slug=f"plan-{user.id}-{timezone.now().timestamp()}",  # Create unique slug
                    stripe_price_id=selected_plan_id,
                    price=0.00,  # Default price, will be updated by webhook
                    interval="month",  # Default interval
                    is_active=True
                )
                print(f"Created new plan with stripe_price_id: {selected_plan_id}")
            
            # Create or update subscription
            try:
                # Try to get existing subscription first
                subscription = Subscription.objects.get(user=user)
                subscription.plan = plan
                subscription.status = 'active'
                subscription.updated_at = timezone.now()
                subscription.save()
                print(f"Updated subscription for user {user.id} with plan {plan.id}")
            except Subscription.DoesNotExist:
                # Create new subscription
                subscription = Subscription.objects.create(
                    user=user,
                    plan=plan,
                    status='active',
                    stripe_subscription_id='manual_activation'  # Placeholder
                )
                print(f"Created new subscription for user {user.id} with plan {plan.id}")
            
            # Mark payment step as completed and onboarding as complete
            onboarding.data['payment_step_completed'] = True
            onboarding.is_complete = True
            onboarding.completed_at = timezone.now()
            onboarding.save()
            
            print(f"Successfully marked onboarding as complete for user {user.id}")
            
            return Response({
                'status': 'Payment and onboarding completed successfully',
                'is_complete': True,
                'payment_step_completed': True
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            print(f"Error in PaymentCompleteView: {str(e)}")
            print(traceback.format_exc())
            return Response({
                'error': str(e),
                'detail': 'An error occurred while marking payment as complete'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)