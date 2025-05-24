# meetings/models.py
from django.db import models
from accounts.models import User
from django.utils import timezone

class Meeting(models.Model):
    PENDING = 'pending'
    CONFIRMED = 'confirmed'
    RESCHEDULED = 'rescheduled'
    CANCELLED = 'cancelled'
    COMPLETED = 'completed'
    STARTED = 'started'
    EXPIRED = 'expired'
    
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (CONFIRMED, 'Confirmed'),
        (RESCHEDULED, 'Rescheduled'),
        (CANCELLED, 'Cancelled'),
        (COMPLETED, 'Completed'),
        (STARTED, 'Started'),
        (EXPIRED, 'Expired'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_meetings')
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name='host_meetings', null=True, blank=True)
    title = models.CharField(max_length=255, default='Consultation Meeting')
    description = models.TextField(blank=True)
    scheduled_at = models.DateTimeField()
    duration = models.PositiveIntegerField(default=30)  # in minutes
    timezone = models.CharField(max_length=50, default='UTC')  # Store the timezone information
    meeting_url = models.URLField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    is_qualified = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    goals = models.TextField(blank=True)

    class Meta:
        ordering = ['-scheduled_at']

    def __str__(self):
        return f"{self.user.email} - {self.scheduled_at}"

    def save(self, *args, **kwargs):
        if not self.meeting_url and (self.status == self.CONFIRMED or self.status == self.RESCHEDULED):
            self.meeting_url = self.generate_livekit_url()
        super().save(*args, **kwargs)
    
    def generate_livekit_url(self):
        from .livekit_utils import generate_livekit_meeting_url
        # Use the meeting title (or a default) to create a recognizable room
        meeting_name = self.title or f"Meeting-{self.id}"
        return generate_livekit_meeting_url(meeting_title=meeting_name)
    
    @property
    def is_active(self):
        now = timezone.now()
        meeting_end = self.scheduled_at + timezone.timedelta(minutes=self.duration)
        return (self.status == self.CONFIRMED or self.status == self.RESCHEDULED) and now >= self.scheduled_at and now <= meeting_end

    @property
    def is_confirmed(self):
        return self.status == self.CONFIRMED
    
    def mark_as_expired_if_needed(self):
        """
        Check if this meeting should be marked as expired.
        Returns True if the meeting was marked as expired, False otherwise.
        """
        if self.status == self.PENDING:
            now = timezone.now()
            if now > self.scheduled_at:
                self.status = self.EXPIRED
                self.save()
                return True
        return False
    
    @classmethod
    def mark_expired_meetings(cls):
        """
        Mark all pending meetings that have passed their scheduled time as expired.
        Returns the number of meetings that were marked as expired.
        """
        now = timezone.now()
        expired_meetings = cls.objects.filter(
            status=cls.PENDING,
            scheduled_at__lt=now
        )
        
        count = expired_meetings.count()
        if count > 0:
            expired_meetings.update(status=cls.EXPIRED)
        
        return count
        
    def has_conflict(self, user_id):
        """
        Check if this meeting time conflicts with any existing meetings for the user
        """
        from django.db.models import Q, F, ExpressionWrapper, DateTimeField, DurationField
        
        # Exclude cancelled and expired meetings and this meeting if it's being updated
        query = ~Q(status=self.CANCELLED) & ~Q(status=self.EXPIRED) & ~Q(id=self.id if self.id else -1)
        
        # Find meetings for the same user or host
        query &= Q(user_id=user_id) | Q(host_id=user_id)
        
        # Calculate start and end times for our meeting
        meeting_start = self.scheduled_at
        meeting_end = meeting_start + timezone.timedelta(minutes=self.duration)
        
        # Use a different approach to filter overlapping meetings
        overlapping_meetings = Meeting.objects.filter(query).filter(
            # Get all meetings where:
            # Either the meeting starts during our time slot
            Q(scheduled_at__lt=meeting_end, scheduled_at__gte=meeting_start) |
            # Or the meeting ends during our time slot
            Q(scheduled_at__lt=meeting_start, 
              scheduled_at__gt=meeting_start - timezone.timedelta(minutes=720))  # Looking back up to 12 hours
        )
        
        # For the meetings that might end during our slot, we need to check duration
        for meeting in overlapping_meetings:
            other_meeting_end = meeting.scheduled_at + timezone.timedelta(minutes=meeting.duration)
            if other_meeting_end > meeting_start:
                return True
                
        return False
