import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xibeycbazchsawtbtybi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpYmV5Y2JhemNoc2F3dGJ0eWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMDM2OTMsImV4cCI6MjA4NzY3OTY5M30.te4LvJTP6DX5b2rIAq19HFlztX4un3LjNI0NGLbG0e4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const ADMIN_CREDENTIALS = {
  email: 'admin@admin.com',
  password: 'admin123',
};
