# meetings/jitsi_utils.py
"""
Utilities for Jitsi Meet integration.
"""
import os
import uuid
import jwt
import time
from datetime import datetime, timedelta
from django.conf import settings


def get_jitsi_config():
    """
    Get Jitsi configuration from environment variables or settings.
    Returns default public Jitsi Meet server if no custom configuration is provided.
    """
    # Use environment variables if available, otherwise fallback to public Jitsi
    jitsi_domain = getattr(settings, 'JITSI_DOMAIN', 'meet.jit.si')
    jitsi_app_id = getattr(settings, 'JITSI_APP_ID', None)
    jitsi_private_key = getattr(settings, 'JITSI_PRIVATE_KEY', None)
    
    return {
        'domain': jitsi_domain,
        'app_id': jitsi_app_id,
        'private_key': jitsi_private_key
    }


def generate_room_name(meeting_title=None, meeting_id=None):
    """
    Generate a unique Jitsi room name.
    
    Args:
        meeting_title: Optional title to include in room name
        meeting_id: Optional meeting ID to include
    
    Returns:
        A unique room name for Jitsi
    """
    if meeting_title:
        # Sanitize the title for use in URLs
        sanitized_title = ''.join(c for c in meeting_title if c.isalnum() or c in ('-', '_'))
        base_name = sanitized_title[:20]  # Limit length
    else:
        base_name = 'Meeting'
    
    # Add unique identifier
    unique_id = str(uuid.uuid4())[:8]
    
    if meeting_id:
        room_name = f"{base_name}-{meeting_id}-{unique_id}"
    else:
        room_name = f"{base_name}-{unique_id}"
    
    return room_name


def generate_jitsi_jwt(room_name, user_name, user_email=None, is_moderator=False):
    """
    Generate a JWT token for Jitsi Meet authentication (if using secured Jitsi instance).
    
    Args:
        room_name: The room name to join
        user_name: Display name for the user
        user_email: User's email (optional)
        is_moderator: Whether the user should have moderator privileges
    
    Returns:
        JWT token string or None if no authentication is configured
    """
    config = get_jitsi_config()
    
    if not config['app_id'] or not config['private_key']:
        # No authentication configured, return None
        return None
    
    now = datetime.utcnow()
    payload = {
        'iss': config['app_id'],
        'aud': 'jitsi',
        'exp': now + timedelta(hours=2),  # Token expires in 2 hours
        'nbf': now - timedelta(minutes=5),  # Token valid from 5 minutes ago
        'sub': config['domain'],
        'room': room_name,
        'context': {
            'user': {
                'name': user_name,
                'email': user_email,
                'moderator': str(is_moderator).lower()
            }
        }
    }
    
    try:
        token = jwt.encode(payload, config['private_key'], algorithm='RS256')
        return token
    except Exception as e:
        print(f"Error generating Jitsi JWT: {e}")
        return None


def generate_jitsi_meeting_url(meeting_title=None, meeting_id=None):
    """
    Generate a Jitsi Meet URL for a meeting.
    
    Args:
        meeting_title: Optional title to use for the room name
        meeting_id: Optional meeting ID
    
    Returns:
        A complete Jitsi Meet URL
    """
    config = get_jitsi_config()
    room_name = generate_room_name(meeting_title, meeting_id)
    
    # Construct the Jitsi Meet URL
    jitsi_url = f"https://{config['domain']}/{room_name}"
    
    return jitsi_url


def get_jitsi_config_for_frontend(room_name, user_name, user_email=None, is_moderator=False):
    """
    Get Jitsi configuration that can be safely sent to the frontend.
    
    Args:
        room_name: The room name to join
        user_name: Display name for the user  
        user_email: User's email (optional)
        is_moderator: Whether the user should have moderator privileges
    
    Returns:
        Dictionary with Jitsi configuration for frontend
    """
    config = get_jitsi_config()
    
    frontend_config = {
        'domain': config['domain'],
        'room': room_name,
        'userInfo': {
            'displayName': user_name,
            'email': user_email
        },
        'configOverwrite': {
            'startWithAudioMuted': False,
            'startWithVideoMuted': False,
            'enableWelcomePage': False,
            'enableClosePage': False,
            'prejoinPageEnabled': False,
            'disableModeratorIndicator': not is_moderator,
            'enableEmailInStats': False
        },
        'interfaceConfigOverwrite': {
            'SHOW_JITSI_WATERMARK': False,
            'SHOW_WATERMARK_FOR_GUESTS': False,
            'SHOW_BRAND_WATERMARK': False,
            'BRAND_WATERMARK_LINK': '',
            'SHOW_POWERED_BY': False,
            'DISPLAY_WELCOME_PAGE_CONTENT': False,
            'DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT': False,
            'APP_NAME': 'SaaS Platform Meeting',
            'NATIVE_APP_NAME': 'SaaS Platform Meeting',
            'PROVIDER_NAME': 'SaaS Platform',
        }
    }
    
    # Add JWT token if authentication is configured
    jwt_token = generate_jitsi_jwt(room_name, user_name, user_email, is_moderator)
    if jwt_token:
        frontend_config['jwt'] = jwt_token
    
    return frontend_config


def extract_room_name_from_url(jitsi_url):
    """
    Extract room name from a Jitsi Meet URL.
    
    Args:
        jitsi_url: Complete Jitsi Meet URL
    
    Returns:
        Room name string
    """
    if not jitsi_url:
        return None
    
    try:
        # Remove protocol and domain, get the room name
        parts = jitsi_url.replace('https://', '').replace('http://', '').split('/')
        if len(parts) >= 2:
            return parts[-1]  # Last part is the room name
        return None
    except:
        return None