-- Add columns for PIN rate limiting
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS pin_failed_attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pin_locked_until timestamp with time zone DEFAULT NULL;