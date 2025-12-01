-- Add template field to journal_entries table
ALTER TABLE public.journal_entries 
ADD COLUMN IF NOT EXISTS template text DEFAULT 'minimal' CHECK (template IN ('minimal', 'classic', 'scrapbook', 'vintage', 'handwritten', 'polaroid'));