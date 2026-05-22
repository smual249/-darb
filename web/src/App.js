import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { registerServiceWorker, requestNotificationPermission } from './utils/notifications';
import NotificationOverlay from './components/NotificationOverlay';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Emails from './pages/Emails';
import Telegram from './pages/Telegram';
import WhatsApp from './pages/WhatsApp';
import Tasks from './pages/Tasks';
import Settings from './pages/Settings';

const token = () => localStorage.getItem('darb_token');

function ProtectedRoute({ children }) {
  if (!token()) return <Navigate to="/login" />;
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
    </div>
  );
}

function App() {
  useEffect(() => {
    registerServiceWorker();
    requestNotificationPermission();
  }, []);

  return (
    <ThemeProvider>
      <SocketProvider>
      <Router>
        <Toaster position="top-center" toastOptions={{
          style: { background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '12px', fontFamily: 'Cairo' },
        }} />
        <NotificationOverlay />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/emails" element={<ProtectedRoute><Emails /></ProtectedRoute>} />
          <Route path="/telegram" element={<ProtectedRoute><Telegram /></ProtectedRoute>} />
          <Route path="/whatsapp" element={<ProtectedRoute><WhatsApp /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
