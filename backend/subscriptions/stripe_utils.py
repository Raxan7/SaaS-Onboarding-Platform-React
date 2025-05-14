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
            success_url=settings.FRONTEND_URL + '/onboarding/success?session_id={CHECKOUT_SESSION_ID}',
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
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        return HttpResponse(status=400)

    # Handle webhook events
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        # Handle successful payment
        # Update your database here
        
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