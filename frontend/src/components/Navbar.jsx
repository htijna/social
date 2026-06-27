import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, User as UserIcon, Menu, X, Landmark, ClipboardList, Globe } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ user, logout, notifications = [], unreadCount = 0, markAllAsRead }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { language, toggleLanguage, t } = useLanguage();

  // Close notifications dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (complaintId) => {
    setShowNotifications(false);
    setIsOpen(false);
    // Find complaint details path
    if (complaintId) {
      navigate(`/complaints/${complaintId}`);
    } else {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  };

  const handleMarkAllRead = () => {
    if (markAllAsRead) {
      markAllAsRead();
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-govBlue-700 dark:text-govBlue-400 font-bold text-xl tracking-tight">
              <Landmark className="h-6 w-6 stroke-[2]" />
              <span className="font-extrabold font-sans">Civic<span className="text-slate-700 dark:text-slate-300 font-normal">Connect</span></span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                isActive('/') 
                  ? 'text-govBlue-700 dark:text-govBlue-400 bg-govBlue-50 dark:bg-slate-800/60' 
                  : 'text-slate-600 hover:text-govBlue-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-govBlue-400 dark:hover:bg-slate-800/40'
              }`}
            >
              {t('navHome')}
            </Link>

            {user && (
              <>
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive('/dashboard') || isActive('/admin')
                      ? 'text-govBlue-700 dark:text-govBlue-400 bg-govBlue-50 dark:bg-slate-800/60'
                      : 'text-slate-600 hover:text-govBlue-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-govBlue-400 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {user.role === 'admin' ? t('navAdmin') : t('navDashboard')}
                </Link>

                {user.role !== 'admin' && (
                  <Link
                    to="/submit-issue"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      isActive('/submit-issue')
                        ? 'text-govBlue-700 dark:text-govBlue-400 bg-govBlue-50 dark:bg-slate-800/60'
                        : 'text-slate-600 hover:text-govBlue-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-govBlue-400 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {t('navReportIssue')}
                  </Link>
                )}

                <Link
                  to="/profile"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive('/profile')
                      ? 'text-govBlue-700 dark:text-govBlue-400 bg-govBlue-50 dark:bg-slate-800/60'
                      : 'text-slate-600 hover:text-govBlue-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-govBlue-400 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {t('navProfile')}
                </Link>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all"
              title="Change Language"
            >
              <Globe className="h-4 w-4 text-govBlue-600 dark:text-govBlue-400" />
              <span>{language === 'en' ? 'മലയാളം' : 'English'}</span>
            </button>

            <DarkModeToggle />

            {user ? (
              <>
                {/* Notifications Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all relative"
                    aria-label="View notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                    )}
                  </button>

                  {/* Dropdown panel */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 transform origin-top-right transition-all">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">Alerts</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-govBlue-600 hover:text-govBlue-700 dark:text-govBlue-400 dark:hover:text-govBlue-300 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => handleNotificationClick(n.complaintId || null)}
                              className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-100 dark:border-slate-700/50 transition-colors flex flex-col space-y-1 ${
                                n.status === 'unread' ? 'bg-govBlue-50/40 dark:bg-slate-700/20' : ''
                              }`}
                            >
                              <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-400">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

                <div className="flex items-center space-x-3 pl-1">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">{user.name}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                    title="Log out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2 pl-2">
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-sm font-medium text-govBlue-700 hover:text-govBlue-800 dark:text-govBlue-400 dark:hover:text-govBlue-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-medium text-white bg-govBlue-600 hover:bg-govBlue-700 rounded-lg shadow-sm hover:shadow transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <DarkModeToggle />
            {user && unreadCount > 0 && (
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Home
            </Link>

            {user ? (
              <>
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {user.role === 'admin' ? 'Admin Panel' : 'Citizen Dashboard'}
                </Link>

                {user.role !== 'admin' && (
                  <Link
                    to="/submit-issue"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Report Issue
                  </Link>
                )}

                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Profile
                </Link>

                {/* Notifications segment for Mobile */}
                <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2">
                  <div className="px-3 py-1 flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>ALERTS ({unreadCount})</span>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-govBlue-500">
                        Mark read
                      </button>
                    )}
                  </div>
                  <div className="max-h-40 overflow-y-auto px-2">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-3">No notifications</p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n._id}
                          onClick={() => handleNotificationClick(n.complaintId || null)}
                          className="px-2 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded mb-1"
                        >
                          {n.message}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-850 mt-3 pt-3 flex items-center justify-between px-3">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-5 w-5 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{user.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="flex items-center text-rose-500 text-sm font-semibold hover:bg-rose-50 p-2 rounded-md"
                  >
                    <LogOut className="h-4 w-4 mr-1.5" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-4 px-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-govBlue-700 hover:bg-slate-100 dark:text-govBlue-400 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-850"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-white bg-govBlue-600 hover:bg-govBlue-700 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
