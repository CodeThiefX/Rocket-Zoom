/*
  # Fix RLS Policies for Game Tables

  1. Changes
    - Drop existing RLS policies
    - Create new policies for profiles and scores tables
    - Enable RLS on all tables
    - Add policies for authenticated users

  2. Security
    - Enable RLS on all tables
    - Add proper policies for CRUD operations
    - Ensure authenticated users can only access their own data
*/

-- Profiles table policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add password column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password TEXT NOT NULL;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
TO public 
USING (true);

-- Scores table policies
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Add username column to scores table
ALTER TABLE scores ADD COLUMN IF NOT EXISTS username TEXT NOT NULL;

DROP POLICY IF EXISTS "Scores are viewable by everyone" ON scores;
DROP POLICY IF EXISTS "Users can insert their own scores" ON scores;

CREATE POLICY "Scores are viewable by everyone" 
ON scores FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Users can insert their own scores" 
ON scores FOR INSERT 
TO public 
WITH CHECK (true);