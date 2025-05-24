#!/bin/bash
# Script to migrate the database for LiveKit integration

# Navigate to the backend directory
cd "$(dirname "$0")"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

echo "=== Applying database migrations for LiveKit integration ==="

# Run migrations
python manage.py migrate

# Check for any meeting URL inconsistencies
echo -e "\n=== Checking meeting URLs ==="
python manage.py shell <<EOF
from meetings.models import Meeting
from meetings.livekit_utils import generate_livekit_meeting_url

# Find meetings with empty or potentially invalid URLs
invalid_meetings = Meeting.objects.filter(status__in=['confirmed', 'rescheduled']).filter(
    models.Q(meeting_url__isnull=True) | 
    models.Q(meeting_url='') | 
    ~models.Q(meeting_url__contains='livekit')
)

print(f"Found {invalid_meetings.count()} meetings that might need URL updates")

# Optional: uncomment to automatically update meeting URLs
# for meeting in invalid_meetings:
#     meeting.meeting_url = generate_livekit_meeting_url(meeting_title=meeting.title)
#     meeting.save(update_fields=['meeting_url'])
#     print(f"Updated meeting {meeting.id} with new URL")
EOF

echo -e "\n=== Migration complete ==="
echo "Note: To automatically update existing meeting URLs, edit this script"
echo "      and uncomment the update code in the Python section"
