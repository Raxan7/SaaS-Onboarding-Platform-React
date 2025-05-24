# LiveKit Integration Guide

This guide explains how to set up and configure LiveKit for video conferencing in the SaaS Onboarding Platform.

## What is LiveKit?

LiveKit is an open-source platform for building real-time audio and video experiences. It's a self-hosted or cloud-hosted WebRTC infrastructure that provides high-quality, scalable real-time communication.

## Why LiveKit?

We've migrated from Google Meet to LiveKit for the following benefits:
- Full customization of the video interface
- Better controls over meeting access
- Cost-effective scaling
- Self-hosting option for complete privacy
- Advanced features like recording, transcription, and virtual backgrounds

## Setup Instructions

### 1. Environment Configuration

Add the following environment variables to your `.env` file:

```
LIVEKIT_API_URL=wss://your-livekit-instance.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
```

You can get these values by:
- Creating a LiveKit Cloud account at https://livekit.io/
- Creating a new project in the LiveKit Cloud dashboard
- Getting your API keys from the project settings

### 2. Self-hosting (Optional)

If you prefer to self-host LiveKit:
1. Follow the LiveKit server installation guide: https://docs.livekit.io/server/deployment/
2. Update your environment variables to point to your self-hosted instance

### 3. Frontend Configuration

The frontend is already configured to use LiveKit components. The key components are:
- `src/components/meetings/LiveKitRoom.tsx` - The main video conferencing component
- Token generation happens via the `/api/meetings/livekit-token/<meeting_id>/` endpoint

## Usage

When a meeting is scheduled or started:
1. A LiveKit room is created with a unique name
2. Users are granted access tokens with appropriate permissions
3. The LiveKit video interface is embedded in the application

## Troubleshooting

Common issues:
- If video isn't connecting, check the LiveKit API URL and ensure it's accessible
- If permission errors occur, verify that the API key and secret are correct
- For connection issues, ensure port 443 is open for WebRTC traffic

## Additional Resources

- [LiveKit Documentation](https://docs.livekit.io/)
- [LiveKit Components React](https://github.com/livekit/components-js)
- [LiveKit Python SDK](https://github.com/livekit/python-sdks)
