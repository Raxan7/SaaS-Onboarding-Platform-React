print("Testing LiveKit imports...")

# Try importing from livekit
print("\nTrying to import from livekit:")
try:
    import livekit
    print(f"Success! livekit is installed at: {livekit.__file__}")
    print(f"Available attributes: {[a for a in dir(livekit) if not a.startswith('_')]}")
except ImportError as e:
    print(f"Error: {e}")

# Try importing from livekit_api
print("\nTrying to import from livekit_api:")
try:
    import livekit_api
    print(f"Success! livekit_api is installed at: {livekit_api.__file__}")
    print(f"Available attributes: {[a for a in dir(livekit_api) if not a.startswith('_')]}")
except ImportError as e:
    print(f"Error: {e}")

# Try importing AccessToken from various places
print("\nTrying to import AccessToken:")
try:
    from livekit_api import AccessToken
    print("Success! AccessToken found in livekit_api")
except ImportError as e:
    print(f"Not found in livekit_api: {e}")

try:
    from livekit import AccessToken
    print("Success! AccessToken found in livekit")
except ImportError as e:
    print(f"Not found in livekit: {e}")

# Try importing RoomServiceClient from various places
print("\nTrying to import RoomServiceClient:")
try:
    from livekit_api import RoomServiceClient
    print("Success! RoomServiceClient found in livekit_api")
except ImportError as e:
    print(f"Not found in livekit_api: {e}")

try:
    from livekit_api.api import RoomServiceClient
    print("Success! RoomServiceClient found in livekit_api.api")
except ImportError as e:
    print(f"Not found in livekit_api.api: {e}")

try:
    from livekit import RoomServiceClient
    print("Success! RoomServiceClient found in livekit")
except ImportError as e:
    print(f"Not found in livekit: {e}")

# Try importing VideoGrant from various places
print("\nTrying to import VideoGrant:")
try:
    from livekit_api import VideoGrant
    print("Success! VideoGrant found in livekit_api")
except ImportError as e:
    print(f"Not found in livekit_api: {e}")

try:
    from livekit import VideoGrant
    print("Success! VideoGrant found in livekit")
except ImportError as e:
    print(f"Not found in livekit: {e}")
