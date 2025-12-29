const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://samcltinlezskyblejee.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhbWNsdGlubGV6c2t5YmxlamVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MTc5MzEsImV4cCI6MjA2MjE5MzkzMX0.KEuVzTK7vaQXSV__bCHKaJkl8e0Zz5G-cczqzruT-P8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = { supabase };
