/*
  # Dodatkowe tabele dla Game Profil

  1. Nowe Tabele
    - `post_likes` - Polubienia postów
    - `comment_likes` - Polubienia komentarzy
    - `device_tokens` - Tokeny urządzeń do powiadomień push

  2. Security
    - Włączenie RLS dla wszystkich tabel
    - Dodanie polityk dostępu dla uwierzytelnionych użytkowników
*/

-- Post likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Comment likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

-- Device tokens table
CREATE TABLE IF NOT EXISTS device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  token text NOT NULL,
  device_type text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, token)
);

-- Enable Row Level Security
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for post_likes
CREATE POLICY "Users can view post likes" 
  ON post_likes FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can insert their own post likes" 
  ON post_likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own post likes" 
  ON post_likes FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for comment_likes
CREATE POLICY "Users can view comment likes" 
  ON comment_likes FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can insert their own comment likes" 
  ON comment_likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment likes" 
  ON comment_likes FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for device_tokens
CREATE POLICY "Users can view their own device tokens" 
  ON device_tokens FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own device tokens" 
  ON device_tokens FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own device tokens" 
  ON device_tokens FOR DELETE 
  USING (auth.uid() = user_id);

-- Funkcja rejestrująca token urządzenia
CREATE OR REPLACE FUNCTION register_device_token(
  user_id uuid,
  token text,
  device_type text
)
RETURNS SETOF device_tokens
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete existing token if it exists
  DELETE FROM device_tokens
  WHERE token = register_device_token.token;
  
  -- Insert new token
  RETURN QUERY
  INSERT INTO device_tokens (user_id, token, device_type)
  VALUES (user_id, token, device_type)
  RETURNING *;
END;
$$;