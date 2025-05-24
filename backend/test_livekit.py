#!/usr/bin/env python
"""
Test script for LiveKit integration.
This script tests the creation of LiveKit rooms and token generation.
"""

import os
import sys
import django

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set the DJANGO_SETTINGS_MODULE environment variable
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "saas_backend.settings")
django.setup()

from meetings.livekit_utils import create_livekit_room, generate_livekit_token, get_livekit_server_config

def test_livekit_config():
    """Test that LiveKit server configuration can be retrieved."""
    api_url, api_key, api_secret = get_livekit_server_config()
    print(f"LiveKit configuration test:")
    print(f"API URL: {api_url}")
    print(f"API Key: {'*' * len(api_key) if api_key else 'Not set'}")
    print(f"API Secret: {'*' * len(api_secret) if api_secret else 'Not set'}")
    print()
    return all([api_url, api_key, api_secret])

def test_room_creation():
    """Test creating a LiveKit room."""
    room_name = "test-room"
    try:
        room_name, room_url = create_livekit_room(room_name)
        print(f"Room creation test:")
        print(f"Room name: {room_name}")
        print(f"Room URL: {room_url}")
        print(f"Status: Success")
        print()
        return True
    except Exception as e:
        print(f"Room creation test:")
        print(f"Error: {e}")
        print(f"Status: Failed")
        print()
        return False

def test_token_generation():
    """Test token generation for a LiveKit room."""
    room_name = "test-room"
    user_identity = "test-user"
    try:
        token = generate_livekit_token(room_name, user_identity, display_name="Test User", is_host=True)
        token_short = f"{token[:20]}...{token[-20:]}" if len(token) > 40 else token
        print(f"Token generation test:")
        print(f"Token: {token_short}")
        print(f"Status: Success")
        print()
        return True
    except Exception as e:
        print(f"Token generation test:")
        print(f"Error: {e}")
        print(f"Status: Failed")
        print()
        return False

if __name__ == "__main__":
    print("LiveKit Integration Test")
    print("=======================")
    
    config_success = test_livekit_config()
    room_success = test_room_creation()
    token_success = test_token_generation()
    
    if all([config_success, room_success, token_success]):
        print("All LiveKit tests PASSED!")
        sys.exit(0)
    else:
        print("Some LiveKit tests FAILED!")
        sys.exit(1)
