import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Scanner from './pages/Scanner';
import Analysis from './pages/Analysis';
import Explainable from './pages/Explainable';
import Behavioral from './pages/Behavioral';

import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <NotificationProvider>
        <div className="relative flex min-h-screen flex-col group/design-root overflow-x-hidden w-full">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scan" element={<Scanner />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/explainable" element={<Explainable />} />
            <Route path="/behavioral" element={<Behavioral />} />
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
    </Router>
  );
}

export default App;
