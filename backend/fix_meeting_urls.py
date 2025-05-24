#!/usr/bin/env python
"""
Fixes the meeting URLs to use the correct LiveKit server URL.
"""
import os
import django

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "saas_backend.settings")
django.setup()

from meetings.models import Meeting

def fix_meeting_urls():
    """Fix meeting URLs that use the placeholder LiveKit server URL."""
    # Get the correct server URL from settings
    from django.conf import settings
    server_url = getattr(settings, 'LIVEKIT_API_URL', "wss://saas-meeting-ks82pn02.livekit.cloud")
    
    # Find meetings with old URL format
    old_meetings = Meeting.objects.filter(meeting_url__contains='your-livekit-instance')
    print(f"Found {old_meetings.count()} meetings with placeholder URLs")
    
    # Update each meeting URL
    count = 0
    for meeting in old_meetings:
        # Extract the room name (last part of the URL)
        room_name = meeting.meeting_url.split('/')[-1]
        
        # Sanitize room name to avoid spaces
        room_name = room_name.lower().replace(' ', '-')
        
        # Build the new URL with the correct server
        new_url = f"{server_url}/{room_name}"
        
        print(f"Meeting #{meeting.id}: {meeting.meeting_url} -> {new_url}")
        
        # Update the meeting
        meeting.meeting_url = new_url
        meeting.save()
        count += 1
    
    print(f"Updated {count} meeting URLs")

if __name__ == "__main__":
    fix_meeting_urls()