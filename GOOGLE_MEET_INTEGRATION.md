# Google Meet Integration

This document outlines how Google Meet is integrated into the SaaS Onboarding Platform.

## Overview

The platform uses Google Meet for video conferencing in meetings between hosts and clients. Google Meet was chosen for its:

- Reliability and enterprise-grade quality
- Widespread familiarity among users
- No additional installation requirements
- Browser-based usage with no download required
- Good iframe embedding support

## Problem Solved

The previous implementation generated URLs that looked like Google Meet links (`https://meet.google.com/xxx-xxxx-xxx`) but didn't connect to active meetings. The updated implementation ensures that when a URL is generated and accessed, it creates an actual Google Meet session.

## Integration Details

### Backend Implementation

1. **URL Generation**: 
   - Meeting URLs are generated using the direct meeting creation endpoint: `https://meet.google.com/new`
   - Parameters are added to pre-fill the meeting name: `?authuser=0&hs=187&hcn=MeetingName`
   - Located in `backend/meetings/google_meet_utils.py`

2. **Meeting Model**: 
   - The `Meeting` model automatically creates a Google Meet URL when a meeting is confirmed
   - The URL is stored in the `meeting_url` field
   - Meeting title and host information are included in the URL for better identification

3. **URL Creation Strategy**:
   - We use Google's direct meeting creation feature to ensure working meetings
   - When accessed, the URL automatically creates a new Google Meet session
   - No API key is required for this basic URL generation

### Frontend Implementation

1. **GoogleMeetFrame Component**:
   - Located in `frontend/src/components/meetings/GoogleMeetFrame.tsx`
   - Detects Google Meet creation URLs and opens them in a new window
   - Provides user feedback during the meeting creation process
   - Validates URL format and handles different Google Meet endpoints

2. **ActiveMeeting Component**:
   - Embeds the GoogleMeetFrame component
   - Provides additional meeting controls and information

## How It Works

1. **Meeting URL Generation**:
   - When a host starts a meeting, the `StartMeetingAPIView` generates a URL with meeting details
   - The URL includes the meeting title and host name for easy identification
   - A timestamp is added to ensure uniqueness

2. **Meeting Access Flow**:
   - When a user clicks on the meeting link, the frontend detects it's a Google Meet creation URL
   - The user is presented with options to open the meeting in an embedded frame or a new browser tab
   - The meeting name is pre-filled based on the URL parameters
   - No automatic pop-ups are created; the user controls how they want to access the meeting

3. **Meeting Duration**:
   - Standard Google Meet limitations apply
   - No time limits for 1:1 meetings

## Testing

Use the `test_google_meet.py` script to test the URL generation:

```bash
python test_google_meet.py
```

This will:
1. Generate various Google Meet URLs with different parameters
2. Verify the URL format is correct
3. Optionally open a test URL in the browser to confirm it creates a meeting

## Troubleshooting

If you encounter issues with Google Meet URLs:

1. **URLs don't create active meetings**:
   - Ensure the user is signed into a Google account
   - Check that URLs follow the format: `https://meet.google.com/new?authuser=0&hs=187&hcn=...`
   - Run `python backend/fix_google_meet_urls.py` to update any old-format URLs

2. **Migration from Jitsi**:
   - Run `python backend/migrate_to_google_meet.py` to convert any Jitsi URLs to Google Meet

3. **Iframe Issues**:
   - Google Meet creation works best in a dedicated browser tab
   - Use the "Open Google Meet in New Tab" button for optimal experience
   - Ensure your browser allows camera and microphone access
   - No pop-ups will be automatically triggered; users control how meetings are opened

## Limitations

- Users must have a Google account to create meetings
- The meeting name parameter is unofficial and may change in Google's implementation
- Multiple meetings with the same name will appear distinctly due to the timestamp appended
