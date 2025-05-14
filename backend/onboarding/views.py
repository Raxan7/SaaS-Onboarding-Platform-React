from rest_framework import generics, permissions, status, mixins
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
        onboarding.save()
        
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)

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
            onboarding.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
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
        onboarding.current_step = OnboardingStep.objects.filter(order=3).first()  # Move to the next step
        onboarding.save()

        return Response({'status': 'Company info saved and step marked as complete'}, status=200)
    

class UserOnboardingStatusAPIView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            onboarding = UserOnboarding.objects.get(user=request.user)
            return Response({
                'is_complete': onboarding.is_complete,
                'current_step': onboarding.current_step.id if onboarding.current_step else None,
                'user_type': request.user.user_type
            })
        except UserOnboarding.DoesNotExist:
            return Response({
                'is_complete': False,
                'current_step': None,
                'user_type': request.user.user_type
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