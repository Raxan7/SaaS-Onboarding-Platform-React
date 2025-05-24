import pkgutil
import importlib
import sys
import os

def print_module_info(module_name):
    try:
        module = importlib.import_module(module_name)
        print(f"\nModule: {module_name}")
        print(f"Directory: {os.path.dirname(module.__file__)}")
        print("Contents:")
        for attr in dir(module):
            if not attr.startswith('_'):  # Skip private attributes
                print(f"  - {attr}")
    except ImportError as e:
        print(f"Could not import {module_name}: {e}")

print("Searching for LiveKit-related modules...")
modules = []

for finder, name, ispkg in pkgutil.iter_modules():
    if "livekit" in name.lower():
        modules.append(name)
        print(f"Found module: {name}")

for module_name in modules:
    print_module_info(module_name)

specific_modules = ['livekit', 'livekit_api', 'pylivekit']
for module_name in specific_modules:
    if module_name not in modules:
        print_module_info(module_name)

# Try importing from livekit_api directly
try:
    import livekit_api
    print("\nContents of livekit_api:")
    for obj_name in dir(livekit_api):
        if not obj_name.startswith('_'):
            print(f"  - {obj_name}")
    
    # Look for room service client
    if hasattr(livekit_api, 'api'):
        print("\nContents of livekit_api.api:")
        for obj_name in dir(livekit_api.api):
            if not obj_name.startswith('_'):
                print(f"  - {obj_name}")
            
            # Try to find the room service client
            if 'room' in obj_name.lower():
                obj = getattr(livekit_api.api, obj_name)
                print(f"\nFound potential room service: {obj_name}")
                print(f"Type: {type(obj)}")
                print(f"Contents: {dir(obj)}")
except ImportError as e:
    print(f"Could not import livekit_api: {e}")

# Check for jwt and token functionality
try:
    print("\nLooking for token related classes:")
    for module_name in sys.modules.keys():
        if 'livekit' in module_name.lower() and 'token' in module_name.lower():
            print(f"Found module: {module_name}")
            module = sys.modules[module_name]
            for attr in dir(module):
                if 'token' in attr.lower() or 'grant' in attr.lower():
                    print(f"  - {attr}")
except Exception as e:
    print(f"Error looking for tokens: {e}")

try:
    from livekit_api import AccessToken, VideoGrant
    print("\nFound AccessToken and VideoGrant in livekit_api")
except ImportError:
    try:
        from livekit import AccessToken, VideoGrant
        print("\nFound AccessToken and VideoGrant in livekit")
    except ImportError as e:
        print(f"Could not import AccessToken and VideoGrant: {e}")

try:
    from livekit_api import RoomServiceClient
    print("\nFound RoomServiceClient in livekit_api")
except ImportError:
    try:
        from livekit_api.api.room_service_client import RoomServiceClient
        print("\nFound RoomServiceClient in livekit_api.api.room_service_client")
    except ImportError as e:
        print(f"Could not import RoomServiceClient: {e}")

# Check the installation location
try:
    import livekit
    print(f"\nlivekit is installed at: {livekit.__file__}")
except ImportError as e:
    print(f"Could not import livekit: {e}")

try:
    import livekit_api
    print(f"livekit_api is installed at: {livekit_api.__file__}")
except ImportError as e:
    print(f"Could not import livekit_api: {e}")
