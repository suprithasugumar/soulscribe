-- Add new column for hashed PINs
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lock_pin_hash TEXT;

-- Create index on lock_pin_hash for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_lock_pin_hash ON profiles(lock_pin_hash);

-- Note: Existing PINs in lock_pin column will need to be migrated by users
-- The app will prompt users to re-enter their PIN which will be hashed
