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
from django.core.cache import cache
import time

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
        # Mark expired meetings before returning the queryset
        Meeting.mark_expired_meetings()
        
        return Meeting.objects.filter(user=self.request.user).order_by('-scheduled_at')

class MeetingListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = CreateMeetingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Mark expired meetings before returning the queryset
        Meeting.mark_expired_meetings()
        
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
        # Mark expired meetings before returning the queryset
        Meeting.mark_expired_meetings()
        
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
        # Mark expired meetings before returning the queryset
        Meeting.mark_expired_meetings()
        
        now = timezone.now()
        user = self.request.user
        
        # Include:
        # 1. Upcoming meetings that are confirmed or rescheduled (next 24 hours)
        # 2. Recent meetings that are confirmed, rescheduled, or started (last hour)
        return Meeting.objects.filter(
            Q(user=user) | Q(host=user),
            Q(status=Meeting.CONFIRMED) | Q(status=Meeting.RESCHEDULED) | Q(status=Meeting.STARTED),
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
        
        # COMMENTED OUT - USING JITSI INSTEAD OF LIVEKIT
        # Always generate a fresh meeting URL when a host starts a meeting, even if one exists
        # from .livekit_utils import generate_livekit_meeting_url
        # meeting_name = meeting.title or f"Meeting-{meeting.id}"
        # 
        # # Include the host name in the meeting to make it more identifiable
        # host_name = user.get_full_name() if user.get_full_name() else user.email
        # full_meeting_name = f"{meeting_name} - Hosted by {host_name}"
        # 
        # meeting.meeting_url = generate_livekit_meeting_url(meeting_title=full_meeting_name)
        
        # Using Jitsi Meet instead - meeting URL is generated automatically in model.save()
        
        # Set meeting status to started
        meeting.status = Meeting.STARTED
        
        # Set the current user as the host when starting the meeting
        serializer.save(host=user)

class EndMeetingAPIView(generics.UpdateAPIView):
    queryset = Meeting.objects.all()
    serializer_class = UpdateMeetingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        meeting = serializer.instance
        user = self.request.user
        
        # Check if user has permission to end this meeting
        # Either the host or the client (meeting creator) can end the meeting
        if user != meeting.host and user != meeting.user:
            raise PermissionDenied("You don't have permission to end this meeting")
        
        # Only allow ending meetings that are currently started
        if meeting.status != Meeting.STARTED:
            raise PermissionDenied("This meeting is not currently active")
        
        # Set meeting status to completed
        meeting.status = Meeting.COMPLETED
        
        # Clear cached tokens for this meeting - COMMENTED OUT FOR JITSI
        # from django.core.cache import cache
        # # Get all users who might have tokens for this meeting
        # user_ids = [meeting.user.id if meeting.user else None, meeting.host.id if meeting.host else None]
        # for uid in user_ids:
        #     if uid:
        #         cache_key = f"livekit_token_{uid}_{meeting.id}"
        #         cache.delete(cache_key)
        
        serializer.save()

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


# COMMENTED OUT - USING JITSI INSTEAD OF LIVEKIT
# class LiveKitTokenAPIView(APIView):
#     """
#     API endpoint to generate LiveKit room tokens for meetings
#     """
#     permission_classes = [permissions.IsAuthenticated]
#     
#     def get(self, request, pk):
#         """
#         Get LiveKit token for a specific meeting
#         """
#         try:
#             # Find the meeting
#             meeting = Meeting.objects.get(pk=pk)
#             
#             # Check if the user has access to this meeting
#             if request.user != meeting.user and request.user != meeting.host:
#                 return Response(
#                     {"error": "You don't have permission to access this meeting"}, 
#                     status=status.HTTP_403_FORBIDDEN
#                 )
#                 
#             # Check if the meeting has been started by the host
#             if meeting.status != Meeting.STARTED and request.user != meeting.host:
#                 return Response(
#                     {"error": "This meeting hasn't started yet. Please wait for the host to start the meeting."}, 
#                     status=status.HTTP_403_FORBIDDEN
#                 )
#             
#             # Get or extract the room name from the meeting URL
#             # The meeting URL format is expected to be {server_url}/{room_name}
#             meeting_url = meeting.meeting_url
#             room_name = meeting_url.split('/')[-1] if meeting_url else None
#             
#             if not room_name:
#                 return Response(
#                     {"error": "Meeting room has not been created yet"}, 
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
#             
#             # Generate a LiveKit token
#             from .livekit_utils import generate_livekit_token
#             
#             # Determine if the user is a host
#             is_host = request.user == meeting.host
#             
#             # Get user display name
#             user = request.user
#             display_name = user.get_full_name() if user.get_full_name() else user.email
#             
#             # Generate a stable identity for the user
#             stable_identity = str(user.id)
#             
#             # Create a cache key unique to this user and meeting
#             cache_key = f"livekit_token_{user.id}_{meeting.id}"
#             
#             # Check if we have a cached token
#             cached_token_data = cache.get(cache_key)
#             if cached_token_data:
#                 print(f"Using cached token for user {user.id} in meeting {meeting.id}")
#                 token = cached_token_data.get('token')
#                 # Check if the token is still valid (with 5 minutes buffer)
#                 expiry_time = cached_token_data.get('expiry')
#                 current_time = int(time.time())
#                 
#                 if token and expiry_time and current_time < (expiry_time - 300):  # 5 minute buffer
#                     # Return the cached token
#                     print(f"Cached token is still valid, expires in {expiry_time - current_time} seconds")
#                     return Response(cached_token_data)
#                 else:
#                     print("Cached token expired or expiring soon, generating new token")
#             
#             # Generate a new token
#             token = generate_livekit_token(
#                 room_name=room_name,
#                 user_identity=stable_identity,
#                 display_name=display_name,
#                 is_host=is_host
#             )
#             
#             # Parse the expiry time from the token (JWT exp claim)
#             import jwt
#             try:
#                 decoded = jwt.decode(token, options={"verify_signature": False})
#                 expiry_time = decoded.get('exp')
#             except:
#                 # Default to 2 hours from now if we can't parse
#                 expiry_time = int(time.time()) + 7200  # 2 hours
#             
#             # Parse the server URL from the meeting URL to help the frontend
#             server_url = '/'.join(meeting_url.split('/')[:-1])
#             
#             # Validate server URL (sanity check)
#             if 'your-livekit-instance' in server_url or 'example' in server_url:
#                 return Response(
#                     {"error": "Invalid LiveKit server configuration. Please contact an administrator."}, 
#                     status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                 )
#             
#             # Prepare response data
#             response_data = {
#                 'token': token,
#                 'room': room_name,
#                 'server_url': server_url,
#                 'is_host': is_host,
#                 'user_name': display_name,
#                 'expiry': expiry_time
#             }
#             
#             # Cache the token data
#             cache_key = f"livekit_token_{user.id}_{meeting.id}"
#             # Cache for the token validity period minus 10 minutes
#             cache_duration = expiry_time - int(time.time()) - 600
#             if cache_duration > 0:
#                 cache.set(cache_key, response_data, cache_duration)
#                 print(f"Cached token for {cache_duration} seconds")
#             
#             return Response(response_data)
#             
#         except Meeting.DoesNotExist:
#             return Response(
#                 {"error": "Meeting not found"}, 
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             return Response(
#                 {"error": f"Error generating LiveKit token: {str(e)}"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

class JitsiConfigAPIView(APIView):
    """
    API endpoint to get Jitsi configuration for meetings
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        """
        Get Jitsi configuration for a specific meeting
        """
        try:
            # Find the meeting
            meeting = Meeting.objects.get(pk=pk)
            
            # Check if the user has access to this meeting
            if request.user != meeting.user and request.user != meeting.host:
                return Response(
                    {"error": "You don't have permission to access this meeting"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
                
            # Check if the meeting is accessible
            # Allow access if: 
            # 1. Meeting is STARTED (for all participants)
            # 2. Meeting is CONFIRMED/RESCHEDULED and user is the host (so host can start it)
            # 3. Meeting is CONFIRMED/RESCHEDULED and user is participant and meeting is within time window
            accessible_statuses = [Meeting.STARTED, Meeting.CONFIRMED, Meeting.RESCHEDULED]
            if meeting.status not in accessible_statuses:
                return Response(
                    {"error": f"This meeting is {meeting.get_status_display().lower()} and cannot be accessed."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Enhanced access control logic
            now = timezone.now()
            meeting_start = meeting.scheduled_at
            meeting_end = meeting_start + timezone.timedelta(minutes=meeting.duration)
            is_within_meeting_window = meeting_start <= now <= meeting_end
            
            if meeting.status == Meeting.STARTED:
                # If meeting is started, everyone with access can join
                pass
            elif request.user == meeting.host:
                # Hosts can always access confirmed/rescheduled meetings to start them
                pass
            elif meeting.status in [Meeting.CONFIRMED, Meeting.RESCHEDULED] and is_within_meeting_window:
                # Participants can access confirmed meetings during the meeting window
                pass
            else:
                return Response(
                    {"error": "This meeting hasn't started yet. Please wait for the host to start the meeting."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Extract room name from meeting URL
            from .jitsi_utils import extract_room_name_from_url, get_jitsi_config_for_frontend
            room_name = extract_room_name_from_url(meeting.meeting_url)
            
            if not room_name:
                return Response(
                    {"error": "Invalid meeting URL"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Determine if the user is a moderator (host)
            is_moderator = request.user == meeting.host
            
            # Get user display name
            user = request.user
            display_name = user.get_full_name() if user.get_full_name() else user.email
            
            # Get Jitsi configuration
            jitsi_config = get_jitsi_config_for_frontend(
                room_name=room_name,
                user_name=display_name,
                user_email=user.email,
                is_moderator=is_moderator
            )
            
            # Add meeting information
            response_data = {
                'jitsi_config': jitsi_config,
                'meeting_url': meeting.meeting_url,
                'is_moderator': is_moderator,
                'user_name': display_name,
                'meeting_title': meeting.title
            }
            
            return Response(response_data)
            
        except Meeting.DoesNotExist:
            return Response(
                {"error": "Meeting not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Error getting Jitsi configuration: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )