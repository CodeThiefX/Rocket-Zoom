/*
  # Initial Schema Setup for Rocket Game

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Maps to auth.users
      - `username` (text, unique)
      - `high_score` (integer)
      - `created_at` (timestamp)
    
    - `game_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `score` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE NOT NULL,
  high_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  score integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read all users for leaderboard"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own game sessions"
  ON game_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own game sessions"
  ON game_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);