import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Scanner from './pages/Scanner';
import Analysis from './pages/Analysis';
import Explainable from './pages/Explainable';
import Behavioral from './pages/Behavioral';

import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { ScanProvider } from './context/ScanContext';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

import ProtectedRoute from './components/ProtectedRoute';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function AppContent() {
  return (
    <Router>
      <AuthProvider>
        <ScanProvider>
          <NotificationProvider>
            <div className="relative flex min-h-screen flex-col group/design-root overflow-x-hidden w-full">
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/scan" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
                <Route path="/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
                <Route path="/explainable" element={<ProtectedRoute><Explainable /></ProtectedRoute>} />
                <Route path="/behavioral" element={<ProtectedRoute><Behavioral /></ProtectedRoute>} />
              </Routes>
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'font-sans shadow-xl rounded-xl',
                duration: 5000
              }}
            />
          </NotificationProvider>
        </ScanProvider>
      </AuthProvider>
    </Router>
  );
}

function App() {
  // Only wrap with GoogleOAuthProvider when a valid client ID is configured.
  // Without it the app still works — users can log in with username/password.
  // Google Sign-In button inside the modal is conditionally hidden in Header.
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID') {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AppContent />
      </GoogleOAuthProvider>
    );
  }

  return <AppContent />;
}

export default App;
