-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_leaderboard();

CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  leaderboard_data json;
BEGIN
  WITH ranked_scores AS (
    -- First get unique scores per user
    SELECT DISTINCT ON (username) 
      username,
      score
    FROM scores
    ORDER BY username, score DESC
  ),
  top_scores AS (
    -- Then rank them
    SELECT 
      username,
      score,
      ROW_NUMBER() OVER (ORDER BY score DESC) as rank
    FROM ranked_scores
    ORDER BY score DESC
    LIMIT 10
  )
  SELECT json_build_object(
    'success', true,
    'leaderboard', COALESCE(
      (SELECT json_agg(top_scores.*)
       FROM top_scores),
      '[]'::json
    )
  ) INTO leaderboard_data;

  RETURN leaderboard_data;
EXCEPTION 
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_leaderboard() TO authenticated;
GRANT EXECUTE ON FUNCTION get_leaderboard() TO anon;