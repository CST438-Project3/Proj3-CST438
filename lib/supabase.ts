// CONFIG FILE FOR SUPABASE DB

import { createClient } from '@supabase/supabase-js'

// const SUPABASE_URL = 'https://supabase.com/dashboard/project/aoybkwggbrkmrgubmccp'
const SUPABASE_URL = 'https://aoybkwggbrkmrgubmccp.supabase.co'

// KEYS

// anon public --- public API key suitable for client-side applications
//const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFveWJrd2dnYnJrbXJndWJtY2NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMjE0OTUsImV4cCI6MjA1OTg5NzQ5NX0.GExcZdRPv_Uikpsxw-ay2DzCLnKDNs7eRCGbVE7ie_s'

// service role --- secret key with elevated privileges, intended for server-side use only
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFveWJrd2dnYnJrbXJndWJtY2NwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDMyMTQ5NSwiZXhwIjoyMDU5ODk3NDk1fQ.VECoUF1zCg-bCs9TP-53rlJbBM23YHY0-zGi3LEEmT8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)