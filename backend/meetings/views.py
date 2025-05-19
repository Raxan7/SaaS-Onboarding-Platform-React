from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Meeting
from .serializers import MeetingSerializer, CreateMeetingSerializer, UpdateMeetingSerializer
from django.utils import timezone
from django.db.models import Q
from .utils import can_create_meeting, get_meeting_limits
from rest_framework.views import APIView

class MeetingCreateAPIView(generics.CreateAPIView):
    queryset = Meeting.objects.all()
    serializer_class = CreateMeetingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        can_create, limit, current_count, remaining = can_create_meeting(user)
        
        if not can_create:
            raise PermissionDenied(f"You have reached your monthly meeting limit ({limit} meetings). Upgrade your plan to schedule more meetings.")
        
        # For clients, create meeting with no host - host will be assigned when they confirm
        serializer.save(user=user)

class UserMeetingsAPIView(generics.ListAPIView):
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Meeting.objects.filter(user=self.request.user).order_by('-scheduled_at')

class MeetingListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = CreateMeetingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'host':
            return Meeting.objects.all().order_by('-scheduled_at')
        return Meeting.objects.filter(user=user).order_by('-scheduled_at')

    def perform_create(self, serializer):
        user = self.request.user
        can_create, limit, current_count, remaining = can_create_meeting(user)
        
        if not can_create:
            raise PermissionDenied(f"You have reached your monthly meeting limit ({limit} meetings). Upgrade your plan to schedule more meetings.")
        
        # Always create meeting with the user who requested it
        # Host will be assigned later when a host confirms the meeting
        serializer.save(user=user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Add any additional context needed for validation
        return context

class MeetingRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset = Meeting.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'PUT':
            return UpdateMeetingSerializer
        return MeetingSerializer

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'host':
            return Meeting.objects.all()
        return Meeting.objects.filter(user=user)

    def perform_update(self, serializer):
        meeting = serializer.instance
        user = self.request.user

        # If a host confirms the meeting, set the host field to the current user
        if user.user_type == 'host' and self.request.data.get('status') == Meeting.CONFIRMED:
            serializer.save(host=user)
        else:
            serializer.save()

class ActiveMeetingsAPIView(generics.ListAPIView):
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        now = timezone.now()
        user = self.request.user
        
        # Include:
        # 1. Upcoming meetings that are confirmed or rescheduled (next 24 hours)
        # 2. Recent meetings that are confirmed or rescheduled (last hour)
        return Meeting.objects.filter(
            Q(user=user) | Q(host=user),
            Q(status=Meeting.CONFIRMED) | Q(status=Meeting.RESCHEDULED),
            Q(
                # Upcoming meetings in the next 24 hours
                Q(scheduled_at__gt=now, scheduled_at__lte=now + timezone.timedelta(hours=24)) |
                # Recent meetings in the last hour
                Q(scheduled_at__lte=now, scheduled_at__gte=now - timezone.timedelta(minutes=60))
            )
        ).order_by('scheduled_at')[:5]  # Limit to 5 most relevant meetings


class StartMeetingAPIView(generics.UpdateAPIView):
    queryset = Meeting.objects.all()
    serializer_class = UpdateMeetingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        meeting = serializer.instance
        user = self.request.user
        
        if user.user_type != 'host':
            raise PermissionDenied("Only hosts can start meetings")
        
        if not meeting.meeting_url:
            import uuid
            meeting.meeting_url = f"https://meet.jit.si/meeting-{uuid.uuid4()}"
        
        if meeting.status != Meeting.CONFIRMED and meeting.status != Meeting.RESCHEDULED:
            meeting.status = Meeting.CONFIRMED
        
        # Set the current user as the host when starting the meeting
        serializer.save(host=user)

class CheckAvailabilityAPIView(generics.GenericAPIView):
    """
    API endpoint to check if a time slot is available for scheduling a meeting
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        scheduled_at = request.data.get('scheduled_at')
        duration = request.data.get('duration', 30)
        timezone_str = request.data.get('timezone', 'UTC')
        
        if not scheduled_at:
            return Response(
                {"error": "scheduled_at is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Create a temporary meeting object to check conflicts
        temp_meeting = Meeting(
            scheduled_at=scheduled_at,
            duration=duration,
            timezone=timezone_str,
            user=request.user
        )
        
        has_conflict = temp_meeting.has_conflict(request.user.id)
        
        return Response({
            "available": not has_conflict,
            "message": "Time slot is available" if not has_conflict else "You already have a meeting at this time"
        })


class MeetingLimitsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Get the user's meeting limits and current usage
        """
        user = request.user
        limit, current_count, is_unlimited = get_meeting_limits(user)
        
        # Get subscription info
        subscription = None
        try:
            subscription = user.subscription_set.filter(status='active').first()
        except:
            pass
        
        plan_name = "Free"
        if subscription:
            plan_name = subscription.plan.name
        
        remaining = "Unlimited" if is_unlimited else max(0, limit - current_count)
        
        return Response({
            'limit': "Unlimited" if is_unlimited else limit,
            'current_count': current_count,
            'remaining': remaining,
            'is_unlimited': is_unlimited,
            'can_create': is_unlimited or current_count < limit,
            'plan_name': plan_name
        })