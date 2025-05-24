#!/usr/bin/env python
"""
Test script for LiveKit token generation.
Tests the token format and validity according to LiveKit documentation.
"""

import os
import sys
import json
import base64
from datetime import datetime

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set the DJANGO_SETTINGS_MODULE environment variable
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "saas_backend.settings")

import django
django.setup()

from meetings.livekit_utils import generate_livekit_token

def decode_jwt_without_verification(token):
    """
    Decode a JWT token without signature verification.
    This is only for testing the structure.
    """
    # JWT format is header.payload.signature
    parts = token.split('.')
    if len(parts) != 3:
        return None
    
    # Decode the payload
    payload = parts[1]
    # Add padding if needed
    padding = '=' * (4 - len(payload) % 4) if len(payload) % 4 else ''
    try:
        decoded = base64.urlsafe_b64decode(payload + padding)
        return json.loads(decoded)
    except Exception as e:
        print(f"Error decoding token: {e}")
        return None

def test_token_generation():
    """Test the generation of LiveKit tokens with various parameters."""
    test_cases = [
        {
            "name": "Basic participant token",
            "params": {
                "room_name": "test-room",
                "user_identity": "user-123",
                "display_name": "Test User",
                "is_host": False
            }
        },
        {
            "name": "Host token with admin rights",
            "params": {
                "room_name": "admin-room",
                "user_identity": "admin-456",
                "display_name": "Admin User",
                "is_host": True
            }
        },
        {
            "name": "Short-lived token",
            "params": {
                "room_name": "temp-room",
                "user_identity": "temp-user",
                "display_name": "Temporary User",
                "is_host": False,
                "ttl_minutes": 5
            }
        }
    ]
    
    print("LiveKit Token Generation Test")
    print("===========================")
    
    for case in test_cases:
        print(f"\nTest Case: {case['name']}")
        
        try:
            # Generate token
            token = generate_livekit_token(**case['params'])
            
            # Print token info
            print(f"Token: {token[:20]}...{token[-20:]}")
            
            # Decode and analyze token
            decoded = decode_jwt_without_verification(token)
            if decoded:
                print("\nDecoded token claims:")
                
                # Video grant details
                if 'video' in decoded:
                    video_grant = decoded['video']
                    print(f"  Room: {video_grant.get('room')}")
                    print(f"  Room join: {video_grant.get('roomJoin')}")
                    print(f"  Can publish: {video_grant.get('canPublish')}")
                    print(f"  Can subscribe: {video_grant.get('canSubscribe')}")
                    print(f"  Is admin: {video_grant.get('roomAdmin')}")
                
                # Check expiration
                if 'exp' in decoded:
                    exp_timestamp = decoded['exp']
                    exp_date = datetime.fromtimestamp(exp_timestamp)
                    now = datetime.now()
                    minutes_valid = (exp_date - now).total_seconds() / 60
                    print(f"  Expires: {exp_date} (valid for {minutes_valid:.1f} minutes)")
                
                # Check user identity
                if 'sub' in decoded:
                    print(f"  User identity: {decoded['sub']}")
                
                # Check user name
                if 'name' in decoded:
                    print(f"  Display name: {decoded['name']}")
                
                print("  Status: Valid")
            else:
                print("  Failed to decode token")
                
        except Exception as e:
            print(f"  Error: {e}")
            print("  Status: Failed")
    
    print("\nTest completed!")

if __name__ == "__main__":
    try:
        print("Starting test token generation...")
        test_token_generation()
    except Exception as e:
        import traceback
        print(f"Error in test script: {e}")
        traceback.print_exc()
