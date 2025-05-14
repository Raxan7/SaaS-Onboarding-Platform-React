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
    
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (CONFIRMED, 'Confirmed'),
        (RESCHEDULED, 'Rescheduled'),
        (CANCELLED, 'Cancelled'),
        (COMPLETED, 'Completed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_meetings')
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name='host_meetings', null=True, blank=True)
    title = models.CharField(max_length=255, default='Consultation Meeting')
    description = models.TextField(blank=True)
    scheduled_at = models.DateTimeField()
    duration = models.PositiveIntegerField(default=30)  # in minutes
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
        if not self.meeting_url and self.status == self.CONFIRMED:
            self.meeting_url = self.generate_jitsi_url()
        super().save(*args, **kwargs)
    
    def generate_jitsi_url(self):
        import uuid
        room_name = f"meeting-{uuid.uuid4()}"
        return f"https://meet.jit.si/{room_name}"
    
    @property
    def is_active(self):
        now = timezone.now()
        meeting_end = self.scheduled_at + timezone.timedelta(minutes=self.duration)
        return self.status == self.CONFIRMED and now >= self.scheduled_at and now <= meeting_end

    @property
    def is_confirmed(self):
        return self.status == self.CONFIRMED
