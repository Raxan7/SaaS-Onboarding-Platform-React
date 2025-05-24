#!/usr/bin/env python
"""
Simple test for the LiveKit token generation using the livekit.api module directly.
"""
import json
import base64
from datetime import timedelta
from livekit.api import AccessToken, VideoGrants

def test_token_generation():
    # Test values - replace with your actual values
    api_key = "API6w9sfv23jgFk"
    api_secret = "k1YTVVEo1iYAJvJeCXzkbiUK0ZH7z3hwMAVVL1OXbwK"
    room_name = "test-room"
    user_identity = "test-user"
    display_name = "Test User"
    
    # Create VideoGrants object
    grants = VideoGrants()
    grants.room = room_name
    grants.room_join = True
    grants.can_publish = True
    grants.can_subscribe = True
    grants.can_publish_data = True

    # Create and configure token
    token = AccessToken(api_key, api_secret)
    token = token.with_identity(user_identity)
    token = token.with_name(display_name)
    token = token.with_grants(grants)
    token = token.with_ttl(timedelta(hours=1))

    # Generate JWT
    jwt_token = token.to_jwt()
    print(f"Generated token: {jwt_token[:20]}...{jwt_token[-20:]}")
    
    # Decode and inspect payload
    parts = jwt_token.split('.')
    if len(parts) == 3:
        payload = parts[1]
        padding = '=' * (4 - len(payload) % 4) if len(payload) % 4 else ''
        try:
            decoded = base64.urlsafe_b64decode(payload + padding)
            claims = json.loads(decoded)
            print("\nToken claims:")
            print(json.dumps(claims, indent=2))
        except Exception as e:
            print(f"Error decoding token: {e}")
    
    return jwt_token

if __name__ == "__main__":
    print("Testing LiveKit token generation")
    print("===============================")
    try:
        token = test_token_generation()
        print("\nTest successful!")
    except Exception as e:
        import traceback
        print(f"\nError: {e}")
        traceback.print_exc()
