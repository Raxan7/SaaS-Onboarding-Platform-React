import { ThemeProvider } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { theme } from './styles/theme';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Header from './components/Header';
import Footer from './components/Footer';
import './styles/globalStyles.css';
import OnboardingPage from './pages/OnboardingPage';
import { AuthProvider } from './contexts/AuthContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { MeetingProvider } from './contexts/MeetingContext';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import ClientDashboard from './pages/ClientDashboard';
import HostDashboard from './pages/HostDashboard';
import ProtectedRouteWithUserType from './components/ProtectedRouteWithUserType';
import ErrorBoundary from './components/ErrorBoundary';
import ScheduleMeetingPage from './pages/ScheduleMeetingPage';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import LiveChat from './components/LiveChat';
import MeetingsPage from './pages/MeetingsPage';
import SubscriptionPage from './pages/SubscriptionPage';
import SupportPage from './pages/SupportPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OnboardingProvider>
          <MeetingProvider>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <ThemeProvider theme={theme}>
                <ErrorBoundary> {/* Wrap the app in an error boundary */}
                  <Header />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/onboarding" element={<OnboardingPage />} />

                    {/* Client routes */}
                    <Route element={<ProtectedRouteWithUserType requiredUserType="client" redirectPath="/dashboard" />}>
                      <Route path="/client-dashboard" element={<ClientDashboard />} />
                      <Route path="/schedule-meeting" element={<ScheduleMeetingPage />} />
                    </Route>

                    {/* Host routes */}
                    <Route element={<ProtectedRouteWithUserType requiredUserType="host" redirectPath="/dashboard" />}>
                      <Route path="/host-dashboard" element={<HostDashboard />} />
                    </Route>

                    {/* Protected routes (for both types) */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/meetings" element={<MeetingsPage />} />
                      <Route path="/subscription" element={<SubscriptionPage />} />
                      <Route path="/support" element={<SupportPage />} />
                      <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/help" element={<HelpPage />} />
                    </Route>
                  </Routes>
                  <Footer />
                  <LiveChat />
                </ErrorBoundary>
              </ThemeProvider>
            </LocalizationProvider>
          </MeetingProvider>
        </OnboardingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;