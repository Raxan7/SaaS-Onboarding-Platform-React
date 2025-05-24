# meetings/livekit_utils.py
"""
Utilities for LiveKit integration.
"""
import os
import uuid
import requests
from datetime import datetime, timedelta
from django.conf import settings
from requests.auth import HTTPBasicAuth
from livekit.api import AccessToken

def get_livekit_server_config():
    """
    Get the LiveKit server configuration from environment variables or settings
    
    Returns:
        Tuple of (api_url, api_key, api_secret)
    """
    # First try to get config from environment variables
    api_url = os.environ.get('LIVEKIT_API_URL', getattr(settings, 'LIVEKIT_API_URL', None))
    api_key = os.environ.get('LIVEKIT_API_KEY', getattr(settings, 'LIVEKIT_API_KEY', None))
    api_secret = os.environ.get('LIVEKIT_API_SECRET', getattr(settings, 'LIVEKIT_API_SECRET', None))
    
    if not all([api_url, api_key, api_secret]):
        # For development, use your actual LiveKit Cloud account details
        api_url = "wss://saas-meeting-ks82pn02.livekit.cloud"
        api_key = "API6w9sfv23jgFk" 
        api_secret = "k1YTVVEo1iYAJvJeCXzkbiUK0ZH7z3hwMAVVL1OXbwK"
    
    # Validate that we don't have placeholder values    
    if "your-livekit-instance" in api_url or "example" in api_url:
        raise ValueError(f"Invalid LiveKit server URL: {api_url}. Please configure the actual LiveKit server URL.")
        
    return api_url, api_key, api_secret

import requests
from requests.auth import HTTPBasicAuth

def create_livekit_room(room_name):
    api_url, api_key, api_secret = get_livekit_server_config()
    url = f"{api_url}/rooms"

    payload = {
        "name": room_name,
        "empty_timeout": 300,
        "max_participants": 10,
    }

    try:
        response = requests.post(url, json=payload, auth=HTTPBasicAuth(api_key, api_secret))
        response.raise_for_status()
        room_data = response.json()
        return room_data["name"], f"{api_url}/{room_name}"
    except Exception as e:
        print(f"Failed to create room: {e}")
        return room_name, f"{api_url}/{room_name}"


from livekit.api import AccessToken, VideoGrants

def generate_livekit_token(room_name, user_identity, display_name=None, is_host=False, ttl_minutes=120):
    """
    Generate a LiveKit token using the LiveKit API Python SDK.
    """
    _, api_key, api_secret = get_livekit_server_config()

    grants = VideoGrants(
        room_join=True,
        room=room_name,
        can_publish=True,
        can_subscribe=True,
        can_publish_data=True,
    )

    if is_host:
        grants.room_admin = True
        grants.can_update_metadata = True

    token = AccessToken(api_key, api_secret) \
        .with_identity(str(user_identity)) \
        .with_name(display_name or str(user_identity)) \
        .with_grants(grants) \
        .with_ttl(timedelta(minutes=ttl_minutes))

    return token.to_jwt()


def generate_livekit_meeting_url(room_name=None, meeting_title=None):
    """
    Generate a LiveKit meeting URL for use in the frontend.
    This creates a LiveKit room and returns the URL to join it.
    
    Args:
        room_name: Optional room name (will be sanitized and made unique)
        meeting_title: Optional title to use for the room if no room_name provided
    
    Returns:
        A URL that, when opened with a valid token, will join a LiveKit room
    """
    # Use the meeting title as room name if provided
    if meeting_title and not room_name:
        room_name = meeting_title
    
    # Create the room
    room_name, room_url = create_livekit_room(room_name)
    
    # Return the URL which needs to be used with a token
    return room_url