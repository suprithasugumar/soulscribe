-- Update daily prompts table to have better default prompts
DELETE FROM daily_prompts;

INSERT INTO daily_prompts (prompt_text, category) VALUES
('How was your day today?', 'daily'),
('Tell me about your day', 'daily'),
('What made you smile today?', 'positive'),
('What are you grateful for?', 'gratitude');

-- Add more theme and font options to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme_variant text DEFAULT 'default';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS font_size text DEFAULT 'medium';