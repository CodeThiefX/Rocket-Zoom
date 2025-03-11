-- Add unique constraint to scores table for user_id
ALTER TABLE scores 
  DROP CONSTRAINT IF EXISTS scores_user_id_unique;

ALTER TABLE scores
  ADD CONSTRAINT scores_user_id_unique UNIQUE (user_id);
