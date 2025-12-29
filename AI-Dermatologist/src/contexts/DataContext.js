import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DataContext = createContext();

// Create socket instance once
// const socket = io(`${import.meta.env.VITE_API_URL}`);

const socket = io(API_URL, {
  transports: ["websocket"],
});

export const DataProvider = ({ children, user }) => {
  const [doctors, setDoctors] = useState([]);
  const [chats, setChats] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Fetch doctors listing
  const fetchDoctors = useCallback(async () => {
    try {
      setDoctorsLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/listing`);
      setDoctors(res.data || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setDoctorsLoading(false);
    }
  }, []);

  // Fetch chats for user
  const fetchChats = useCallback(async () => {
    if (!user?.id) {
      setChats([]);
      return;
    }
    try {
      setChatsLoading(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/chats/${user.id}`);
      const data = await res.json();
      setChats(data || []);
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setChatsLoading(false);
    }
  }, [user?.id]);

  // Fetch appointments for user
  const fetchAppointments = useCallback(async () => {
    if (!user?.id) {
      setAppointments([]);
      return;
    }
    try {
      setAppointmentsLoading(true);
      // const endpoint = user.role === 'doctor' 
      //   ? `${import.meta.env.VITE_API_URL}/api/doctorappointments/${user.id}`
      //   : `${import.meta.env.VITE_API_URL}/api/appointments/${user.id}`;
      const endpoint =
        user.role === "doctor"
          ? `${API_URL}/api/doctorappointments/${user.id}`
          : `${API_URL}/api/appointments/${user.id}`;

      const res = await axios.get(endpoint);
      setAppointments(res.data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setAppointmentsLoading(false);
    }
  }, [user?.id, user?.role]);

  // Fetch notifications for user
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      setNotificationsLoading(true);
      // Import notificationService dynamically to avoid circular dependencies
      const { default: notificationService } = await import('../services/notificationService');
      const data = await notificationService.getUnreadNotifications(user.id);
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setNotificationsLoading(false);
    }
  }, [user?.id]);

  // Initial data fetch when user logs in
  useEffect(() => {
    // Always fetch doctors (public data)
    fetchDoctors();

    // Fetch user-specific data only if user is logged in
    if (user?.id) {
      fetchChats();
      fetchAppointments();
      fetchNotifications();

      // Register socket for real-time updates
      socket.emit("register", user.id);
    } else {
      // Clear user-specific data when logged out
      setChats([]);
      setAppointments([]);
      setNotifications([]);
    }
  }, [user?.id, fetchDoctors, fetchChats, fetchAppointments, fetchNotifications]);

  // Listen for appointment booking events (immediate refresh)
  useEffect(() => {
    if (!user?.id) return;

    const handleAppointmentBooked = () => {
      // Refresh appointments after a short delay to ensure backend has saved
      setTimeout(() => {
        fetchAppointments();
      }, 500);
    };

    window.addEventListener('appointmentBooked', handleAppointmentBooked);
    return () => window.removeEventListener('appointmentBooked', handleAppointmentBooked);
  }, [user?.id, fetchAppointments]);

  // Listen for real-time messages
  useEffect(() => {
    if (!user?.id || !socket) return;

    const onMessage = (msg) => {
      // Update chats list with new message
      setChats((prev) => {
        const existingChat = prev.find((c) => c.id === msg.chat_id);
        if (existingChat) {
          // Update existing chat - mark as unread only if message is from someone else
          const isFromOtherUser = msg.sender_id !== user.id;
          return prev.map((c) =>
            c.id === msg.chat_id
              ? {
                ...c,
                last_message: msg.text,
                updated_at: msg.created_at || new Date().toISOString(),
                hasUnread: isFromOtherUser ? true : (c.hasUnread || false) // Keep existing unread status if message is from self
              }
              : c
          );
        } else {
          // Chat doesn't exist in list yet, will be added when user opens it
          return prev;
        }
      });
    };

    socket.on("message", onMessage);
    return () => socket.off("message", onMessage);
  }, [user?.id, socket]);

  // Listen for notification updates and appointment changes
  useEffect(() => {
    if (!user?.id || !socket) return;

    const onNotification = (notification) => {
      // Add notification to list (only if it's for this user and unread)
      if (notification.receiver_id === user.id && notification.status === 'unread') {
        setNotifications((prev) => {
          // Check if notification already exists
          if (prev.find((n) => n.id === notification.id)) return prev;
          return [notification, ...prev];
        });
      }

      // If it's an appointment-related notification, refresh appointments
      if (notification.type === 'appointment_booked' || notification.type === 'appointment_cancelled') {
        // Small delay to ensure backend has processed the change
        setTimeout(() => {
          fetchAppointments();
        }, 500);
      }
    };

    socket.on("notification", onNotification);
    return () => socket.off("notification", onNotification);
  }, [user?.id, socket, fetchAppointments]);

  // Subscribe to Supabase real-time notifications (backup to socket)
  useEffect(() => {
    if (!user?.id) return;

    let subscription = null;

    // Dynamically import to avoid circular dependencies
    import('../services/notificationService').then((module) => {
      const notificationService = module.default;
      subscription = notificationService.subscribeToNotifications(
        user.id,
        (notification) => {
          // Add notification to list
          setNotifications((prev) => {
            if (prev.find((n) => n.id === notification.id)) return prev;
            return [notification, ...prev];
          });
        }
      );
    });

    return () => {
      if (subscription) {
        import('../services/notificationService').then((module) => {
          module.default.unsubscribe();
        });
      }
    };
  }, [user?.id]);

  // Manual refresh functions
  const refreshDoctors = useCallback(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const refreshChats = useCallback(() => {
    fetchChats();
  }, [fetchChats]);

  const refreshAppointments = useCallback(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const refreshNotifications = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Update single chat when messages are loaded
  const updateChat = useCallback((chatId, updates) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, ...updates } : c))
    );
  }, []);

  // Add new chat
  const addChat = useCallback((chat) => {
    setChats((prev) => {
      if (prev.find((c) => c.id === chat.id)) return prev;
      return [chat, ...prev];
    });
  }, []);

  // Update appointment status
  const updateAppointment = useCallback((appointmentId, updates) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.appointments?.id === appointmentId
          ? { ...a, appointments: { ...a.appointments, ...updates } }
          : a
      )
    );
  }, []);

  // Remove appointment (when cancelled)
  const removeAppointment = useCallback((appointmentId) => {
    setAppointments((prev) =>
      prev.filter((a) => a.appointments?.id !== appointmentId)
    );
  }, []);

  // Add new appointment
  const addAppointment = useCallback((appointment) => {
    setAppointments((prev) => {
      // Check if already exists
      if (prev.find((a) => a.appointments?.id === appointment.id)) return prev;
      return [appointment, ...prev];
    });
  }, []);

  // Mark notification as read
  const markNotificationRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? { ...n, status: 'read', read_at: new Date().toISOString() }
          : n
      )
    );
  }, []);

  const value = {
    // Data
    doctors,
    chats,
    appointments,
    notifications,

    // Loading states
    doctorsLoading,
    chatsLoading,
    appointmentsLoading,
    notificationsLoading,

    // Refresh functions
    refreshDoctors,
    refreshChats,
    refreshAppointments,
    refreshNotifications,

    // Update functions
    updateChat,
    addChat,
    updateAppointment,
    removeAppointment,
    addAppointment,
    markNotificationRead,

    // Socket instance for components that need it
    socket,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

