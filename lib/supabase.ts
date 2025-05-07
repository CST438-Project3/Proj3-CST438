import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aoybkwggbrkmrgubmccp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFveWJrd2dnYnJrbXJndWJtY2NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMjE0OTUsImV4cCI6MjA1OTg5NzQ5NX0.GExcZdRPv_Uikpsxw-ay2DzCLnKDNs7eRCGbVE7ie_s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);