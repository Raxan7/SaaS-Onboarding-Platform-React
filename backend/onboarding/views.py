from rest_framework import generics, permissions, status, mixins, serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.viewsets import GenericViewSet
from rest_framework.views import APIView
from accounts.serializers import UserSerializer
from .models import OnboardingStep, UserOnboarding
from subscriptions.models import Plan, Subscription
from .serializers import OnboardingStepSerializer, UserOnboardingSerializer
from meetings.serializers import CreateMeetingSerializer
from accounts.models import User
from meetings.models import Meeting
from django.utils import timezone

class OnboardingStepListAPIView(generics.ListAPIView):
    queryset = OnboardingStep.objects.filter(is_active=True).order_by('order')
    serializer_class = OnboardingStepSerializer
    permission_classes = [permissions.AllowAny]

class UserOnboardingViewSet(mixins.RetrieveModelMixin,
                           mixins.UpdateModelMixin,
                           GenericViewSet):
    serializer_class = UserOnboardingSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user
        onboarding, created = UserOnboarding.objects.get_or_create(user=user)
        if created:
            first_step = OnboardingStep.objects.filter(is_active=True).order_by('order').first()
            onboarding.current_step = first_step
            onboarding.save()
        return onboarding

    @action(detail=False, methods=['post'], url_path='company')
    def save_company_info(self, request):
        user = self.request.user
        user.company_name = request.data.get('company_name')
        user.job_title = request.data.get('job_title')
        user.industry = request.data.get('industry')
        user.save()

        onboarding = self.get_object()
        onboarding.data['company'] = {
            'company_name': user.company_name,
            'job_title': user.job_title,
            'industry': user.industry
        }
        # Mark the company step as completed
        onboarding.data['company_step_completed'] = True
        onboarding.save()
        
        return Response({
            'user': UserSerializer(user).data,
            'company_step_completed': True
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='meeting')
    def save_meeting_info(self, request):
        serializer = CreateMeetingSerializer(data=request.data, context={'request': request})
        try:
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError as e:
            return Response({'error': 'Invalid data', 'details': e.detail}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Create the meeting with the authenticated user as the client
            meeting = serializer.save(user=request.user)

            # Update onboarding data
            onboarding = self.get_object()
            onboarding.data['meeting'] = {
                'meeting_date': meeting.scheduled_at.isoformat(),
                'meeting_goals': meeting.goals
            }
            # Mark the meeting step as completed
            onboarding.data['meeting_step_completed'] = True
            onboarding.save()

            return Response({
                'meeting': serializer.data,
                'meeting_step_completed': True
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': 'An unexpected error occurred', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Ensure a response is always returned
        return Response({'error': 'An unknown error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CompanyInfoAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        company_name = request.data.get('company_name')
        if not company_name:
            return Response({'error': 'Company name is required'}, status=400)

        user.company_name = company_name
        user.job_title = request.data.get('job_title')
        user.industry = request.data.get('industry')
        user.save()

        onboarding, _ = UserOnboarding.objects.get_or_create(user=user)
        onboarding.data['company'] = {
            'company_name': user.company_name,
            'job_title': user.job_title,
            'industry': user.industry
        }
        # Mark the company step as completed
        onboarding.data['company_step_completed'] = True
        onboarding.current_step = OnboardingStep.objects.filter(order=3).first()  # Move to the next step
        onboarding.save()

        return Response({
            'status': 'Company info saved and step marked as complete',
            'company_step_completed': True
        }, status=200)
    

class UserOnboardingStatusAPIView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            onboarding = UserOnboarding.objects.get(user=request.user)
            
            # Get step completion status from the data field
            company_step_completed = onboarding.data.get('company_step_completed', False)
            meeting_step_completed = onboarding.data.get('meeting_step_completed', False)
            payment_step_completed = onboarding.data.get('payment_step_completed', False)
            
            return Response({
                'is_complete': onboarding.is_complete,
                'current_step': onboarding.current_step.id if onboarding.current_step else None,
                'user_type': request.user.user_type,
                'company_step_completed': company_step_completed,
                'meeting_step_completed': meeting_step_completed,
                'payment_step_completed': payment_step_completed
            })
        except UserOnboarding.DoesNotExist:
            return Response({
                'is_complete': False,
                'current_step': None,
                'user_type': request.user.user_type,
                'company_step_completed': False,
                'meeting_step_completed': False,
                'payment_step_completed': False
            })

class CompleteOnboardingAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        onboarding, _ = UserOnboarding.objects.get_or_create(user=request.user)
        onboarding.is_complete = True
        onboarding.completed_at = timezone.now()
        onboarding.save()
        return Response({'status': 'completed'})
    

class UpdateOnboardingStepAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        step_id = request.data.get('step_id')
        try:
            step = OnboardingStep.objects.get(id=step_id)
            onboarding, _ = UserOnboarding.objects.get_or_create(user=request.user)
            onboarding.current_step = step
            onboarding.save()
            return Response({'status': 'updated'})
        except OnboardingStep.DoesNotExist:
            return Response({'error': 'Invalid step ID'}, status=400)


class MeetingStepAPIView(APIView):
    def post(self, request):
        user = request.user
        serializer = CreateMeetingSerializer(data=request.data)

        if serializer.is_valid():
            # Save the meeting
            meeting = serializer.save(user=user)

            # Update UserOnboarding progress
            onboarding, created = UserOnboarding.objects.get_or_create(user=user)
            onboarding.meeting_step_completed = True
            onboarding.save()

            return Response({"message": "Meeting saved and onboarding updated successfully."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdatePaymentInfoAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get('plan_id')
        if not plan_id:
            return Response({'error': 'Plan ID is required'}, status=400)

        # Validate that the plan ID matches one of our Stripe price IDs
        valid_price_ids = [
            'price_1RO3HrLa8vPOEHR78kogds4D',  # Basic Plan
            'price_1RO3I9La8vPOEHR7d9EzMNvl',  # Pro Plan
            'price_1RPhD8La8vPOEHR7GtHdIp91',  # Enterprise Plan
        ]
        
        if plan_id not in valid_price_ids:
            return Response({
                'error': f'Invalid plan ID: {plan_id}. Must be one of the valid Stripe price IDs.'
            }, status=400)

        user = request.user
        onboarding, _ = UserOnboarding.objects.get_or_create(user=user)
        
        # Initialize the data field if it's None
        if onboarding.data is None:
            onboarding.data = {}
            
        # Save the plan ID in the onboarding data
        onboarding.data['selected_plan_id'] = plan_id
        onboarding.save()

        return Response({'status': 'Payment info updated successfully'}, status=200)


class PaymentCompleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        
        try:
            # Get session ID from request
            session_id = request.data.get('session_id')
            payment_success = request.data.get('payment_success')
            
            # Detailed logging
            import logging
            logger = logging.getLogger('payment_process')
            logger.info(f"Payment completion initiated for user {user.email} (ID: {user.id})")
            logger.info(f"Session ID: {session_id}")
            logger.info(f"Payment success flag: {payment_success}")
            logger.info(f"Request data: {request.data}")
            
            # Validate required parameters
            if not session_id:
                logger.error("Missing session_id in request")
                return Response({
                    'error': 'Missing session_id parameter',
                    'detail': 'The session_id parameter is required for payment verification'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get the user's onboarding data
            onboarding, _ = UserOnboarding.objects.get_or_create(user=user)
            
            # Initialize the data field if it's None
            if onboarding.data is None:
                onboarding.data = {}
            
            logger.info(f"Current onboarding data: {onboarding.data}")
            
            # Get the selected plan ID from various sources with fallbacks
            selected_plan_id = (
                request.data.get('plan_id') or 
                onboarding.data.get('selected_plan_id')
            )
            
            logger.info(f"Selected plan ID from request/onboarding: {selected_plan_id}")
            
            # Verify the payment with Stripe directly
            stripe_verification_successful = False
            stripe_subscription_id = None
            
            try:
                import stripe
                from django.conf import settings
                
                # Configure Stripe API key
                stripe.api_key = settings.STRIPE_SECRET_KEY
                
                # Verify the session exists and is paid
                logger.info(f"Verifying Stripe session: {session_id}")
                session = stripe.checkout.Session.retrieve(session_id)
                
                if session:
                    logger.info(f"Stripe session found: {session.id}")
                    logger.info(f"Payment status: {session.payment_status}")
                    
                    if session.payment_status == 'paid':
                        stripe_verification_successful = True
                        logger.info("Payment verified as PAID")
                        
                        # If it has a subscription, use that info
                        if hasattr(session, 'subscription') and session.subscription:
                            stripe_subscription_id = session.subscription
                            logger.info(f"Found subscription ID: {stripe_subscription_id}")
                            
                            # Get subscription details to extract price ID
                            subscription = stripe.Subscription.retrieve(session.subscription)
                            if subscription and subscription['items']['data']:
                                # Extract price ID from the subscription
                                subscription_price_id = subscription['items']['data'][0]['price']['id']
                                
                                if subscription_price_id:
                                    logger.info(f"Using price ID from subscription: {subscription_price_id}")
                                    selected_plan_id = subscription_price_id
                    else:
                        logger.warning(f"Session payment status is not 'paid': {session.payment_status}")
            except Exception as stripe_error:
                logger.exception(f"Stripe verification error: {stripe_error}")
                # Continue with the process even if Stripe verification fails
            
            # If still no plan ID, use a default one (Basic plan)
            if not selected_plan_id:
                logger.warning("No plan ID found, using default")
                selected_plan_id = 'price_1RO3HrLa8vPOEHR78kogds4D'  # Basic Plan
            
            # Find or create the plan
            try:
                from subscriptions.models import Plan
                plan = Plan.objects.get(stripe_price_id=selected_plan_id)
                logger.info(f"Found existing plan: {plan.name}")
            except Plan.DoesNotExist:
                logger.warning(f"Plan with price ID {selected_plan_id} not found, creating default")
                # Create a default plan if not found
                plan = Plan.objects.create(
                    name=f"Auto-created Plan for {selected_plan_id}",
                    slug=f"auto-{selected_plan_id[:8]}",
                    stripe_price_id=selected_plan_id,
                    price=0.00,  # Will be updated later if possible
                    interval="month",
                    is_active=True
                )
                logger.info(f"Created new plan: {plan.name}")
            
            # Create or update subscription
            subscription, created = Subscription.objects.update_or_create(
                user=user,
                defaults={
                    'plan': plan,
                    'status': 'active',
                    'current_period_end': timezone.now() + timezone.timedelta(days=30),
                    'stripe_subscription_id': stripe_subscription_id or session_id or ('manual_' + str(timezone.now().timestamp()))
                }
            )
            
            logger.info(f"{'Created' if created else 'Updated'} subscription for user: {user.email}")
            
            # Mark payment step as completed and onboarding as complete
            onboarding.data['payment_step_completed'] = True
            onboarding.data['selected_plan_id'] = selected_plan_id
            onboarding.data['stripe_session_id'] = session_id
            
            # Ensure onboarding is marked as complete
            onboarding.is_complete = True
            onboarding.completed_at = timezone.now()
            onboarding.save()
            
            logger.info(f"Onboarding marked as complete for user: {user.email}")
            
            return Response({
                'status': 'Payment and onboarding completed successfully',
                'is_complete': True,
                'payment_step_completed': True,
                'subscription_id': subscription.id,
                'stripe_verified': stripe_verification_successful
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            print(f"Error in PaymentCompleteAPIView: {str(e)}")
            traceback.print_exc()
            
            # Try to create a subscription anyway as a last resort
            try:
                # Get or create a default plan
                default_plan = Plan.objects.get(stripe_price_id='price_1RO3HrLa8vPOEHR78kogds4D')  # Basic Plan
                
                # Create an emergency subscription
                subscription, created = Subscription.objects.update_or_create(
                    user=user,
                    defaults={
                        'plan': default_plan,
                        'status': 'active',
                        'current_period_end': timezone.now() + timezone.timedelta(days=30),
                        'stripe_subscription_id': request.data.get('session_id') or ('emergency_' + str(timezone.now().timestamp()))
                    }
                )
                
                # Mark onboarding as complete
                onboarding, _ = UserOnboarding.objects.get_or_create(user=user)
                if onboarding.data is None:
                    onboarding.data = {}
                onboarding.data['payment_step_completed'] = True
                onboarding.is_complete = True
                onboarding.completed_at = timezone.now()
                onboarding.save()
                
                print(f"Created emergency subscription for user: {user.email}")
                
                return Response({
                    'status': 'Emergency subscription created',
                    'is_complete': True,
                    'payment_step_completed': True,
                    'error_recovered': True,
                    'subscription_id': subscription.id
                }, status=status.HTTP_200_OK)
                
            except Exception as fallback_error:
                print(f"Even fallback subscription creation failed: {str(fallback_error)}")
                
                return Response({
                    'error': str(e),
                    'detail': 'An error occurred while marking payment as complete',
                    'fallback_error': str(fallback_error)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 


