import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tukdtlbriinmwcqeknez.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1a2R0bGJyaWlubXdjcWVrbmV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2OTk1OTIsImV4cCI6MjA4NjI3NTU5Mn0.CAC3udOekr1mbBGA36R93m9idCQjtL5hbYtu45NEmnk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const ADMIN_CREDENTIALS = {
  email: 'admin@admin.com',
  password: 'admin123',
};
