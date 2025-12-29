import { supabase } from '../supabase';

// Utility function to create test notifications
export const createTestNotification = async (receiverId, title = 'Test Notification', message = 'This is a test notification message') => {
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
    console.log('Test notification created:', data);
    return data;
  } catch (error) {
    console.error('Error creating test notification:', error);
    return null;
  }
};

// Function to create multiple test notifications
export const createMultipleTestNotifications = async (receiverId) => {
  const testNotifications = [
    {
      title: 'New Message',
      message: 'Dr. Smith sent you a message about your appointment'
    },
    {
      title: 'Appointment Reminder',
      message: 'Your appointment with Dr. Johnson is tomorrow at 2:00 PM'
    },
    {
      title: 'Test Results Available',
      message: 'Your skin analysis results are now available for review'
    }
  ];

  const results = [];
  for (const notification of testNotifications) {
    const result = await createTestNotification(receiverId, notification.title, notification.message);
    if (result) results.push(result);
  }

  return results;
};

