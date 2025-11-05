-- Add security question fields for PIN recovery
ALTER TABLE profiles 
ADD COLUMN security_question TEXT,
ADD COLUMN security_answer_hash TEXT;

-- Add comment for clarity
COMMENT ON COLUMN profiles.security_question IS 'User-defined security question for PIN recovery';
COMMENT ON COLUMN profiles.security_answer_hash IS 'SHA-256 hash of the security answer';