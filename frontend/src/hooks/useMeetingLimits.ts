import { useState, useEffect, useCallback } from 'react';
import { createApiClient } from '../utils/apiClient';
import { useAuth } from '../contexts/AuthContext';

// Define the MeetingLimits interface
export interface MeetingLimits {
  limit: number | 'Unlimited';
  current_count: number;
  remaining: number | 'Unlimited';
  is_unlimited: boolean;
  can_create: boolean;
  plan_name: string;
}

export const useMeetingLimits = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [limits, setLimits] = useState<MeetingLimits | null>(null);
  const [lastFetched, setLastFetched] = useState<number>(0);
  
  const { getAuthHeader, isAuthenticated } = useAuth();
  const apiClient = createApiClient(getAuthHeader);

  const fetchLimits = useCallback(async (force = false) => {
    // Only fetch if:
    // 1. User is authenticated, AND
    // 2. Either this is a forced refresh OR it's been more than 1 minute since last fetch
    const now = Date.now();
    if (!isAuthenticated || (!force && lastFetched > 0 && now - lastFetched < 60000)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/api/meetings/limits/');
      setLastFetched(now);
      
      if (response) {
        setLimits(response);
      } else {
        // Fallback limits based on subscription status if API fails
        const subscriptionResponse = await apiClient.get('/api/subscriptions/user-subscription/');
        let plan = "Free";
        let isUnlimited = false;
        let meetingLimit = 2; // Default basic limit
        
        if (subscriptionResponse && subscriptionResponse.plan) {
          plan = subscriptionResponse.plan.name;
          if (plan.toLowerCase().includes('basic')) {
            meetingLimit = 2;
          } else if (plan.toLowerCase().includes('pro')) {
            meetingLimit = 11;
          } else if (plan.toLowerCase().includes('enterprise')) {
            meetingLimit = Infinity;
            isUnlimited = true;
          }
        }
        
        // Estimated current count - this won't be accurate but provides a fallback
        const currentCount = 0;
        
        setLimits({
          limit: isUnlimited ? 'Unlimited' : meetingLimit,
          current_count: currentCount,
          remaining: isUnlimited ? 'Unlimited' : Math.max(0, meetingLimit - currentCount),
          is_unlimited: isUnlimited,
          can_create: isUnlimited || currentCount < meetingLimit,
          plan_name: plan
        });
      }
    } catch (err: any) {
      console.error('Error fetching meeting limits:', err);
      setError('Could not load meeting limits. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [apiClient, isAuthenticated, lastFetched]);

  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  return {
    limits,
    loading,
    error,
    refresh: () => fetchLimits(true)
  };
};
