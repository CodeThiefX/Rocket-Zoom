-- Add wallet_address column to profiles table if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS wallet_address text;

-- Remove existing constraint if it exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS wallet_address_format;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS unique_wallet_address;

-- Add check constraint with custom error message
ALTER TABLE public.profiles
ADD CONSTRAINT wallet_address_format CHECK (
  wallet_address IS NULL OR -- Allow NULL for existing users
  (LENGTH(wallet_address) BETWEEN 32 AND 44)
) NOT VALID;

-- Add custom error message function
CREATE OR REPLACE FUNCTION check_wallet_address()
RETURNS trigger AS $$
BEGIN
  IF NEW.wallet_address IS NOT NULL AND (LENGTH(NEW.wallet_address) < 32 OR LENGTH(NEW.wallet_address) > 44) THEN
    RAISE EXCEPTION 'Wallet address must be between 32 and 44 characters long';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for custom error message
DROP TRIGGER IF EXISTS wallet_address_check ON public.profiles;
CREATE TRIGGER wallet_address_check
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION check_wallet_address();

-- Add unique constraint
ALTER TABLE public.profiles
ADD CONSTRAINT unique_wallet_address UNIQUE (wallet_address);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.wallet_address IS 'Solana wallet address for token airdrop. Cannot be changed after registration.';
