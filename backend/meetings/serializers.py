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
        fields = ['scheduled_at', 'goals', 'duration', 'status', 'title', 'id', 'meeting_url', 'timezone', 'host']
        extra_kwargs = {
            'host': {'required': False},
        }

    def validate_scheduled_at(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("The scheduled time must be in the future.")
        return value

    def validate_duration(self, value):
        if value <= 0:
            raise serializers.ValidationError("Duration must be a positive number.")
        return value
        
    def validate_timezone(self, value):
        # Basic validation - could be enhanced with a list of valid timezones
        if not value:
            return "UTC"
        return value

    def validate(self, data):
        # Create a temporary instance to check for conflicts
        instance = Meeting(**data)
        
        # Get the user from the context
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user = request.user
            
            # Check if this meeting would conflict with existing ones
            if instance.has_conflict(user.id):
                raise serializers.ValidationError(
                    {"scheduled_at": "You already have a meeting scheduled at this time."}
                )
        
        return data

class UpdateMeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = ['status', 'scheduled_at', 'duration', 'timezone']
        extra_kwargs = {
            'scheduled_at': {'required': False},
            'duration': {'required': False},
            'timezone': {'required': False},
        }
        
    def validate(self, data):
        if 'status' in data and data['status'] not in [Meeting.CONFIRMED, Meeting.RESCHEDULED, Meeting.CANCELLED, Meeting.COMPLETED]:
            raise serializers.ValidationError("Invalid status update")
            
        # If rescheduling, check for conflicts
        if 'scheduled_at' in data or 'duration' in data:
            instance = self.instance
            
            # Update instance with new data for validation
            for key, value in data.items():
                setattr(instance, key, value)
            
            # Get the user from the context
            request = self.context.get('request')
            if request and hasattr(request, 'user'):
                user = request.user
                
                # Check if this meeting would conflict with existing ones
                if instance.has_conflict(user.id):
                    raise serializers.ValidationError(
                        {"scheduled_at": "You already have a meeting scheduled at this time."}
                    )
                
        return data