import { useState } from 'react';
import { Box, IconButton, Paper, TextField, Typography, Avatar, Badge, Slide, Grow } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I help you today?', sender: 'bot' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, sender: 'user' }]);
      setNewMessage('');
      // Simulate bot response
      setTimeout(() => {
        setMessages(prev => [...prev, { text: 'Thanks for your message! Our team will get back to you soon.', sender: 'bot' }]);
      }, 1000);
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      <Grow in={!open} timeout={500}>
        <Badge badgeContent=" " color="error" overlap="circular" variant="dot">
          <IconButton
            onClick={() => setOpen(true)}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': { backgroundColor: 'primary.dark' },
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.3s',
              '&:active': { transform: 'scale(0.95)' },
            }}
          >
            <ChatIcon />
          </IconButton>
        </Badge>
      </Grow>

      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Paper elevation={10} sx={{ width: 320, height: 400, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
          <Box sx={{ 
            backgroundColor: 'primary.main', 
            color: 'white', 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderRadius: '8px 8px 0 0'
          }}>
            <Typography variant="subtitle1">Live Support</Typography>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, p: 2, overflowY: 'auto', backgroundColor: 'background.paper' }}>
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                {message.sender === 'bot' && (
                  <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'secondary.main' }}>S</Avatar>
                )}
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    maxWidth: '70%',
                    backgroundColor: message.sender === 'user' ? 'primary.main' : 'background.default',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                    borderRadius: message.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Typography variant="body2">{message.text}</Typography>
                </Paper>
              </Box>
            ))}
          </Box>
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              InputProps={{
                endAdornment: (
                  <IconButton edge="end" onClick={handleSendMessage} sx={{ color: 'primary.main' }}>
                    <SendIcon />
                  </IconButton>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </Paper>
      </Slide>
    </Box>
  );
}