import React from 'react';
import { supabase } from '../../supabase';

function CreateAdmin() {
  const createAdmin = async () => {
    console.log("Starting admin creation...");

    const { data, error } = await supabase.auth.signUp({
      email: 'shizaqamar12345@gmail.com',
      password: 'Fyp12345.',
    });

    if (error) {
      console.error('Auth creation error:', error.message);
      return;
    }

    console.log('Signup success:', data);

    const userId = data.user?.id;
    if (!userId) {
      console.error('No user ID returned from Auth.');
      return;
    }

    const { error: insertError } = await supabase.from('users').insert([
      {
        uuid: userId,
        name: 'Admin',
        email: 'shizaqamar12345@gmail.com',
        role: 'admin',
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      console.error('Error inserting into users table:', insertError.message);
    } else {
      console.log('✅ Admin user created and added to users table.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Create Admin</h2>
      <button onClick={createAdmin}>Create Admin Account</button>
    </div>
  );
}

export default CreateAdmin;
