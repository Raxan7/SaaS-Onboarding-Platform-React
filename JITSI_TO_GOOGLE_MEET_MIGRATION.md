# Migrating from Jitsi to Google Meet

This guide provides steps for migrating from Jitsi to Google Meet in the SaaS Onboarding Platform.

## Migration Steps

1. **Run Migration Script**

   Run the provided migration script to convert all existing Jitsi meeting URLs to Google Meet:

   ```bash
   cd /home/saidi/Projects/HighEndProjects/SaasPlatform/saas-onboarding-platform/backend
   python migrate_to_google_meet.py
   ```

2. **Fix Any Malformed URLs**

   If needed, run the URL fix script:

   ```bash
   python fix_google_meet_urls.py
   ```

3. **Verify Integration**

   Run the test script to verify that Google Meet integration is working:

   ```bash
   python test_google_meet.py
   ```

## What Changed

The migration makes the following changes:

1. **Backend Changes**:
   - Created `meetings/google_meet_utils.py` for generating proper Google Meet URLs
   - Modified the Meeting model to use Google Meet instead of Jitsi
   - Updated the StartMeetingAPIView to use Google Meet URLs

2. **Frontend Changes**:
   - Added a new `GoogleMeetFrame` component for better Google Meet embedding
   - Updated `ActiveMeeting` and `MeetingsList` to use the new component
   - Improved error handling for meeting URLs

## Why Google Meet?

Google Meet was chosen as a replacement for Jitsi because it offers:

1. **Reliability**: Enterprise-grade video conferencing without server setup
2. **Familiarity**: Most users are already familiar with Google Meet
3. **Simplicity**: No API keys or complex integrations required
4. **Compatibility**: Works well across browsers and devices
5. **Features**: Professional features like screen sharing, chat, and more

## Troubleshooting

If you encounter any issues:

1. **URL Format Issues**: Check that meeting URLs follow the format `https://meet.google.com/xxx-xxxx-xxx`
2. **Iframe Not Loading**: Try opening the meeting in a new window
3. **Meeting Access**: Make sure users are signed into their Google accounts

For additional help, refer to the [Google Meet Integration](./GOOGLE_MEET_INTEGRATION.md) documentation.
