-- Add theme preference columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light',
ADD COLUMN IF NOT EXISTS is_seasonal_theme_enabled BOOLEAN DEFAULT false;

-- Update RLS policies to allow users to update their theme preferences
CREATE POLICY "Users can update their theme preferences" ON public.users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id); 