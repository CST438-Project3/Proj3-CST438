-- Add username column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Update RLS policies to allow users to update their username
CREATE POLICY "Users can update their username" ON public.users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id); 