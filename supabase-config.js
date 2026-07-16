const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bqyprnrfbsavysdwgbko.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxeXBybnJmYnNhdnlzZHdnYmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMjM0NTIsImV4cCI6MjA5OTY5OTQ1Mn0.nO3vCVfuu8NmcSlONP2bcoOWUR9bmJoEe3MKBOreKBY';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxeXBybnJmYnNhdnlzZHdnYmtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDEyMzQ1MiwiZXhwIjoyMDk5Njk5NDUyfQ.Zztc5rFIHIkuKauvcYSr13EWZqqlYzfkpR-zCLqowmE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

module.exports = { supabase, supabaseAdmin, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY };
