import { Typography, Box, Paper, TextField, InputAdornment, Card, CardContent, Grid, Chip, useTheme } from '@mui/material';
import { Search as SearchIcon, Article as ArticleIcon, Business as BusinessIcon, Code as CodeIcon, Security as SecurityIcon, Payments as PaymentsIcon } from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import { useState } from 'react';

// Mock data for knowledge base articles
const mockArticles = [
  { 
    id: 1, 
    title: 'Getting Started with SaaS Platform', 
    category: 'Getting Started',
    tags: ['onboarding', 'setup'],
    icon: <ArticleIcon />
  },
  { 
    id: 2, 
    title: 'Setting Up Your Company Profile', 
    category: 'Account Management',
    tags: ['profile', 'company'],
    icon: <BusinessIcon />
  },
  { 
    id: 3, 
    title: 'API Integration Guide', 
    category: 'Technical',
    tags: ['api', 'integration'],
    icon: <CodeIcon />
  },
  { 
    id: 4, 
    title: 'Security Best Practices', 
    category: 'Security',
    tags: ['security', 'privacy'],
    icon: <SecurityIcon />
  },
  { 
    id: 5, 
    title: 'Managing Your Subscription', 
    category: 'Billing',
    tags: ['subscription', 'billing'],
    icon: <PaymentsIcon />
  },
  { 
    id: 6, 
    title: 'Troubleshooting Common Issues', 
    category: 'Support',
    tags: ['troubleshooting', 'issues'],
    icon: <ArticleIcon />
  },
];

const KnowledgeBasePage = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter articles based on search query
  const filteredArticles = searchQuery
    ? mockArticles.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : mockArticles;

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Knowledge Base
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Find answers to all your questions about our platform
        </Typography>
      </Box>

      {/* Search Bar */}
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden', 
          mb: 4, 
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundImage: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main}20)`,
        }}
      >
        <Typography 
          variant="h5" 
          fontWeight={600} 
          gutterBottom 
          sx={{ color: theme.palette.primary.main, mb: 2 }}
        >
          How can we help you today?
        </Typography>
        <TextField
          fullWidth
          placeholder="Search for articles, topics, or keywords..."
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ 
            maxWidth: 700,
            bgcolor: 'background.paper',
            borderRadius: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>
      
      {/* Article Categories */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Browse by Category
        </Typography>
        <Grid container spacing={2}>
          {['Getting Started', 'Account Management', 'Technical', 'Security', 'Billing', 'Support'].map((category) => (
            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={category}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: theme.shadows[3],
                    transform: 'translateY(-2px)',
                  }
                }}
                onClick={() => setSearchQuery(category)}
              >
                <Typography variant="body1" fontWeight={500}>
                  {category}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Articles List */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {searchQuery ? `Search Results (${filteredArticles.length})` : 'Popular Articles'}
        </Typography>
        <Grid container spacing={3}>
          {filteredArticles.map((article) => (
            <Grid size={{ xs: 12, md: 6 }} key={article.id}>
              <Card 
                sx={{ 
                  borderRadius: 2,
                  boxShadow: theme.shadows[2],
                  transition: 'all 0.2s',
                  height: '100%',
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, gap: 2 }}>
                    <Box 
                      sx={{ 
                        p: 1, 
                        borderRadius: 1, 
                        bgcolor: theme.palette.primary.light,
                        color: theme.palette.primary.main,
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                      }}
                    >
                      {article.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {article.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {article.category}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        {article.tags.map(tag => (
                          <Chip 
                            key={tag} 
                            label={tag} 
                            size="small" 
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default KnowledgeBasePage;
