-- Drop and recreate unique constraint
ALTER TABLE scores 
  DROP CONSTRAINT IF EXISTS scores_user_id_unique;

ALTER TABLE scores
  ADD CONSTRAINT scores_user_id_unique UNIQUE (user_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Scores are viewable by everyone" ON scores;
DROP POLICY IF EXISTS "Users can insert their own scores" ON scores;
DROP POLICY IF EXISTS "Users can read their own scores" ON scores;
DROP POLICY IF EXISTS "Users can update their own scores" ON scores;
DROP POLICY IF EXISTS "Users can read all scores" ON scores;
DROP POLICY IF EXISTS "Users can read all scores for leaderboard" ON scores;
DROP POLICY IF EXISTS "Users can upsert their own scores" ON scores;

-- Enable RLS
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Create simpler, more permissive policies
CREATE POLICY "Enable read access for authenticated users"
ON scores FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for authenticated users"
ON scores FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access for own scores"
ON scores FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create high score update function
CREATE OR REPLACE FUNCTION update_high_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET high_score = GREATEST(high_score, NEW.score)
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate high score trigger
DROP TRIGGER IF EXISTS update_high_score_trigger ON scores;
CREATE TRIGGER update_high_score_trigger
  AFTER INSERT OR UPDATE ON scores
  FOR EACH ROW
  EXECUTE FUNCTION update_high_score();
