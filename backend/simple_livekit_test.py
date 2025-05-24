#!/usr/bin/env python
"""
Simple test for the LiveKit token generation using the livekit.api module directly.
"""
import json
import base64
from datetime import timedelta
from livekit.api import AccessToken, VideoGrants

def generate_token():
    """Generate a LiveKit token and print its contents"""
    # Test values - replace with actual values in production
    api_key = "API6w9sfv23jgFk"
    api_secret = "k1YTVVEo1iYAJvJeCXzkbiUK0ZH7z3hwMAVVL1OXbwK"
    room_name = "test-room"
    user_identity = "test-user"
    display_name = "Test User"
    
    # Create the token
    token = AccessToken(api_key, api_secret)
    
    # Set the identity
    token = token.with_identity(user_identity)
    
    # Set the name
    token = token.with_name(display_name)
    
    # Create VideoGrants object properly
    video_grant = VideoGrants()
    video_grant.room = room_name
    video_grant.room_join = True
    video_grant.can_publish = True
    video_grant.can_subscribe = True
    video_grant.can_publish_data = True
    
    # Convert the VideoGrants object to a dict for with_grants
    video_dict = {"video": video_grant.__dict__}
    
    # Set expiration
    token = token.with_ttl(timedelta(hours=24))
    
    # Generate JWT
    jwt_token = token.to_jwt()
    print(f"Generated token: {jwt_token[:20]}...{jwt_token[-20:]}")
    
    # Decode token to inspect
    parts = jwt_token.split('.')
    if len(parts) == 3:
        # Decode the payload
        payload = parts[1]
        # Add padding if needed
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
        token = generate_token()
        print("\nTest successful!")
    except Exception as e:
        import traceback
        print(f"\nError: {e}")
        traceback.print_exc()
