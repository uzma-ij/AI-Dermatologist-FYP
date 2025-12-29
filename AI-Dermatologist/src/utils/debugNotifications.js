import { supabase } from '../supabase';

// Debug utility to check notification system
export const debugNotificationSystem = async (userId) => {
  console.log('=== DEBUGGING NOTIFICATION SYSTEM ===');
  console.log('User ID:', userId);

  try {
    // 1. Check if notifications table exists and get its structure
    console.log('\n1. Checking notifications table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('Error accessing notifications table:', tableError);
      return;
    }
    console.log('✅ Notifications table accessible');

    // 2. Check all notifications for this user
    console.log('\n2. Checking all notifications for user...');
    const { data: allNotifications, error: allError } = await supabase
      .from('notifications')
      .select('*')
      .eq('receiver_id', userId);
    
    if (allError) {
      console.error('Error fetching all notifications:', allError);
    } else {
      console.log('All notifications for user:', allNotifications);
    }

    // 3. Check unread notifications
    console.log('\n3. Checking unread notifications...');
    const { data: unreadNotifications, error: unreadError } = await supabase
      .from('notifications')
      .select('*')
      .eq('receiver_id', userId)
      .eq('status', 'unread');
    
    if (unreadError) {
      console.error('Error fetching unread notifications:', unreadError);
    } else {
      console.log('Unread notifications:', unreadNotifications);
    }

    // 4. Test creating a notification
    console.log('\n4. Testing notification creation...');
    const testNotification = {
      sender_id: userId,
      receiver_id: userId,
      type: 'message',
      title: 'Debug Test Notification',
      message: 'This is a test notification created during debugging',
      related_id: null,
      status: 'unread'
    };

    const { data: createdNotification, error: createError } = await supabase
      .from('notifications')
      .insert([testNotification])
      .select()
      .single();

    if (createError) {
      console.error('Error creating test notification:', createError);
    } else {
      console.log('✅ Test notification created successfully:', createdNotification);
    }

    // 5. Check real-time subscription
    console.log('\n5. Testing real-time subscription...');
    const channel = supabase
      .channel('debug-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          console.log('✅ Real-time notification received:', payload.new);
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    // Clean up after 5 seconds
    setTimeout(() => {
      channel.unsubscribe();
      console.log('Real-time subscription cleaned up');
    }, 5000);

  } catch (error) {
    console.error('Debug error:', error);
  }
};

// Function to manually create a notification for testing
export const createDebugNotification = async (receiverId, title = 'Debug Notification', message = 'This is a debug notification') => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        sender_id: receiverId, // Using receiver as sender for test
        receiver_id: receiverId,
        type: 'message',
        title: title,
        message: message,
        related_id: null,
        status: 'unread'
      }])
      .select()
      .single();

    if (error) throw error;
    console.log('Debug notification created:', data);
    return data;
  } catch (error) {
    console.error('Error creating debug notification:', error);
    return null;
  }
};

