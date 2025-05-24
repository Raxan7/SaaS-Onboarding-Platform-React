#!/usr/bin/env python3
import jwt
import time
import uuid
from datetime import datetime, timedelta, timezone

def generate_livekit_token():
    """Generate a LiveKit token using PyJWT directly"""
    api_key = "API6w9sfv23jgFk"
    api_secret = "k1YTVVEo1iYAJvJeCXzkbiUK0ZH7z3hwMAVVL1OXbwK"
    room_name = "test-room-" + datetime.now().strftime("%H%M%S")
    user_identity = f"user-{uuid.uuid4().hex[:8]}"
    
    # Create claims manually
    now = int(time.time())
    exp = now + 60 * 60  # 1 hour from now
    
    claims = {
        # Standard JWT claims
        "iss": api_key,        # Issuer - API key
        "nbf": now,            # Not Before
        "exp": exp,            # Expiration Time
        "sub": user_identity,  # Subject (identity)
        "jti": str(uuid.uuid4()),  # JWT ID (unique)
        
        # Custom claims
        "name": f"Test User {user_identity}",  # Display name
        
        # Video grants as expected by LiveKit server
        "video": {
            "room": room_name,
            "roomJoin": True,
            "canPublish": True,
            "canSubscribe": True,
            "canPublishData": True
        }
    }
    
    # Generate the token
    token = jwt.encode(claims, api_secret, algorithm="HS256")
    
    print(f"Generated token for room '{room_name}' and user '{user_identity}':")
    print(f"Token: {token[:20]}...{token[-20:]}")
    print("\nClaims:")
    for key, value in claims.items():
        if key == "video":
            print("  video grants:")
            for k, v in value.items():
                print(f"    {k}: {v}")
        else:
            print(f"  {key}: {value}")
    
    return token, room_name

if __name__ == "__main__":
    print("Generating LiveKit token using PyJWT")
    print("====================================")
    try:
        token, room_name = generate_livekit_token()
        print("\nToken generation successful!")
        print(f"\nTo use this token, you would connect to a LiveKit server with:")
        print(f"  - Room: {room_name}")
        print(f"  - Token: {token}")
    except Exception as e:
        import traceback
        print(f"\nError: {e}")
        traceback.print_exc()
