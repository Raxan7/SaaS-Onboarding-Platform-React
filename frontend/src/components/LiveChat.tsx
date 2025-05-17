import { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Paper, TextField, Typography, Avatar, Badge, Slide, Grow, Button, CircularProgress, Tooltip } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import LaunchIcon from '@mui/icons-material/Launch';
import KnowledgeBase from './KnowledgeBase';
import { useSupport, Message } from '../hooks/useSupport';
import { useAuth } from '../contexts/AuthContext';

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>([
    { message: 'Hello! How can I help you today?', sender_type: 'SYSTEM' }
  ]);
  const [isNewConversation, setIsNewConversation] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  
  const {
    activeConversation,
    loading,
    error,
    createConversation,
    sendMessage,
    resolveConversation,
    reopenConversation,
    fetchConversations,
    conversations
  } = useSupport();

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages, activeConversation]);

  // Fetch conversations when the component mounts if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated, fetchConversations]);

  // Update local messages when activeConversation changes
  useEffect(() => {
    if (activeConversation) {
      setLocalMessages(activeConversation.messages);
      setIsNewConversation(false);
    } else if (conversations && conversations.length > 0 && isAuthenticated) {
      // Try to load most recent conversation if any
      const latestConversation = conversations.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )[0];
      
      if (latestConversation && !latestConversation.resolved) {
        setLocalMessages(latestConversation.messages);
        setIsNewConversation(false);
      } else {
        // Reset to welcome message if all conversations are resolved
        setLocalMessages([{ message: 'Hello! How can I help you today?', sender_type: 'SYSTEM' }]);
        setIsNewConversation(true);
      }
    }
  }, [activeConversation, conversations, isAuthenticated]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const userMessage = { message: newMessage, sender_type: 'USER' as const };
    setLocalMessages([...localMessages, userMessage]);
    setNewMessage('');
    
    if (isAuthenticated) {
      if (isNewConversation) {
        // Create new conversation with initial message
        const title = `Support - ${new Date().toLocaleString()}`;
        
        // First add a loading message
        setLocalMessages(prev => [...prev, { message: 'Creating conversation...', sender_type: 'SYSTEM' }]);
        
        await createConversation(title, newMessage);
        setIsNewConversation(false);
      } else if (activeConversation) {
        // Send message to existing conversation
        await sendMessage(newMessage);
      }
    } else {
      // Not authenticated, just show a response message
      setTimeout(() => {
        setLocalMessages(prev => [...prev, { 
          message: 'Please log in to start a support conversation. For now, you can browse our Knowledge Base for help.',
          sender_type: 'SYSTEM'
        }]);
      }, 1000);
    }
  };

  // Handle keyboard submit
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      <Grow in={!open} timeout={500}>
        <Badge badgeContent=" " color="error" overlap="circular" variant="dot">
          <IconButton
            onClick={() => {
              setOpen(true);
              if (isAuthenticated) {
                fetchConversations();
              }
            }}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': { backgroundColor: 'primary.dark' },
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.3s',
              '&:active': { transform: 'scale(0.95)' },
              width: 56,
              height: 56,
            }}
          >
            <ChatIcon />
          </IconButton>
        </Badge>
      </Grow>

      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Paper elevation={10} sx={{ 
          width: 320, 
          height: 450, 
          display: 'flex', 
          flexDirection: 'column', 
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
        }}>
          <Box sx={{ 
            backgroundColor: 'primary.main', 
            color: 'white', 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderRadius: '8px 8px 0 0'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle1">
                {showKnowledgeBase ? 'Knowledge Base' : 'Live Support'}
              </Typography>
              {activeConversation && activeConversation.resolved && (
                <Tooltip title="This conversation has been resolved">
                  <CheckCircleIcon fontSize="small" sx={{ ml: 1, color: '#4caf50' }} />
                </Tooltip>
              )}
            </Box>
            <Box>
              {activeConversation && (
                <Tooltip title={activeConversation.resolved ? "Reopen conversation" : "Resolve conversation"}>
                  <IconButton 
                    size="small" 
                    onClick={() => activeConversation.resolved 
                      ? reopenConversation() 
                      : resolveConversation()
                    }
                    sx={{ color: 'white', mr: 1 }}
                  >
                    {activeConversation.resolved ? <LaunchIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              )}
              <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'white' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          
          {loading && localMessages.length <= 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress size={40} />
            </Box>
          )}
          
          {error && (
            <Box sx={{ p: 2, backgroundColor: '#ffebee', color: '#d32f2f', textAlign: 'center' }}>
              <PriorityHighIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              <Typography variant="body2" component="span">{error}</Typography>
            </Box>
          )}
          
          {showKnowledgeBase ? (
            <Box sx={{ height: '100%', overflow: 'hidden' }}>
              <KnowledgeBase />
            </Box>
          ) : (
            <>
              <Box sx={{ flex: 1, p: 2, overflowY: 'auto', backgroundColor: 'background.paper' }}>
                {localMessages.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: message.sender_type === 'USER' ? 'flex-end' : 'flex-start',
                      mb: 2,
                    }}
                  >
                    {message.sender_type !== 'USER' && (
                      <Avatar 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          mr: 1, 
                          bgcolor: message.sender_type === 'SYSTEM' ? 'info.main' : 'secondary.main' 
                        }}
                      >
                        {message.sender_type === 'SYSTEM' ? 'S' : 'A'}
                      </Avatar>
                    )}
                    <Box sx={{ maxWidth: '75%' }}>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 1.5,
                          backgroundColor: message.sender_type === 'USER' 
                            ? 'primary.main' 
                            : message.sender_type === 'SYSTEM'
                              ? 'background.default'
                              : '#f1f8e9',
                          color: message.sender_type === 'USER' ? 'white' : 'text.primary',
                          borderRadius: message.sender_type === 'USER' 
                            ? '12px 12px 0 12px' 
                            : '12px 12px 12px 0',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <Typography variant="body2">{message.message}</Typography>
                      </Paper>
                      {message.created_at && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block', 
                            mt: 0.5, 
                            color: 'text.secondary',
                            textAlign: message.sender_type === 'USER' ? 'right' : 'left' 
                          }}
                        >
                          {formatTime(message.created_at)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>
              
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  multiline
                  maxRows={3}
                  InputProps={{
                    endAdornment: (
                      <IconButton 
                        edge="end" 
                        onClick={handleSendMessage} 
                        disabled={loading}
                        sx={{ color: 'primary.main' }}
                      >
                        {loading ? <CircularProgress size={20} /> : <SendIcon />}
                      </IconButton>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    size="small" 
                    onClick={() => setShowKnowledgeBase(true)}
                    startIcon={<MenuBookIcon fontSize="small" />}
                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                  >
                    Browse Knowledge Base
                  </Button>
                </Box>
              </Box>
            </>
          )}
          
          {showKnowledgeBase && (
            <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.default', textAlign: 'center' }}>
              <Button 
                size="small"
                onClick={() => setShowKnowledgeBase(false)}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                Back to Chat
              </Button>
            </Box>
          )}
        </Paper>
      </Slide>
    </Box>
  );
}