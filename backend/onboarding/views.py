from rest_framework import generics, permissions, status, mixins, serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.viewsets import GenericViewSet
from rest_framework.views import APIView
from accounts.serializers import UserSerializer
from .models import OnboardingStep, UserOnboarding
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

        user = request.user
        onboarding, _ = UserOnboarding.objects.get_or_create(user=user)
        
        # Initialize the data field if it's None
        if onboarding.data is None:
            onboarding.data = {}
            
        # Save the plan ID in the onboarding data
        onboarding.data['selected_plan_id'] = plan_id
        onboarding.save()

        return Response({'status': 'Payment info updated successfully'}, status=200)