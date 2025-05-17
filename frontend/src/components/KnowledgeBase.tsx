import { useState } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Collapse, 
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Link as MuiLink
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

// FAQ data structure
const faqData = [
  {
    question: "How do I schedule my first meeting?",
    answer: "Go to your dashboard and click on 'Schedule Meeting'. Select your preferred date, time, and add any meeting details. The person you're meeting with will receive an invitation."
  },
  {
    question: "What happens after I confirm a meeting?",
    answer: "Once a meeting is confirmed, both parties will receive a confirmation email with a link to join the meeting. You can also find the meeting link in your dashboard under 'Upcoming Meetings'."
  },
  {
    question: "How can I reschedule a meeting?",
    answer: "In your dashboard, find the meeting you wish to reschedule in the 'Meetings' section. Click on 'Reschedule', select a new date and time, and confirm. Both parties will receive an updated invitation."
  },
  {
    question: "Does the platform support video meetings?",
    answer: "Yes, our platform provides built-in video conferencing using Jitsi Meet. When it's time for your meeting, simply click the 'Join Meeting' button in your dashboard."
  },
  {
    question: "How do I set my availability for meetings?",
    answer: "In your profile settings, you can set your availability preferences by specifying your working hours and blocked time periods. This ensures meetings are only scheduled when you're available."
  },
  {
    question: "What's the difference between host and client accounts?",
    answer: "Host accounts are for service providers who conduct meetings, while client accounts are for customers or prospects. Hosts can create meeting templates and manage multiple client relationships."
  },
  {
    question: "How secure are the meetings on this platform?",
    answer: "We use end-to-end encryption for all video meetings. Meeting URLs are unique and randomly generated. Only invited participants can join meetings."
  },
  {
    question: "Can I integrate this platform with my calendar?",
    answer: "Yes, we support integration with Google Calendar, Microsoft Outlook, and Apple Calendar. Go to 'Settings' > 'Integrations' to set up your preferred calendar."
  },
  {
    question: "What should I do if I'm having technical difficulties during a meeting?",
    answer: "If you encounter technical issues, first try refreshing your browser. If problems persist, check your internet connection and make sure your camera/microphone permissions are enabled. You can also try joining from a different device or browser."
  },
  {
    question: "How can I prepare for a successful onboarding meeting?",
    answer: "Before your onboarding meeting, review your account details and have any relevant documents ready. Prepare questions you'd like to ask and ensure you have a stable internet connection. Consider testing your audio and video equipment beforehand."
  },
  {
    question: "What happens if I miss a scheduled meeting?",
    answer: "If you miss a meeting, you'll receive an automated notification. You can reschedule directly from this notification or from your dashboard. The other participant will be notified of the missed meeting and any rescheduling actions."
  },
  {
    question: "How do I cancel my subscription?",
    answer: "To cancel your subscription, go to 'Settings' > 'Subscription' and click 'Cancel Subscription'. You'll have access to your account until the end of your current billing period. You can reactivate your subscription at any time."
  }
];

const knowledgeBaseCategories = [
  {
    title: "Getting Started",
    articles: [
      { title: "Creating your account", link: "#create-account", description: "Step-by-step guide to setting up your account and verifying your email" },
      { title: "Setting up your profile", link: "#setup-profile", description: "How to customize your profile with all the necessary information" },
      { title: "Understanding the dashboard", link: "#dashboard-guide", description: "A tour of your dashboard and its key features" },
      { title: "First-time user guide", link: "#first-time-guide", description: "Everything you need to know as a new user" }
    ]
  },
  {
    title: "Meetings",
    articles: [
      { title: "Scheduling your first meeting", link: "#schedule-meeting", description: "Complete guide to scheduling meetings efficiently" },
      { title: "Managing meeting settings", link: "#meeting-settings", description: "Customize your meeting preferences and requirements" },
      { title: "Using video conference features", link: "#video-features", description: "How to use screen sharing, chat, and other video features" },
      { title: "Recording meetings", link: "#recording-meetings", description: "How to record, store, and share meeting recordings" },
      { title: "Meeting templates", link: "#meeting-templates", description: "Create reusable templates for common meeting types" }
    ]
  },
  {
    title: "Account Management",
    articles: [
      { title: "Updating account information", link: "#update-account", description: "How to change your email, password, and other account details" },
      { title: "Managing notifications", link: "#manage-notifications", description: "Customize email and in-app notification preferences" },
      { title: "Subscription and billing", link: "#billing", description: "Understanding your billing cycle and payment options" },
      { title: "Team management", link: "#team-management", description: "Adding and managing team members in your account" }
    ]
  },
  {
    title: "Troubleshooting",
    articles: [
      { title: "Common technical issues", link: "#tech-issues", description: "Solutions for frequent technical problems" },
      { title: "Connection problems", link: "#connection-issues", description: "How to resolve video and audio connection issues" },
      { title: "Browser compatibility", link: "#browser-compatibility", description: "Recommended browsers and settings for optimal experience" },
      { title: "Contact support team", link: "#contact-support", description: "How to get direct help from our support team" }
    ]
  },
  {
    title: "Integrations",
    articles: [
      { title: "Calendar integration", link: "#calendar-integration", description: "Sync meetings with Google, Outlook, or Apple Calendar" },
      { title: "CRM connections", link: "#crm-connections", description: "Connect your CRM system to track meetings and contacts" },
      { title: "API documentation", link: "#api-docs", description: "Technical documentation for developers" }
    ]
  }
];

export default function KnowledgeBase() {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const toggleExpand = (index: number) => {
    if (expandedItems.includes(index)) {
      setExpandedItems(expandedItems.filter(i => i !== index));
    } else {
      setExpandedItems([...expandedItems, index]);
    }
  };
  
  // Filter FAQs based on search query
  const filteredFaqs = faqData.filter(
    faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
        <Typography variant="h6" gutterBottom>Knowledge Base</Typography>
        
        <TextField
          fullWidth
          size="small"
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton 
                  size="small" 
                  onClick={() => setSearchQuery('')}
                  edge="end"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />
      </Box>
      
      <Divider />
      
      <Box sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
        <Typography variant="subtitle1" sx={{ px: 2, py: 1.5, backgroundColor: 'background.paper' }}>
          Frequently Asked Questions
        </Typography>
        
        <List sx={{ p: 0 }}>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <Box key={index}>
                <ListItem 
                  component="button"
                  onClick={() => toggleExpand(index)}
                  sx={{ 
                    px: 2,
                    '&:hover': { backgroundColor: 'action.hover' },
                    width: '100%',
                    textAlign: 'left',
                    display: 'flex',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <ListItemText 
                    primary={faq.question} 
                    primaryTypographyProps={{ 
                      fontWeight: expandedItems.includes(index) ? 600 : 400,
                      fontSize: '0.9rem'
                    }}
                  />
                  {expandedItems.includes(index) ? 
                    <ExpandLessIcon fontSize="small" color="primary" /> : 
                    <ExpandMoreIcon fontSize="small" />
                  }
                </ListItem>
                <Collapse in={expandedItems.includes(index)} timeout="auto" unmountOnExit>
                  <Box sx={{ px: 2, py: 1.5, backgroundColor: 'background.default' }}>
                    <Typography variant="body2" color="text.secondary">
                      {faq.answer}
                    </Typography>
                  </Box>
                </Collapse>
                <Divider />
              </Box>
            ))
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No results found for "{searchQuery}"
              </Typography>
            </Box>
          )}
        </List>
        
        {searchQuery === '' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ px: 2, py: 1.5, backgroundColor: 'background.paper' }}>
              Help Articles
            </Typography>
            
            {knowledgeBaseCategories.map((category, categoryIndex) => (
              <Box key={categoryIndex} sx={{ mb: 2 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    px: 2, 
                    py: 1, 
                    backgroundColor: 'background.default',
                    fontWeight: 600
                  }}
                >
                  {category.title}
                </Typography>
                <List dense sx={{ py: 0 }}>
                  {category.articles.map((article, articleIndex) => (
                    <ArticleItem 
                      key={articleIndex}
                      title={article.title}
                      link={article.link}
                      description={article.description}
                    />
                  ))}
                </List>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

interface ArticleItemProps {
  title: string;
  link: string;
  description?: string;
}

const ArticleItem = ({ title, link, description }: ArticleItemProps) => {
  return (
    <ListItem 
      sx={{ 
        px: 2,
        py: 0.75,
        '&:hover': { 
          backgroundColor: 'action.hover',
        }
      }}
    >
      <MuiLink 
        href={link}
        underline="hover"
        sx={{ 
          display: 'block',
          width: '100%',
          color: 'text.primary',
          '&:hover': { color: 'primary.main' }
        }}
      >
        <ListItemText 
          primary={title}
          secondary={description}
          primaryTypographyProps={{ 
            fontSize: '0.85rem',
            fontWeight: 500
          }}
          secondaryTypographyProps={{
            fontSize: '0.75rem',
            color: 'text.secondary',
            sx: { mt: 0.5 }
          }}
        />
      </MuiLink>
    </ListItem>
  );
};
