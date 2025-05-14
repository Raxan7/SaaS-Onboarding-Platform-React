import { ThemeProvider } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { theme } from './styles/theme';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import Footer from './components/Footer';
import './styles/globalStyles.css';
import OnboardingPage from './pages/OnboardingPage';
import { AuthProvider } from './contexts/AuthContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import ClientDashboard from './pages/ClientDashboard';
import HostDashboard from './pages/HostDashboard';
import ProtectedRouteWithUserType from './components/ProtectedRouteWithUserType';
import ErrorBoundary from './components/ErrorBoundary';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OnboardingProvider>
          <ThemeProvider theme={theme}>
            <ErrorBoundary> {/* Wrap the app in an error boundary */}
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />

                {/* Client routes */}
                <Route element={<ProtectedRouteWithUserType requiredUserType="client" redirectPath="/host-dashboard" />}>
                  <Route path="/client-dashboard" element={<ClientDashboard />} />
                </Route>

                {/* Host routes */}
                <Route element={<ProtectedRouteWithUserType requiredUserType="host" redirectPath="/client-dashboard" />}>
                  <Route path="/host-dashboard" element={<HostDashboard />} />
                </Route>

                {/* Protected routes (for both types) */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                </Route>
              </Routes>
              <Footer />
            </ErrorBoundary>
          </ThemeProvider>
        </OnboardingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;