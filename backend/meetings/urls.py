from django.urls import path
from .views import (
    MeetingListCreateAPIView, 
    MeetingRetrieveUpdateAPIView, 
    ActiveMeetingsAPIView, 
    StartMeetingAPIView,
    EndMeetingAPIView,
    CheckAvailabilityAPIView,
    MeetingLimitsAPIView,
    LiveKitTokenAPIView
)

urlpatterns = [
    path('', MeetingListCreateAPIView.as_view(), name='meeting-list-create'),
    path('<int:pk>/', MeetingRetrieveUpdateAPIView.as_view(), name='meeting-retrieve-update'),
    path('<int:pk>/start/', StartMeetingAPIView.as_view(), name='start-meeting'),
    path('<int:pk>/end/', EndMeetingAPIView.as_view(), name='end-meeting'),
    path('active/', ActiveMeetingsAPIView.as_view(), name='active-meetings'),
    path('check-availability/', CheckAvailabilityAPIView.as_view(), name='check-availability'),
    path('limits/', MeetingLimitsAPIView.as_view(), name='meeting-limits'),
    path('livekit-token/<int:pk>/', LiveKitTokenAPIView.as_view(), name='livekit-token'),
]