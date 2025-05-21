#!/usr/bin/env python
# test_google_meet.py
"""
Test script to verify the Google Meet integration
"""
import os
import sys
import django
import webbrowser
import time

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saas_backend.settings')
django.setup()

from meetings.google_meet_utils import generate_google_meet_url, generate_google_meet_url_with_params
from meetings.models import Meeting

def test_url_generation():
    """Test the Google Meet URL generation function"""
    print("Testing Google Meet URL generation...")
    
    # Generate basic URL
    url = generate_google_meet_url()
    print(f"Basic URL: {url}")
    
    # Verify basic URL format
    if url == "https://meet.google.com/new":
        print("  ✅ Basic URL format is correct (direct meeting creation)")
    else:
        print("  ❌ Basic URL format is not as expected")
    
    # Generate URLs with meeting names
    for i in range(3):
        test_name = f"Test Meeting {i+1}"
        url = generate_google_meet_url_with_params(test_name)
        print(f"URL with name '{test_name}': {url}")
        
        # Verify URL format
        if "https://meet.google.com/new" in url and "authuser" in url and "hcn" in url:
            print("  ✅ URL format is correct (contains direct meeting creation with parameters)")
        else:
            print("  ❌ URL format might have issues")
            
        # Check if the meeting name is in the URL
        if test_name in url:
            print(f"  ✅ Meeting name is included in the URL")
        else:
            print("  ⚠️ Could not find meeting name in the URL")
    
    print("✅ URL generation test completed\n")
    
    # Offer to open a URL in browser to test it
    test_url = generate_google_meet_url_with_params("Test Meeting from Script")
    open_browser = input(f"Would you like to test the URL in a browser? (y/n): ")
    if open_browser.lower() == 'y':
        print(f"Opening {test_url} in your browser...")
        print("This should automatically create a new Google Meet session with a pre-filled name!")
        webbrowser.open(test_url)
        time.sleep(2)  # Give the browser a moment to open
        print("If you see a new Google Meet session being created with the name 'Test Meeting from Script', the URL generation is working correctly!")
        print("Note: You may need to be signed into a Google account to create meetings.")
    else:
        print(f"You can manually test this URL: {test_url}")

def test_meeting_model():
    """Test the Meeting model's Google Meet URL generation"""
    print("Testing Meeting model Google Meet integration...")
    
    try:
        # Create a test meeting
        meeting = Meeting(
            title="Test Google Meet Integration",
            scheduled_at="2025-05-22T15:00:00Z",
            duration=30,
            status=Meeting.CONFIRMED
        )
        
        # Generate URL
        url = meeting.generate_google_meet_url()
        print(f"Generated URL: {url}")
        
        # Validate URL
        if "https://meet.google.com/" in url:
            print("✅ Meeting model successfully generates Google Meet URLs")
        else:
            print("❌ Meeting model failed to generate a valid Google Meet URL")
    except Exception as e:
        print(f"❌ Error testing Meeting model: {e}")
    
    print("Meeting model test completed")

if __name__ == "__main__":
    print("=== Google Meet Integration Test ===\n")
    test_url_generation()
    test_meeting_model()
    print("\n=== All tests completed ===")
