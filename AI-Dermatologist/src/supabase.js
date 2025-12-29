// src/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://samcltinlezskyblejee.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhbWNsdGlubGV6c2t5YmxlamVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MTc5MzEsImV4cCI6MjA2MjE5MzkzMX0.KEuVzTK7vaQXSV__bCHKaJkl8e0Zz5G-cczqzruT-P8';


// export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      
      persistSession: true, //  disables session persistence
      autoRefreshToken:true,
     

    },
  });


  