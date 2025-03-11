/*
  # Update Game Schema

  1. Changes
    - Add indexes for better query performance
    - Add constraint to ensure non-negative scores
    - Add trigger to update profiles high_score automatically

  2. Security
    - Existing RLS policies are maintained
    - Added additional constraints for data integrity
*/

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
CREATE INDEX IF NOT EXISTS scores_user_id_idx ON scores(user_id);
CREATE INDEX IF NOT EXISTS scores_created_at_idx ON scores(created_at);

-- Add constraint to ensure non-negative scores
ALTER TABLE scores ADD CONSTRAINT positive_score CHECK (score >= 0);
ALTER TABLE profiles ADD CONSTRAINT positive_high_score CHECK (high_score >= 0);

-- Create function to update high score
CREATE OR REPLACE FUNCTION update_high_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET high_score = GREATEST(high_score, NEW.score)
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update high score
DROP TRIGGER IF EXISTS update_high_score_trigger ON scores;
CREATE TRIGGER update_high_score_trigger
  AFTER INSERT ON scores
  FOR EACH ROW
  EXECUTE FUNCTION update_high_score();