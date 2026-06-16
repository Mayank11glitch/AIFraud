import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Scanner from './pages/Scanner';
import Analysis from './pages/Analysis';
import Explainable from './pages/Explainable';
import Behavioral from './pages/Behavioral';

import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <AuthProvider>
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
      </AuthProvider>
    </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
