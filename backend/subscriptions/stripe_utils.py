# subscriptions/stripe_utils.py
from datetime import datetime
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
from .models import Plan, Subscription

stripe.api_key = settings.STRIPE_SECRET_KEY

def create_stripe_customer(user):
    customer = stripe.Customer.create(
        email=user.email,
        name=f"{user.first_name} {user.last_name}",
        metadata={
            "user_id": user.id,
            "company": user.company_name,
        }
    )
    return customer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    # Rate limiting - 1 request per 10 seconds per user
    print(f"Creating checkout session for user: {request.user.email}")
    
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

        # Create new checkout session
        session = stripe.checkout.Session.create(
            customer=user.stripe_customer_id,
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=settings.FRONTEND_URL + '/client-dashboard?payment_success=true&session_id={CHECKOUT_SESSION_ID}',
            cancel_url=settings.FRONTEND_URL + '/onboarding/cancel',
            metadata={
                'user_id': str(user.id),
                'onboarding': 'true'
            }
        )

        # Save the session ID in the user's onboarding data
        onboarding, _ = UserOnboarding.objects.get_or_create(user=user)
        onboarding.data = onboarding.data or {}
        onboarding.data['stripe_session_id'] = session.id
        onboarding.data['selected_plan_id'] = price_id
        onboarding.save()

        return Response({
            'url': session.url,
            'session_id': session.id
        })

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
    print("Received Stripe webhook")
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

    try:
        import logging
        logger = logging.getLogger('payment_process')
        logger.info(f"Processing webhook event: {event['type']}")
        
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            customer_id = session.get('customer')
            subscription_id = session.get('subscription')
            session_id = session.get('id')

            logger.info(f"Checkout completed - Customer ID: {customer_id}, Subscription ID: {subscription_id}, Session ID: {session_id}")
            
            if not customer_id:
                logger.warning("No customer ID in session")
                return HttpResponse(status=200)
                
            try:
                from accounts.models import User
                from subscriptions.models import Plan, Subscription
                from onboarding.models import UserOnboarding
                
                # Try to find the user first by stripe_customer_id
                try:
                    user = User.objects.get(stripe_customer_id=customer_id)
                    logger.info(f"Found user by stripe_customer_id: {user.email}")
                except User.DoesNotExist:
                    # If not found, try to find by metadata
                    logger.warning(f"User not found by customer_id: {customer_id}, checking metadata")
                    
                    if session.get('metadata') and session['metadata'].get('user_id'):
                        try:
                            user_id = session['metadata']['user_id']
                            user = User.objects.get(id=user_id)
                            logger.info(f"Found user by metadata: {user.email}")
                            
                            # Update the user's stripe_customer_id while we're here
                            if not user.stripe_customer_id:
                                user.stripe_customer_id = customer_id
                                user.save()
                                logger.info(f"Updated user's stripe_customer_id to: {customer_id}")
                        except (User.DoesNotExist, ValueError):
                            logger.error(f"User not found with metadata user_id: {session['metadata'].get('user_id')}")
                            return HttpResponse(status=200)
                    else:
                        logger.error("No user_id in metadata and no matching stripe_customer_id")
                        return HttpResponse(status=200)
                
                # We have a confirmed user, process the subscription
                if subscription_id:
                    try:
                        # Get the full subscription details from Stripe
                        stripe_subscription = stripe.Subscription.retrieve(subscription_id)
                        
                        if stripe_subscription['items']['data']:
                            price_id = stripe_subscription['items']['data'][0]['price']['id']
                            logger.info(f"Extracted price_id from subscription: {price_id}")
                            
                            try:
                                # Find the plan in our database
                                plan = Plan.objects.get(stripe_price_id=price_id)
                                logger.info(f"Found existing plan: {plan.name}")
                            except Plan.DoesNotExist:
                                logger.warning(f"Plan not found for price_id: {price_id}, creating new plan")
                                
                                # Get some details from the Stripe price object
                                price_obj = stripe.Price.retrieve(price_id)
                                plan_name = price_obj.get('nickname', f"Plan for {price_id}")
                                
                                # Create the plan in our database
                                plan = Plan.objects.create(
                                    name=plan_name,
                                    slug=f"auto-{price_id[:8]}",
                                    stripe_price_id=price_id,
                                    price=price_obj.get('unit_amount', 0) / 100 if price_obj.get('unit_amount') else 0,
                                    interval=price_obj.get('recurring', {}).get('interval', 'month'),
                                    is_active=True
                                )
                                logger.info(f"Created new plan: {plan.name}")
                            
                            # Create or update the subscription
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
                            
                            logger.info(f"{'Created' if created else 'Updated'} subscription for user: {user.email}")
                            
                            # Update onboarding status
                            onboarding, created = UserOnboarding.objects.get_or_create(user=user)
                            if not onboarding.data:
                                onboarding.data = {}
                                
                            # Save all the relevant info
                            onboarding.data['payment_step_completed'] = True
                            onboarding.data['selected_plan_id'] = price_id
                            onboarding.data['stripe_session_id'] = session_id
                            onboarding.data['stripe_subscription_id'] = subscription_id
                            onboarding.is_complete = True
                            onboarding.completed_at = timezone.now()
                            onboarding.save()
                            
                            logger.info(f"Updated onboarding for user {user.email}, marked as complete")
                    except Exception as subscription_error:
                        logger.exception(f"Error processing subscription: {subscription_error}")
            except Exception as user_error:
                logger.exception(f"Error finding or processing user: {user_error}")
                
        elif event['type'] == 'invoice.payment_succeeded':
            invoice = event['data']['object']
            customer_id = invoice.get('customer')
            subscription_id = invoice.get('subscription')
            
            logger.info(f"Invoice payment succeeded - Customer ID: {customer_id}, Subscription ID: {subscription_id}")
            
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
                    
                    logger.info(f"Updated subscription renewal for {user.email}")
                    
                except (User.DoesNotExist, Subscription.DoesNotExist) as e:
                    logger.error(f"Error updating subscription renewal: {str(e)}")
        
        elif event['type'] == 'customer.subscription.deleted':
            subscription_data = event['data']['object']
            subscription_id = subscription_data.get('id')
            
            logger.info(f"Subscription deleted - ID: {subscription_id}")
            
            from subscriptions.models import Subscription
            
            try:
                subscription = Subscription.objects.get(stripe_subscription_id=subscription_id)
                subscription.status = 'canceled'
                subscription.save()
                
                logger.info(f"Subscription {subscription_id} marked as canceled")
                
            except Subscription.DoesNotExist:
                logger.warning(f"Subscription not found for deletion: {subscription_id}")
                
        # Handle payment_intent.succeeded as fallback for direct payments
        elif event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            customer_id = payment_intent.get('customer')
            logger.info(f"Payment intent succeeded - Customer ID: {customer_id}")
            
            # Try to find related checkout session
            if customer_id:
                from accounts.models import User
                try:
                    user = User.objects.get(stripe_customer_id=customer_id)
                    logger.info(f"Found user for payment intent: {user.email}")
                    
                    # Check if this user has a pending subscription
                    from onboarding.models import UserOnboarding
                    try:
                        onboarding = UserOnboarding.objects.get(user=user)
                        if onboarding.data and not onboarding.data.get('payment_step_completed'):
                            logger.info(f"Found incomplete onboarding for user, completing it")
                            
                            # Auto-complete onboarding if we have a successful payment
                            onboarding.data['payment_step_completed'] = True
                            onboarding.is_complete = True
                            onboarding.completed_at = timezone.now()
                            onboarding.save()
                            
                            logger.info(f"Auto-completed onboarding for {user.email} via payment intent")
                    except UserOnboarding.DoesNotExist:
                        logger.warning(f"No onboarding data for user: {user.email}")
                except User.DoesNotExist:
                    logger.warning(f"User not found for customer: {customer_id}")
                
    except Exception as e:
        logger.exception(f"Error processing webhook: {str(e)}")
    
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
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_payment_status(request):
    session_id = request.GET.get('session_id')
    if not session_id:
        return Response({'error': 'session_id is required'}, status=400)

    try:
        session = stripe.checkout.Session.retrieve(session_id)
        
        if session.payment_status == 'paid':
            # Verify subscription exists
            subscription = stripe.Subscription.retrieve(session.subscription)
            
            return Response({
                'status': 'completed',
                'payment_status': 'paid',
                'subscription_id': subscription.id,
                'plan_id': subscription['items']['data'][0]['price']['id']
            })
        
        return Response({
            'status': 'pending',
            'payment_status': session.payment_status
        })

    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_payment_completion(request):
    import logging
    logger = logging.getLogger('payment_process')
    
    try:
        user = request.user
        logger.info(f"Payment confirmation requested for user: {user.email}")
        
        session_id = request.data.get('session_id')
        plan_id = request.data.get('plan_id')
        
        logger.info(f"Payment confirmation parameters - Session ID: {session_id}, Plan ID: {plan_id}")
        
        if not session_id and not plan_id:
            logger.error("Missing required parameters")
            return Response({'error': 'Either session_id or plan_id is required'}, status=400)

        # First try with session_id if available
        if session_id:
            try:
                # Try to retrieve the Stripe session
                session = stripe.checkout.Session.retrieve(session_id)
                logger.info(f"Retrieved Stripe session: {session.id}, payment status: {session.payment_status}")
                
                subscription_id = session.get('subscription')
                
                # If it's a subscription, get details from it
                if session.payment_status == 'paid' and subscription_id:
                    subscription = stripe.Subscription.retrieve(subscription_id)
                    price_id = subscription['items']['data'][0]['price']['id']
                    logger.info(f"Using price_id from subscription: {price_id}")
                    
                    # Override plan_id with this more definitive one
                    plan_id = price_id
            except Exception as e:
                logger.warning(f"Error retrieving Stripe session: {e}, continuing with plan_id")
        
        # Make sure we have at least a plan_id
        if not plan_id:
            # Try to get it from the user's onboarding data
            from onboarding.models import UserOnboarding
            onboarding, _ = UserOnboarding.objects.get_or_create(user=user)
            
            if onboarding.data and onboarding.data.get('selected_plan_id'):
                plan_id = onboarding.data.get('selected_plan_id')
                logger.info(f"Using plan_id from onboarding data: {plan_id}")
            else:
                # Default to Basic plan if nothing found
                plan_id = 'price_1RO3HrLa8vPOEHR78kogds4D'  # Basic Plan
                logger.warning(f"No plan_id found, using default: {plan_id}")

        # Get or create plan
        try:
            plan = Plan.objects.get(stripe_price_id=plan_id)
            logger.info(f"Found existing plan: {plan.name}")
        except Plan.DoesNotExist:
            logger.warning(f"Plan not found for price_id: {plan_id}, creating new one")
            
            # Try to get details from Stripe if possible
            try:
                price_obj = stripe.Price.retrieve(plan_id)
                plan_name = price_obj.get('nickname', f"Plan for {plan_id}")
                price_amount = price_obj.get('unit_amount', 0) / 100 if price_obj.get('unit_amount') else 0
                interval = price_obj.get('recurring', {}).get('interval', 'month')
            except Exception:
                # Use defaults if we can't get Stripe details
                plan_name = f"Plan for {plan_id}"
                price_amount = 0
                interval = "month"
                
            plan = Plan.objects.create(
                name=plan_name,
                slug=f"auto-{plan_id[:8]}",
                stripe_price_id=plan_id,
                price=price_amount,
                interval=interval,
                is_active=True
            )
            logger.info(f"Created new plan: {plan.name}")

        # Create or update subscription
        subscription, created = Subscription.objects.update_or_create(
            user=user,
            defaults={
                'plan': plan,
                'status': 'active',
                'stripe_subscription_id': session_id or f"direct_{timezone.now().timestamp()}",
                'current_period_end': timezone.now() + timezone.timedelta(days=30)
            }
        )
        logger.info(f"{'Created' if created else 'Updated'} subscription for user: {user.email}")

        # Update onboarding status
        from onboarding.models import UserOnboarding
        onboarding, _ = UserOnboarding.objects.get_or_create(user=user)
        onboarding.data = onboarding.data or {}
        onboarding.data.update({
            'payment_step_completed': True,
            'selected_plan_id': plan_id,
        })
        
        if session_id:
            onboarding.data['stripe_session_id'] = session_id
            
        onboarding.is_complete = True
        onboarding.completed_at = timezone.now()
        onboarding.save()
        logger.info(f"Updated onboarding status for user: {user.email}, marked as complete")

        return Response({
            'status': 'completed',
            'onboarding_complete': True,
            'subscription_id': subscription.id
        })

    except Exception as e:
        logger.exception(f"Error in confirm_payment_completion: {e}")
        
        # Try a last-resort emergency subscription creation
        try:
            # Get or create default basic plan
            default_plan, _ = Plan.objects.get_or_create(
                stripe_price_id='price_1RO3HrLa8vPOEHR78kogds4D',  # Basic Plan
                defaults={
                    'name': 'Basic Plan (Emergency)',
                    'slug': 'basic-emergency',
                    'price': 29.00,
                    'interval': 'month',
                    'is_active': True
                }
            )
            
            # Create emergency subscription
            emergency_sub, created = Subscription.objects.update_or_create(
                user=request.user,
                defaults={
                    'plan': default_plan,
                    'status': 'active',
                    'stripe_subscription_id': f"emergency_{timezone.now().timestamp()}",
                    'current_period_end': timezone.now() + timezone.timedelta(days=30)
                }
            )
            
            # Mark onboarding complete
            from onboarding.models import UserOnboarding
            onboarding, _ = UserOnboarding.objects.get_or_create(user=request.user)
            onboarding.data = onboarding.data or {}
            onboarding.data['payment_step_completed'] = True
            onboarding.is_complete = True
            onboarding.completed_at = timezone.now()
            onboarding.save()
            
            logger.info(f"Created emergency subscription for user: {request.user.email}")
            
            return Response({
                'status': 'emergency_completed',
                'onboarding_complete': True,
                'subscription_id': emergency_sub.id,
                'emergency': True,
                'original_error': str(e)
            })
        except Exception as fallback_error:
            logger.exception(f"Even emergency subscription failed: {fallback_error}")
            
            return Response({
                'error': str(e),
                'fallback_error': str(fallback_error)
            }, status=400)