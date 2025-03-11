-- Enable RLS
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Scores are viewable by everyone" ON scores;
DROP POLICY IF EXISTS "Users can insert their own scores" ON scores;
DROP POLICY IF EXISTS "Users can read their own scores" ON scores;
DROP POLICY IF EXISTS "Users can update their own scores" ON scores;
DROP POLICY IF EXISTS "Users can read all scores" ON scores;
DROP POLICY IF EXISTS "Users can read all scores for leaderboard" ON scores;
DROP POLICY IF EXISTS "Users can upsert their own scores" ON scores;

-- Create new policies
CREATE POLICY "Users can upsert their own scores"
ON scores FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read all scores for leaderboard"
ON scores FOR SELECT
TO authenticated
USING (true);
