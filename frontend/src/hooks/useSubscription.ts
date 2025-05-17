import { useState, useEffect, useCallback } from 'react';
import { createApiClient } from '../utils/apiClient';
import { useAuth } from '../contexts/AuthContext';

// Define Subscription type
export interface Subscription {
  id: number;
  plan: {
    id: number;
    name: string;
    price: number;
    interval: string;
    features: string[];
    slug?: string;
  };
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  current_period_end: string;
  days_remaining: number;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [hasCompletedPayment, setHasCompletedPayment] = useState<boolean>(false);
  const [lastFetched, setLastFetched] = useState<number>(0);
  
  const { getAuthHeader, isAuthenticated } = useAuth();
  const apiClient = createApiClient(getAuthHeader);

  const fetchSubscription = useCallback(async (force = false) => {
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
      const response = await apiClient.get('/api/subscriptions/user-subscription/');
      setLastFetched(now);

      console.log('Subscription response:', response);
      
      if (response.status === 'not_subscribed') {
        // Handle the "no subscription" case
        setSubscription(null);
        setHasCompletedPayment(response.has_completed_payment || false);
      } else if (response.id && response.plan) {
        // We have a valid subscription
        const subscriptionData: Subscription = {
          id: response.id,
          plan: response.plan,
          status: response.status,
          current_period_end: response.current_period_end,
          days_remaining: response.days_remaining || 0,
          cancel_at_period_end: response.cancel_at_period_end || false,
          stripe_subscription_id: response.stripe_subscription_id || '',
          created_at: response.created_at || '',
          updated_at: response.updated_at || ''
        };
        setSubscription(subscriptionData);
        setHasCompletedPayment(true);
      } else {
        // Invalid or unexpected response structure
        console.warn('Unexpected subscription data format:', response);
        setSubscription(null);
        setError('Invalid subscription data format');
      }
    } catch (err: any) {
      console.error('Error fetching subscription:', err);
      
      // Detailed error logging
      if (err.response) {
        // Server responded with non-2xx status
        console.error('Server error:', err.response.status, err.response);
        setError(`Server error: ${err.response?.error || err.response.status}`);
      } else if (err.request) {
        // Request made but no response received
        console.error('Network error - no response received');
        setError('Network error - could not connect to server');
      } else {
        // Error in setting up the request
        console.error('Request setup error:', err.message);
        setError(`Request error: ${err.message}`);
      }
      
      setSubscription(null);
      setHasCompletedPayment(false);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, apiClient, lastFetched]);

  // Fetch subscription when component mounts or auth changes
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Helper functions for handling subscription data
  const formatExpiryDate = useCallback(() => {
    if (!subscription?.current_period_end) return 'N/A';
    
    try {
      const expiryDate = new Date(subscription.current_period_end);
      return expiryDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      console.error('Error formatting expiry date:', err);
      return 'Invalid Date';
    }
  }, [subscription]);
  
  // Check if subscription is auto-generated vs from Stripe
  const isManualSubscription = useCallback(() => {
    if (!subscription?.stripe_subscription_id) return true;
    return ['manual_activation', 'payment_complete_action', 'auto_generated'].includes(
      subscription.stripe_subscription_id
    );
  }, [subscription]);

  // Format price with currency symbol
  const formatPrice = useCallback(() => {
    if (!subscription?.plan?.price) return 'N/A';
    return `$${subscription.plan.price}/${subscription.plan.interval || 'month'}`;
  }, [subscription]);

  // Get subscription status color
  const getStatusColor = useCallback(() => {
    if (!subscription) return 'default';
    
    switch (subscription.status) {
      case 'active':
        return 'success';
      case 'trialing':
        return 'info';
      case 'past_due':
        return 'warning';
      case 'canceled':
      case 'unpaid':
        return 'error';
      default:
        return 'default';
    }
  }, [subscription]);
  
  // Get human-readable status
  const getStatusLabel = useCallback(() => {
    if (!subscription) return 'Not Subscribed';
    
    switch (subscription.status) {
      case 'active':
        return 'Active';
      case 'trialing':
        return 'Trial Period';
      case 'past_due':
        return 'Payment Overdue';
      case 'canceled':
        return 'Canceled';
      case 'unpaid':
        return 'Payment Failed';
      default:
        return 'Unknown Status';
    }
  }, [subscription]);

  return {
    loading,
    error,
    subscription,
    hasCompletedPayment,
    refetch: (force = true) => fetchSubscription(force),
    isActive: subscription?.status === 'active',
    daysRemaining: subscription?.days_remaining || 0,
    planName: subscription?.plan?.name || 'No Plan',
    planId: subscription?.plan?.id || 0,
    planFeatures: subscription?.plan?.features || [],
    expiryDate: subscription?.current_period_end
      ? new Date(subscription.current_period_end)
      : null,
    formattedExpiryDate: formatExpiryDate(),
    isManualSubscription: isManualSubscription(),
    formattedPrice: formatPrice(),
    statusColor: getStatusColor(),
    statusLabel: getStatusLabel(),
    autoRenew: !subscription?.cancel_at_period_end
  };
};
