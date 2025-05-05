import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
// import { HomePage, Pricing, Onboarding, Dashboard } from './pages'
// import { MainLayout } from './components/layout'
// import { AuthProvider } from './contexts/AuthContext'

// Pages
import HomePage from './components/pages/HomePage'
import Pricing from './components/pages/Pricing'
import Onboarding from './components/pages/Onboarding'
import Dashboard from './components/pages/Dashboard'

// Features
import ChatWidget from './components/features/ChatWidget'

// Context
import { AuthProvider } from './contexts/AuthContext'
import MainLayout from './components/layout/MainLayout'




const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1',
    },
    secondary: {
      main: '#10b981',
    },
    background: {
      default: '#f9fafb',
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <MainLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </MainLayout>
          <ChatWidget />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App