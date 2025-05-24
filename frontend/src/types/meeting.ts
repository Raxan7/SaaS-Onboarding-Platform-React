// types/meeting.ts
export interface Meeting {
    id: number;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
    host: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
    title: string;
    description?: string;
    scheduled_at: string;
    duration: number;
    timezone: string; // Added timezone field
    meeting_url?: string;
    status: 'pending' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed' | 'started' | 'expired';
    is_qualified: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
    goals?: string;
}