# meetings/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import Meeting
from accounts.serializers import UserSerializer


class MeetingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    host = UserSerializer(read_only=True)
    
    class Meta:
        model = Meeting
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'meeting_url')

class CreateMeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = ['scheduled_at', 'goals', 'duration', 'status', 'title', 'id', 'meeting_url']

    def validate_scheduled_at(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("The scheduled time must be in the future.")
        return value

    def validate_duration(self, value):
        if value <= 0:
            raise serializers.ValidationError("Duration must be a positive number.")
        return value

class UpdateMeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = ['status']
        
    def validate(self, data):
        if 'status' in data and data['status'] not in [Meeting.CONFIRMED, Meeting.RESCHEDULED, Meeting.CANCELLED]:
            raise serializers.ValidationError("Invalid status update")
        return data