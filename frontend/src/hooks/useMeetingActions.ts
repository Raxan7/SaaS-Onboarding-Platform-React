// hooks/useMeetingActions.ts
import { useState, useCallback } from 'react';
import { Meeting } from '../types/meeting';
import { meetingAjax, CreateMeetingData, UpdateMeetingData } from '../utils/meetingAjax';

export interface UseMeetingActionsReturn {
  // State
  loading: boolean;
  error: string | null;
  success: string | null;
  
  // Actions
  createMeeting: (data: CreateMeetingData) => Promise<Meeting | null>;
  updateMeetingStatus: (meetingId: number, status: string) => Promise<Meeting | null>;
  startMeeting: (meetingId: number) => Promise<Meeting | null>;
  endMeeting: (meetingId: number) => Promise<Meeting | null>;
  rescheduleMeeting: (meetingId: number, data: UpdateMeetingData) => Promise<Meeting | null>;
  checkAvailability: (scheduledAt: string, timezone: string, duration: number) => Promise<boolean>;
  
  // Utilities
  clearMessages: () => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  
  // Callbacks for UI refresh
  onMeetingUpdate?: (meeting: Meeting) => void;
  refreshCallback?: () => void;
}

/**
 * Custom hook for managing meeting actions with AJAX
 * Provides a clean interface for all meeting operations without page reloads
 */
export const useMeetingActions = (
  onMeetingUpdate?: (meeting: Meeting) => void,
  refreshCallback?: () => void
): UseMeetingActionsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const createMeeting = useCallback(async (data: CreateMeetingData): Promise<Meeting | null> => {
    setLoading(true);
    clearMessages();
    
    try {
      const response = await meetingAjax.createMeeting(data);
      
      if (response.success && response.data) {
        setSuccess(response.message || 'Meeting created successfully!');
        
        // Trigger UI refresh callbacks
        if (onMeetingUpdate) {
          onMeetingUpdate(response.data);
        }
        if (refreshCallback) {
          refreshCallback();
        }
        
        return response.data;
      } else {
        setError(response.error || 'Failed to create meeting');
        return null;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearMessages, onMeetingUpdate, refreshCallback]);

  const updateMeetingStatus = useCallback(async (meetingId: number, status: string): Promise<Meeting | null> => {
    setLoading(true);
    clearMessages();
    
    try {
      const response = await meetingAjax.updateMeetingStatus(meetingId, status);
      
      if (response.success && response.data) {
        setSuccess(response.message || `Meeting ${status} successfully!`);
        
        // Trigger UI refresh callbacks
        if (onMeetingUpdate) {
          onMeetingUpdate(response.data);
        }
        if (refreshCallback) {
          refreshCallback();
        }
        
        return response.data;
      } else {
        setError(response.error || `Failed to ${status} meeting`);
        return null;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearMessages, onMeetingUpdate, refreshCallback]);

  const startMeeting = useCallback(async (meetingId: number): Promise<Meeting | null> => {
    setLoading(true);
    clearMessages();
    
    try {
      const response = await meetingAjax.startMeeting(meetingId);
      
      if (response.success && response.data) {
        setSuccess(response.message || 'Meeting started successfully!');
        
        // Trigger UI refresh callbacks
        if (onMeetingUpdate) {
          onMeetingUpdate(response.data);
        }
        if (refreshCallback) {
          refreshCallback();
        }
        
        return response.data;
      } else {
        setError(response.error || 'Failed to start meeting');
        return null;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearMessages, onMeetingUpdate, refreshCallback]);

  const endMeeting = useCallback(async (meetingId: number): Promise<Meeting | null> => {
    setLoading(true);
    clearMessages();
    
    try {
      const response = await meetingAjax.endMeeting(meetingId);
      
      if (response.success && response.data) {
        setSuccess(response.message || 'Meeting ended successfully!');
        
        // Trigger UI refresh callbacks
        if (onMeetingUpdate) {
          onMeetingUpdate(response.data);
        }
        if (refreshCallback) {
          refreshCallback();
        }
        
        return response.data;
      } else {
        setError(response.error || 'Failed to end meeting');
        return null;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearMessages, onMeetingUpdate, refreshCallback]);

  const rescheduleMeeting = useCallback(async (meetingId: number, data: UpdateMeetingData): Promise<Meeting | null> => {
    setLoading(true);
    clearMessages();
    
    try {
      const response = await meetingAjax.rescheduleMeeting(meetingId, data);
      
      if (response.success && response.data) {
        setSuccess(response.message || 'Meeting rescheduled successfully!');
        
        // Trigger UI refresh callbacks
        if (onMeetingUpdate) {
          onMeetingUpdate(response.data);
        }
        if (refreshCallback) {
          refreshCallback();
        }
        
        return response.data;
      } else {
        setError(response.error || 'Failed to reschedule meeting');
        return null;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearMessages, onMeetingUpdate, refreshCallback]);

  const checkAvailability = useCallback(async (scheduledAt: string, timezone: string, duration: number): Promise<boolean> => {
    try {
      const response = await meetingAjax.checkAvailability(scheduledAt, timezone, duration);
      return response.available;
    } catch (err) {
      console.error('Error checking availability:', err);
      return false;
    }
  }, []);

  return {
    // State
    loading,
    error,
    success,
    
    // Actions
    createMeeting,
    updateMeetingStatus,
    startMeeting,
    endMeeting,
    rescheduleMeeting,
    checkAvailability,
    
    // Utilities
    clearMessages,
    setError,
    setSuccess,
    
    // Callbacks
    onMeetingUpdate,
    refreshCallback
  };
};
