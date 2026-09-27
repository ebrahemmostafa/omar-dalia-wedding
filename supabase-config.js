// Supabase connection shared by index.html (guests submit RSVPs) and rsvps.html (read with the private link).
// The anon/publishable key is safe to publish — access is enforced by the row level
// security policies in supabase/rsvps.sql. Never put the service_role key here.
window.SUPABASE_URL = 'https://jcuqwcwkowtjxcykstlf.supabase.co';
window.SUPABASE_ANON_KEY = ''; // Dashboard → Project Settings → API Keys → anon / publishable key
