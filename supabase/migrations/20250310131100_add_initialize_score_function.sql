-- Drop existing function first
DROP FUNCTION IF EXISTS initialize_player_score(integer);
DROP FUNCTION IF EXISTS initialize_player_score(integer, uuid);

-- Create function to initialize player score
CREATE OR REPLACE FUNCTION initialize_player_score(initial_score integer, player_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_profile profiles;
  current_score scores;
BEGIN
  -- Get full profile data using provided player_id
  SELECT * INTO current_profile
  FROM profiles
  WHERE id = player_id;
  
  -- Check if profile exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', format('Profile not found for ID: %s', player_id)
    );
  END IF;

  -- Check if score already exists
  SELECT * INTO current_score
  FROM scores
  WHERE user_id = player_id;

  IF FOUND THEN
    -- Return existing score
    RETURN json_build_object(
      'success', true,
      'username', current_profile.username,
      'score', current_score.score
    );
  END IF;

  -- Insert initial score only if no score exists
  INSERT INTO scores (user_id, username, score)
  VALUES (
    player_id, 
    current_profile.username,
    initial_score
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN json_build_object(
    'success', true,
    'username', current_profile.username,
    'score', initial_score
  );
EXCEPTION 
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;
