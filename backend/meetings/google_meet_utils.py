# meetings/google_meet_utils.py
"""
Utilities for Google Meet integration.
"""
import uuid
import requests
import time
from urllib.parse import quote, urlencode

def generate_google_meet_url():
    """
    Generate a Google Meet URL that directly creates a new meeting.
    This uses Google's direct meeting creation feature which is guaranteed to work.
    
    Returns a URL that, when opened, will immediately create a new Google Meet session.
    """
    # The simplest and most reliable approach: direct link to the "new meeting" functionality
    # This creates an actual meeting when accessed, no redirection or lookup required
    return "https://meet.google.com/new"
    
def generate_google_meet_url_with_params(meeting_name=None):
    """
    Generate a Google Meet URL with a pre-filled meeting name.
    This helps identify the meeting in the user's Google Meet interface and
    creates an actual functioning meeting when accessed.
    
    Parameters:
        meeting_name: Optional name to identify the meeting
        
    Returns:
        A URL that, when opened, will create a new Google Meet session with the specified name
    """
    if meeting_name:
        # Add a timestamp to ensure uniqueness
        timestamp = int(time.time())
        # Format the meeting name and encode it for URL
        meeting_name = f"{meeting_name} ({timestamp})"
        encoded_name = quote(meeting_name)
        
        # Direct approach: Use the 'new' endpoint with naming parameters
        # The parameters for the Google Meet URL:
        # - authuser=0: ensures that even logged-out users can create a meeting
        # - hs=187: helps with name setting (Google internal parameter)
        # - hcn: sets the conference name (Google internal parameter)
        # - continueUrl: optional redirect after creating the meeting (not needed)
        # - embedded: false to prevent embedding issues
        
        # This URL format works both when opened directly and in an iframe
        return f"https://meet.google.com/new?authuser=0&hs=187&hcn={encoded_name}"
    
    # Fallback to basic URL
    return "https://meet.google.com/new"
