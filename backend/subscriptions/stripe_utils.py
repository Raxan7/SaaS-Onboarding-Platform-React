# subscriptions/stripe_utils.py
import stripe
import time
import traceback
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from onboarding.models import UserOnboarding

stripe.api_key = settings.STRIPE_SECRET_KEY

def create_stripe_customer(user):
    customer = stripe.Customer.create(
        email=user.email,
        name=f"{user.first_name} {user.last_name}",
        metadata={
            "user_id": user.id,
            "company": user.company,
        }
    )
    return customer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    # Rate limiting - 1 request per 10 seconds per user
    cache_key = f"stripe_session_{request.user.id}"
    if cache.get(cache_key):
        return Response(
            {'error': 'Please wait before creating another payment session'},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )

    cache.set(cache_key, True, timeout=10)  # 10 second cooldown

    try:
        user = request.user
        price_id = request.data.get('price_id')

        if not price_id:
            return Response({'error': 'Price ID is required'}, status=400)

        # Get or create Stripe customer
        if not user.stripe_customer_id:
            customer = stripe.Customer.create(
                email=user.email,
                name=f"{user.first_name} {user.last_name}",
                metadata={
                    "user_id": user.id,
                    "company": user.company_name,
                }
            )
            user.stripe_customer_id = customer.id
            user.save()

        # Check for existing incomplete session for this price
        existing_sessions = stripe.checkout.Session.list(
            customer=user.stripe_customer_id,
            status='open',
            expand=['data.line_items'],
            limit=1
        )

        if existing_sessions.data:
            session = existing_sessions.data[0]
            try:
                if session.line_items.data and session.line_items.data[0].price.id == price_id:
                    return Response({
                        'url': session.url,
                        'reused': True
                    })
            except Exception as e:
                # Log this if needed, but continue to create new session
                pass

        session = stripe.checkout.Session.create(
            customer=user.stripe_customer_id,
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=settings.FRONTEND_URL + '/client-dashboard?payment_success=true',
            cancel_url=settings.FRONTEND_URL + '/onboarding/cancel',
        )

        return Response({'url': session.url})

    except stripe.error.RateLimitError:
        return Response(
            {'error': 'Too many requests to Stripe. Please try again later.'},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )
    except Exception as e:
        print("Error during Stripe checkout creation:")
        traceback.print_exc()
        return Response({'error': str(e)}, status=400)

@csrf_exempt
@api_view(['POST'])
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        print(f"Webhook error: {str(e)}")
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        print(f"Webhook signature verification failed: {str(e)}")
        return HttpResponse(status=400)

    # Handle webhook events
    try:
        print(f"Processing webhook event: {event['type']}")
        
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            customer_id = session.get('customer')
            subscription_id = session.get('subscription')
            print(f"Checkout session completed - Customer ID: {customer_id}, Subscription ID: {subscription_id}")
            
            from accounts.models import User
            from subscriptions.models import Plan, Subscription
            from onboarding.models import UserOnboarding
            
            print(f"Checkout completed for customer: {customer_id}, subscription: {subscription_id}")
            
            # Find the user by Stripe customer ID
            try:
                user = User.objects.get(stripe_customer_id=customer_id)
                print(f"Found user: {user.email}")
                
                # Get subscription details from Stripe
                if subscription_id:
                    stripe_subscription = stripe.Subscription.retrieve(subscription_id)
                    price_id = stripe_subscription['items']['data'][0]['price']['id']
                    
                    print(f"Subscription details - Price ID: {price_id}")
                    
                    # Find the corresponding plan
                    try:
                        plan = Plan.objects.get(stripe_price_id=price_id)
                        print(f"Found plan: {plan.name}")
                        
                        # Create or update subscription
                        subscription, created = Subscription.objects.update_or_create(
                            user=user,
                            defaults={
                                'plan': plan,
                                'status': 'active',
                                'stripe_subscription_id': subscription_id,
                                'current_period_end': timezone.datetime.fromtimestamp(
                                    stripe_subscription.current_period_end, 
                                    tz=timezone.get_current_timezone()
                                )
                            }
                        )
                        
                        if created:
                            print(f"Created new subscription for {user.email}")
                        else:
                            print(f"Updated subscription for {user.email}")
                        
                        # Update onboarding status
                        onboarding, _ = UserOnboarding.objects.get_or_create(user=user)
                        
                        # Initialize data if needed
                        if not onboarding.data:
                            onboarding.data = {}
                            
                        onboarding.data['payment_step_completed'] = True
                        onboarding.data['selected_plan_id'] = price_id
                        onboarding.is_complete = True
                        onboarding.completed_at = timezone.now()
                        onboarding.save()
                        
                        print(f"Updated onboarding status for {user.email}")
                    
                    except Plan.DoesNotExist:
                        print(f"Plan not found for price_id: {price_id}")
                
                else:
                    print("No subscription ID found in session")
            
            except User.DoesNotExist:
                print(f"User not found for customer: {customer_id}")
                
        elif event['type'] == 'invoice.payment_succeeded':
            invoice = event['data']['object']
            customer_id = invoice.get('customer')
            subscription_id = invoice.get('subscription')
            
            # Handle successful recurring payment
            if subscription_id:
                from accounts.models import User
                from subscriptions.models import Subscription
                
                try:
                    user = User.objects.get(stripe_customer_id=customer_id)
                    subscription = Subscription.objects.get(stripe_subscription_id=subscription_id)
                    
                    # Get updated subscription details from Stripe
                    stripe_sub = stripe.Subscription.retrieve(subscription_id)
                    
                    # Update subscription period end
                    subscription.current_period_end = timezone.datetime.fromtimestamp(
                        stripe_sub.current_period_end, 
                        tz=timezone.get_current_timezone()
                    )
                    subscription.status = 'active'
                    subscription.save()
                    
                    print(f"Updated subscription renewal for {user.email}")
                    
                except (User.DoesNotExist, Subscription.DoesNotExist) as e:
                    print(f"Error updating subscription: {str(e)}")
        
        elif event['type'] == 'customer.subscription.deleted':
            subscription_data = event['data']['object']
            subscription_id = subscription_data.get('id')
            
            from subscriptions.models import Subscription
            
            try:
                subscription = Subscription.objects.get(stripe_subscription_id=subscription_id)
                subscription.status = 'canceled'
                subscription.save()
                
                print(f"Subscription {subscription_id} marked as canceled")
                
            except Subscription.DoesNotExist:
                print(f"Subscription not found: {subscription_id}")
    
    except Exception as e:
        print(f"Error processing webhook: {str(e)}")
        import traceback
        traceback.print_exc()
    
    return HttpResponse(status=200)

@api_view(['GET'])
def onboarding_success(request):
    user = request.user

    try:
        # Mark onboarding as complete
        onboarding, _ = UserOnboarding.objects.get_or_create(user=user)
        onboarding.is_complete = True
        onboarding.completed_at = timezone.now()
        onboarding.save()

        # Redirect to client dashboard
        return Response({
            'redirect_url': settings.FRONTEND_URL + '/client-dashboard/'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)