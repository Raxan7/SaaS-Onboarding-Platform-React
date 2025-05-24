// utils/meetingAjax.ts
import { createApiClient } from './apiClient';
import { Meeting } from '../types/meeting';

// Create a function to get the API client with authentication
const getApiClient = () => {
  const token = localStorage.getItem('token');
  return createApiClient(() => {
    return token ? { Authorization: `Token ${token}` } : {};
  });
};

export interface MeetingResponse {
  success: boolean;
  data?: Meeting;
  error?: string;
  message?: string;
}

export interface CreateMeetingData {
  title: string;
  goals: string;
  scheduled_at: string;
  duration: number;
  timezone: string;
  host_id?: string;
  status?: string;
}

export interface UpdateMeetingData {
  status?: string;
  scheduled_at?: string;
  timezone?: string;
  [key: string]: any;
}

/**
 * Professional AJAX service for meeting operations
 * Handles all meeting-related API calls without page reloads
 */
export class MeetingAjaxService {
  private static instance: MeetingAjaxService;

  static getInstance(): MeetingAjaxService {
    if (!MeetingAjaxService.instance) {
      MeetingAjaxService.instance = new MeetingAjaxService();
    }
    return MeetingAjaxService.instance;
  }

  /**
   * Create a new meeting
   */
  async createMeeting(data: CreateMeetingData): Promise<MeetingResponse> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.post('/api/meetings/', {
        ...data,
        status: data.status || 'pending'
      });

      return {
        success: true,
        data: response,
        message: 'Meeting scheduled successfully!'
      };
    } catch (error: any) {
      console.error('Error creating meeting:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create meeting. Please try again.'
      };
    }
  }

  /**
   * Update meeting status (confirm, cancel, etc.)
   */
  async updateMeetingStatus(meetingId: number, status: string): Promise<MeetingResponse> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.put(`/api/meetings/${meetingId}/`, { status });

      return {
        success: true,
        data: response,
        message: `Meeting ${status} successfully!`
      };
    } catch (error: any) {
      console.error('Error updating meeting status:', error);
      return {
        success: false,
        error: error.response?.data?.message || `Failed to ${status} meeting. Please try again.`
      };
    }
  }

  /**
   * Start a meeting
   */
  async startMeeting(meetingId: number): Promise<MeetingResponse> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.put(`/api/meetings/${meetingId}/start/`, {});

      return {
        success: true,
        data: response,
        message: 'Meeting started successfully!'
      };
    } catch (error: any) {
      console.error('Error starting meeting:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to start meeting. Please try again.'
      };
    }
  }

  /**
   * End a meeting
   */
  async endMeeting(meetingId: number): Promise<MeetingResponse> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.put(`/api/meetings/${meetingId}/end/`, {});

      return {
        success: true,
        data: response,
        message: 'Meeting ended successfully!'
      };
    } catch (error: any) {
      console.error('Error ending meeting:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to end meeting. Please try again.'
      };
    }
  }

  /**
   * Reschedule a meeting
   */
  async rescheduleMeeting(meetingId: number, data: UpdateMeetingData): Promise<MeetingResponse> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.put(`/api/meetings/${meetingId}/`, {
        ...data,
        status: 'rescheduled'
      });

      return {
        success: true,
        data: response,
        message: 'Meeting rescheduled successfully!'
      };
    } catch (error: any) {
      console.error('Error rescheduling meeting:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reschedule meeting. Please try again.'
      };
    }
  }

  /**
   * Check time slot availability
   */
  async checkAvailability(scheduledAt: string, timezone: string, duration: number): Promise<{
    available: boolean;
    message?: string;
  }> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.post('/api/meetings/check-availability/', {
        scheduled_at: scheduledAt,
        timezone,
        duration
      });

      return {
        available: response.available,
        message: response.message
      };
    } catch (error: any) {
      console.error('Error checking availability:', error);
      return {
        available: false,
        message: 'Failed to check availability'
      };
    }
  }

  /**
   * Fetch all meetings
   */
  async fetchMeetings(): Promise<Meeting[]> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get('/api/meetings/');
      return response || [];
    } catch (error) {
      console.error('Error fetching meetings:', error);
      return [];
    }
  }

  /**
   * Fetch active meeting
   */
  async fetchActiveMeeting(): Promise<Meeting | null> {
    try {
      const apiClient = getApiClient();
      const meetings = await apiClient.get('/api/meetings/active/');
      return meetings?.[0] || null;
    } catch (error) {
      console.error('Error fetching active meeting:', error);
      return null;
    }
  }
}

// Export singleton instance
export const meetingAjax = MeetingAjaxService.getInstance();
