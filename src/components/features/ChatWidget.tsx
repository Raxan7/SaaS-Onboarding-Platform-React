import { useState, useEffect } from 'react'
import { Box, IconButton, Badge, Paper, TextField, Typography } from '@mui/material'
import { Chat as ChatIcon, Close as CloseIcon, Send as SendIcon } from '@mui/icons-material'

const ChatWidget = () => {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [messages, setMessages] = useState<
    Array<{ text: string; sender: 'user' | 'agent' }>
  >([])
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    if (open && messages.length === 0) {
      setTimeout(() => {
        setMessages([
          ...messages,
          {
            text: 'Hello! How can I help you today?',
            sender: 'agent',
          },
        ])
      }, 1000)
    }
  }, [open, messages])

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage = { text: inputValue, sender: 'user' as const }
      setMessages([...messages, newMessage])
      setInputValue('')

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: 'Thanks for your message! Our team will get back to you shortly.',
            sender: 'agent',
          },
        ])
      }, 1500)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1200,
      }}
    >
      {open ? (
        <Paper
          elevation={3}
          sx={{
            width: 320,
            height: 400,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="subtitle1">Support Chat</Typography>
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setOpen(false)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              p: 2,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  bgcolor: message.sender === 'user' ? 'primary.light' : 'grey.200',
                  color: message.sender === 'user' ? 'white' : 'text.primary',
                  p: 1.5,
                  borderRadius: 2,
                  mb: 1,
                  maxWidth: '80%',
                }}
              >
                {message.text}
              </Box>
            ))}
          </Box>
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <IconButton
                    edge="end"
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                  >
                    <SendIcon />
                  </IconButton>
                ),
              }}
            />
          </Box>
        </Paper>
      ) : (
        <IconButton
          color="primary"
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
          onClick={() => {
            setOpen(true)
            setUnread(0)
          }}
        >
          <Badge badgeContent={unread} color="error">
            <ChatIcon />
          </Badge>
        </IconButton>
      )}
    </Box>
  )
}

export default ChatWidget