-- Add new columns to profiles table for user preferences
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS language_preference text DEFAULT 'en',
ADD COLUMN IF NOT EXISTS notifications_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS secret_lock_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS lock_pin text;

-- Add is_private column to journal_entries
ALTER TABLE public.journal_entries
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false;

-- Create future_messages table for scheduled messages
CREATE TABLE IF NOT EXISTS public.future_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  scheduled_date timestamp with time zone NOT NULL,
  is_sent boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on future_messages
ALTER TABLE public.future_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for future_messages
CREATE POLICY "Users can view own future messages"
ON public.future_messages
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own future messages"
ON public.future_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own future messages"
ON public.future_messages
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own future messages"
ON public.future_messages
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at on future_messages
CREATE TRIGGER update_future_messages_updated_at
BEFORE UPDATE ON public.future_messages
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();