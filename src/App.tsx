import { ThemeProvider } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { theme } from './styles/theme';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import Footer from './components/Footer';
import './styles/globalStyles.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;