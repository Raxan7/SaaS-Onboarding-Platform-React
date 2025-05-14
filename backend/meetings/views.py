from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Meeting
from .serializers import MeetingSerializer, CreateMeetingSerializer, UpdateMeetingSerializer
from django.utils import timezone
from django.db.models import Q

class MeetingCreateAPIView(generics.CreateAPIView):
    queryset = Meeting.objects.all()
    serializer_class = CreateMeetingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

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
        if self.request.user.user_type == 'client':
            serializer.save(user=self.request.user)
        else:
            serializer.save(host=self.request.user)

class MeetingRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset = Meeting.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'PUT':
            return UpdateMeetingSerializer
        return MeetingSerializer

    def get_queryset(self):
        print("User Type:", self.request.user.user_type)
        user = self.request.user
        if user.user_type == 'host':
            return Meeting.objects.all()
        return Meeting.objects.filter(user=user)

    def perform_update(self, serializer):
        meeting = serializer.instance
        user = self.request.user

        # If the host confirms the meeting, set the host and generate a unique meeting URL
        if self.request.data.get('status') == 'confirmed' and user.user_type == 'host':
            meeting.host = user
            if not meeting.meeting_url:
                import uuid
                meeting.meeting_url = f"https://meet.jit.si/meeting-{uuid.uuid4()}"

        serializer.save()

class ActiveMeetingsAPIView(generics.ListAPIView):
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        now = timezone.now()
        user = self.request.user
        return Meeting.objects.filter(
            Q(user=user) | Q(host=user),
            status=Meeting.CONFIRMED,
            scheduled_at__lte=now,
            scheduled_at__gte=now - timezone.timedelta(minutes=60)  # Show meetings that started in last hour
        ).order_by('-scheduled_at')


class StartMeetingAPIView(generics.UpdateAPIView):
    queryset = Meeting.objects.all()
    serializer_class = UpdateMeetingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        meeting = serializer.instance
        if self.request.user.user_type != 'host':
            raise PermissionDenied("Only hosts can start meetings")
        
        if not meeting.meeting_url:
            import uuid
            meeting.meeting_url = f"https://meet.jit.si/meeting-{uuid.uuid4()}"
        
        if meeting.status != Meeting.CONFIRMED:
            meeting.status = Meeting.CONFIRMED
        
        serializer.save()