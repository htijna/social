import { useState, useEffect, useCallback } from 'react';
import { userAPI } from '../services/api';
import socket from '../services/socket';

export const useNotifications = (user) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await userAPI.getNotifications();
      if (res.data.success) {
        setNotifications(res.data.notifications);
        const unread = res.data.notifications.filter(n => n.status === 'unread').length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err.message);
    }
  }, [user]);

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    try {
      const res = await userAPI.markNotificationsRead();
      if (res.data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err.message);
    }
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    // Connect socket and join user room
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit('join', user.id);

    // Audio beep for new notifications
    const beep = () => {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
      } catch (e) {
        // AudioContext browser block fallback
      }
    };

    // Socket listeners
    const handleNewNotification = (notification) => {
      beep();
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      setToast({
        id: notification._id || Date.now(),
        message: notification.message
      });
      // Clear toast after 5 seconds
      setTimeout(() => setToast(null), 5000);
    };

    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [user, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    toast,
    setToast,
    markAllAsRead,
    refetch: fetchNotifications
  };
};
