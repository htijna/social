import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import CitizenDashboard from './pages/CitizenDashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import ComplaintDetails from './pages/ComplaintDetails';
import AdminDashboard from './pages/AdminDashboard';
import { useNotifications } from './hooks/useNotifications';
import socket from './services/socket';
import { LanguageProvider } from './context/LanguageContext';
import { BellRing, X } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (socket.connected) {
      socket.disconnect();
    }
    setUser(null);
  };

  // Real-time notifications hook
  const { notifications, unreadCount, toast, setToast, markAllAsRead } = useNotifications(user);

  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-905 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-305">
          
          {/* Navigation Bar */}
          <Navbar 
            user={user} 
            logout={logout} 
            notifications={notifications}
            unreadCount={unreadCount}
            markAllAsRead={markAllAsRead}
          />

          {/* Content routing */}
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              
              <Route 
                path="/login" 
                element={
                  user ? (
                    <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
                  ) : (
                    <Login setUser={setUser} />
                  )
                } 
              />
              
              <Route 
                path="/register" 
                element={
                  user ? (
                    <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
                  ) : (
                    <Register setUser={setUser} />
                  )
                } 
              />

              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute user={user}>
                    <CitizenDashboard user={user} />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/submit-issue" 
                element={
                  <ProtectedRoute user={user}>
                    <SubmitComplaint />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/complaints/:id" 
                element={
                  <ProtectedRoute user={user}>
                    <ComplaintDetails user={user} />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute user={user}>
                    <Profile user={user} setUser={setUser} />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute user={user} adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />

          {/* Floating Toast Notification Box */}
          {toast && (
            <div className="fixed bottom-6 right-6 z-[3000] max-w-sm w-full bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 p-4 rounded-xl shadow-2xl border border-slate-700 dark:border-slate-700 flex items-start space-x-3 transition-all transform translate-y-0 animate-bounce">
              <div className="p-1 bg-govBlue-600 rounded-lg text-white mt-0.5">
                <BellRing className="h-5 w-5" />
              </div>
              <div className="flex-1 text-xs leading-normal">
                <p className="font-semibold text-slate-100">Live Update Alert</p>
                <p className="text-slate-300 mt-1">{toast.message}</p>
              </div>
              <button 
                onClick={() => setToast(null)} 
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>
      </Router>
    </LanguageProvider>
  );
}

