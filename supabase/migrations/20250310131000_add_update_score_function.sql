-- Drop existing function first
DROP FUNCTION IF EXISTS update_player_score(integer);

-- Create function to update player score
CREATE OR REPLACE FUNCTION update_player_score(player_score integer, player_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_profile profiles;
BEGIN
  -- Get the full profile using provided player_id
  SELECT * INTO current_profile
  FROM profiles
  WHERE id = player_id;
  
  -- Check if profile exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', format('Profile not found for user ID: %s', player_id::text)
    );
  END IF;

  -- Update score
  INSERT INTO scores (user_id, username, score)
  VALUES (
    player_id,
    current_profile.username,
    player_score
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    score = EXCLUDED.score,
    username = current_profile.username;
  
  RETURN json_build_object(
    'success', true,
    'username', current_profile.username,
    'score', player_score
  );
END;
$$;
