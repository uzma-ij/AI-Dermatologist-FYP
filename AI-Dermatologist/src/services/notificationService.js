import { supabase } from '../supabase';

class NotificationService {
  constructor() {
    this.listeners = [];
    this.subscription = null;
  }

  // Subscribe to real-time notifications for a user
  subscribeToNotifications(userId, callback) {
    if (!userId) {
      console.log('No userId provided for notification subscription');
      return;
    }

    console.log('Subscribing to notifications for user:', userId);

    // Clean up existing subscription
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // Subscribe to notifications table changes
    this.subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          console.log('New notification received via real-time:', payload.new);
          callback(payload.new);
        }
      )
      .subscribe((status) => {
        console.log('Notification subscription status:', status);
      });

    return this.subscription;
  }

  // Fetch unread notifications for a user
  async getUnreadNotifications(userId) {
    if (!userId) {
      console.log('No userId provided for fetching notifications');
      return [];
    }

    try {
      console.log('Fetching notifications for user:', userId);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('receiver_id', userId)
        .eq('status', 'unread')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }
      
      console.log('Fetched notifications:', data);
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('receiver_id', userId)
        .eq('status', 'unread');

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Create a notification
  async createNotification(notificationData) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notificationData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Clean up subscription
  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }
}

export default new NotificationService();
