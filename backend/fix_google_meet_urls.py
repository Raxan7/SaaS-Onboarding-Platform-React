#!/usr/bin/env python
# fix_google_meet_urls.py
"""
Script to update all existing Google Meet URLs to use the direct meeting creation format
that will actually create functioning meetings when accessed.
"""
import os
import sys
import django
import re
from datetime import datetime

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saas_backend.settings')
django.setup()

from meetings.models import Meeting
from meetings.google_meet_utils import generate_google_meet_url_with_params

def fix_google_meet_urls():
    """
    Find all Google Meet URLs and update them to the direct meeting creation format
    that will actually create functioning meetings when accessed.
    """
    # Filter for meetings that have Google Meet URLs
    google_meet_meetings = Meeting.objects.filter(meeting_url__contains='meet.google.com')
    count = google_meet_meetings.count()
    
    print(f"Found {count} meetings with Google Meet URLs")
    
    # Patterns to identify different types of Google Meet URLs
    old_direct_pattern = re.compile(r'https://meet\.google\.com/[a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{3}')
    lookup_pattern = re.compile(r'https://meet\.google\.com/lookup/')
    new_endpoint_with_params_pattern = re.compile(r'https://meet\.google\.com/new\?')
    new_endpoint_pattern = re.compile(r'https://meet\.google\.com/new$')
    
    # Counters for reporting
    updated_count = 0
    already_correct_count = 0
    
    # Process all meetings
    for meeting in google_meet_meetings:
        old_url = meeting.meeting_url
        
        # Check if the URL is already using the direct new endpoint with parameters
        if new_endpoint_with_params_pattern.match(old_url):
            already_correct_count += 1
            continue
            
        # Extract meeting name
        meeting_name = meeting.title or f"Meeting-{meeting.id}"
        
        # Add host information if available
        if meeting.host:
            host_name = meeting.host.get_full_name() if meeting.host.get_full_name() else meeting.host.email
            meeting_name = f"{meeting_name} - Hosted by {host_name}"
        
        # Generate a new direct Google Meet URL with the meeting name
        new_url = generate_google_meet_url_with_params(meeting_name)
        meeting.meeting_url = new_url
        meeting.save()
        
        print(f"Updated meeting {meeting.id}: {old_url} -> {new_url}")
        updated_count += 1
    
    print(f"Update completed: {updated_count} URLs updated, {already_correct_count} URLs already correct")
    
    # Create a backup log
    with open(f"google_meet_url_update_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log", "w") as f:
        f.write(f"Google Meet URL Update\n")
        f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Total meetings processed: {count}\n")
        f.write(f"URLs updated: {updated_count}\n")
        f.write(f"URLs already correct: {already_correct_count}\n")

if __name__ == "__main__":
    print("Fixing Google Meet URLs...")
    fix_google_meet_urls()
    print("Done")
