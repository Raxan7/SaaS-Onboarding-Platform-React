from django.urls import path
from .views import (
    MeetingListCreateAPIView, 
    MeetingRetrieveUpdateAPIView, 
    ActiveMeetingsAPIView, 
    StartMeetingAPIView,
    EndMeetingAPIView,
    CheckAvailabilityAPIView,
    MeetingLimitsAPIView,
    # LiveKitTokenAPIView,  # Commented out - using Jitsi instead
    JitsiConfigAPIView
)

urlpatterns = [
    path('', MeetingListCreateAPIView.as_view(), name='meeting-list-create'),
    path('<int:pk>/', MeetingRetrieveUpdateAPIView.as_view(), name='meeting-retrieve-update'),
    path('<int:pk>/start/', StartMeetingAPIView.as_view(), name='start-meeting'),
    path('<int:pk>/end/', EndMeetingAPIView.as_view(), name='end-meeting'),
    path('active/', ActiveMeetingsAPIView.as_view(), name='active-meetings'),
    path('check-availability/', CheckAvailabilityAPIView.as_view(), name='check-availability'),
    path('limits/', MeetingLimitsAPIView.as_view(), name='meeting-limits'),
    # Keep LiveKit endpoint for backward compatibility (commented out for now)
    # path('livekit-token/<int:pk>/', LiveKitTokenAPIView.as_view(), name='livekit-token'),
    path('jitsi-config/<int:pk>/', JitsiConfigAPIView.as_view(), name='jitsi-config'),
]