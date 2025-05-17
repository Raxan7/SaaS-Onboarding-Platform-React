import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Create a simple API helper since the import is failing
const BASE_URL = 'http://localhost:8000';
const api = {
  async get(endpoint: string) {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  },
  
  async post(endpoint: string, data?: any) {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  }
};

export type Message = {
  id?: number;
  message: string;
  sender_type: 'USER' | 'SUPPORT' | 'SYSTEM';
  created_at?: string;
  read?: boolean;
};

export type Conversation = {
  id: number;
  title: string;
  user: number;
  user_email: string;
  created_at: string;
  updated_at: string;
  resolved: boolean;
  messages: Message[];
};

export const useSupport = () => {
  const { isAuthenticated } = useAuth();
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's conversations
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await api.get('/api/support/conversations/');
      setConversations(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load support conversations');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Create a new conversation
  const createConversation = useCallback(async (title: string, initialMessage: string) => {
    if (!isAuthenticated) return null;
    
    setLoading(true);
    try {
      // Create conversation
      const response = await api.post('/api/support/conversations/', {
        title
      });
      
      const newConversation = response.data;
      
      // Add initial message
      if (initialMessage) {
        await api.post(`/api/support/conversations/${newConversation.id}/add_message/`, {
          message: initialMessage
        });
        
        // Refresh to get the message included
        const updatedResponse = await api.get(`/api/support/conversations/${newConversation.id}/`);
        setActiveConversation(updatedResponse.data);
        
        // Update conversations list
        await fetchConversations();
      }
      
      setError(null);
      return newConversation;
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError('Failed to create support conversation');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchConversations]);

  // Send a message in active conversation
  const sendMessage = useCallback(async (message: string) => {
    if (!activeConversation || !isAuthenticated) return false;
    
    try {
      await api.post(`/api/support/conversations/${activeConversation.id}/add_message/`, {
        message
      });
      
      // Refresh conversation to get new message
      const response = await api.get(`/api/support/conversations/${activeConversation.id}/`);
      setActiveConversation(response.data);
      
      // Also update in the conversations list
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversation.id ? response.data : conv
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      return false;
    }
  }, [activeConversation, isAuthenticated]);

  // Mark conversation as resolved
  const resolveConversation = useCallback(async () => {
    if (!activeConversation || !isAuthenticated) return;
    
    try {
      await api.post(`/api/support/conversations/${activeConversation.id}/mark_as_resolved/`);
      
      // Update local state
      setActiveConversation(prev => prev ? { ...prev, resolved: true } : null);
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversation.id ? { ...conv, resolved: true } : conv
        )
      );
    } catch (err) {
      console.error('Error resolving conversation:', err);
      setError('Failed to resolve conversation');
    }
  }, [activeConversation, isAuthenticated]);

  // Reopen a resolved conversation
  const reopenConversation = useCallback(async () => {
    if (!activeConversation || !isAuthenticated) return;
    
    try {
      await api.post(`/api/support/conversations/${activeConversation.id}/reopen/`);
      
      // Update local state
      setActiveConversation(prev => prev ? { ...prev, resolved: false } : null);
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversation.id ? { ...conv, resolved: false } : conv
        )
      );
    } catch (err) {
      console.error('Error reopening conversation:', err);
      setError('Failed to reopen conversation');
    }
  }, [activeConversation, isAuthenticated]);

  // Load a specific conversation
  const loadConversation = useCallback(async (conversationId: number) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/api/support/conversations/${conversationId}/`);
      setActiveConversation(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load user conversations on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated, fetchConversations]);

  return {
    conversations,
    activeConversation,
    loading,
    error,
    fetchConversations,
    createConversation,
    sendMessage,
    resolveConversation,
    reopenConversation,
    loadConversation,
    setActiveConversation
  };
};
