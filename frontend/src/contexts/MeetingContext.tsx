import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Meeting } from '../types/meeting';
import { useApiClient } from '../utils/apiClient';

interface MeetingContextType {
  meetings: Meeting[];
  loading: boolean;
  error: string | null;
  fetchMeetings: () => Promise<void>;
  createMeeting: (meetingData: any) => Promise<boolean>;
  cancelMeeting: (meetingId: number) => Promise<boolean>;
  rescheduleMeeting: (meetingId: number, newTime: string, timezone: string) => Promise<boolean>;
  checkTimeSlotAvailability: (scheduledAt: string, duration: number, timezone: string) => Promise<boolean>;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const useMeetings = (): MeetingContextType => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeetings must be used within a MeetingProvider');
  }
  return context;
};

interface MeetingProviderProps {
  children: ReactNode;
}

export const MeetingProvider: React.FC<MeetingProviderProps> = ({ children }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api/meetings/');
      setMeetings(response);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const createMeeting = async (meetingData: any): Promise<boolean> => {
    try {
      setError(null);
      
      // Check for availability first
      const isAvailable = await checkTimeSlotAvailability(
        meetingData.scheduled_at,
        meetingData.duration,
        meetingData.timezone
      );
      
      if (!isAvailable) {
        setError('You already have a meeting scheduled at this time');
        return false;
      }
      
      const response = await apiClient.post('/api/meetings/', meetingData);
      
      // Add the new meeting to the list
      setMeetings([...meetings, response]);
      
      return true;
    } catch (err: any) {
      console.error('Error creating meeting:', err);
      setError(err.message || 'Failed to create meeting');
      return false;
    }
  };

  const cancelMeeting = async (meetingId: number): Promise<boolean> => {
    try {
      setError(null);
      const response = await apiClient.put(`/api/meetings/${meetingId}/`, {
        status: 'cancelled'
      });
      
      // Update the meeting in the list
      setMeetings(meetings.map(m => (m.id === meetingId ? response : m)));
      
      return true;
    } catch (err: any) {
      console.error('Error cancelling meeting:', err);
      setError(err.message || 'Failed to cancel meeting');
      return false;
    }
  };

  const rescheduleMeeting = async (
    meetingId: number,
    newTime: string,
    timezone: string
  ): Promise<boolean> => {
    try {
      setError(null);
      
      // Get the meeting to reschedule
      const meeting = meetings.find(m => m.id === meetingId);
      if (!meeting) {
        setError('Meeting not found');
        return false;
      }
      
      // Check if the new time slot is available
      const isAvailable = await checkTimeSlotAvailability(
        newTime,
        meeting.duration,
        timezone
      );
      
      if (!isAvailable) {
        setError('You already have a meeting scheduled at this time');
        return false;
      }
      
      const response = await apiClient.put(`/api/meetings/${meetingId}/`, {
        scheduled_at: newTime,
        timezone,
        status: 'rescheduled'
      });
      
      // Update the meeting in the list
      setMeetings(meetings.map(m => (m.id === meetingId ? response : m)));
      
      return true;
    } catch (err: any) {
      console.error('Error rescheduling meeting:', err);
      setError(err.message || 'Failed to reschedule meeting');
      return false;
    }
  };

  const checkTimeSlotAvailability = async (
    scheduledAt: string,
    duration: number,
    timezone: string
  ): Promise<boolean> => {
    try {
      const response = await apiClient.post('/api/meetings/check-availability/', {
        scheduled_at: scheduledAt,
        duration,
        timezone
      });
      
      return response.available;
    } catch (err) {
      console.error('Error checking time slot availability:', err);
      // Default to unavailable on error to be safe
      return false;
    }
  };

  const value = {
    meetings,
    loading,
    error,
    fetchMeetings,
    createMeeting,
    cancelMeeting,
    rescheduleMeeting,
    checkTimeSlotAvailability
  };

  return <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>;
};