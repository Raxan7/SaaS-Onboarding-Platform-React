#!/usr/bin/env python
# migrate_to_google_meet.py
"""
Migration script to update all Jitsi meeting URLs to Google Meet URLs
"""
import os
import sys
import django
import re

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saas_backend.settings')
django.setup()

from meetings.models import Meeting
from meetings.google_meet_utils import generate_google_meet_url_with_params

def migrate_to_google_meet():
    """
    Update all meeting URLs from Jitsi to Google Meet
    """
    # Jitsi regex pattern
    jitsi_pattern = re.compile(r'https://meet\.jit\.si/')
    
    # Also check for old-style Google Meet URLs that might not work
    old_google_meet_pattern = re.compile(r'https://meet\.google\.com/[a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{3}$')
    
    # Get all meetings with Jitsi URLs
    jitsi_meetings = Meeting.objects.filter(meeting_url__contains='jit.si')
    jitsi_count = jitsi_meetings.count()
    
    # Get all meetings with potential old Google Meet URLs that didn't work
    old_google_meetings = Meeting.objects.filter(meeting_url__contains='meet.google.com')
    old_google_count = 0
    for meeting in old_google_meetings:
        if old_google_meet_pattern.match(meeting.meeting_url):
            old_google_count += 1
    
    total_count = jitsi_count + old_google_count
    
    print(f"Found {jitsi_count} meetings with Jitsi URLs to migrate")
    print(f"Found {old_google_count} meetings with old Google Meet URLs to update")
    print(f"Total meetings to update: {total_count}")
    
    # Process Jitsi meetings
    for meeting in jitsi_meetings:
        old_url = meeting.meeting_url
        if jitsi_pattern.match(old_url):
            # Extract meeting name if possible
            meeting_name = meeting.title or f"Meeting-{meeting.id}"
            # Generate a new Google Meet URL with the meeting name
            new_url = generate_google_meet_url_with_params(meeting_name)
            meeting.meeting_url = new_url
            meeting.save()
            print(f"Updated Jitsi meeting {meeting.id}: {old_url} -> {new_url}")
    
    # Process old Google Meet meetings
    for meeting in old_google_meetings:
        old_url = meeting.meeting_url
        if old_google_meet_pattern.match(old_url):
            # Extract meeting name if possible
            meeting_name = meeting.title or f"Meeting-{meeting.id}"
            # Generate a new Google Meet URL with the meeting name
            new_url = generate_google_meet_url_with_params(meeting_name)
            meeting.meeting_url = new_url
            meeting.save()
            print(f"Updated old Google Meet URL for meeting {meeting.id}: {old_url} -> {new_url}")
    
    print("Migration completed")

if __name__ == "__main__":
    migrate_to_google_meet()
