/*
  # Schemat początkowy dla Game Profil

  1. Nowe Tabele
    - `profiles` - Dane profilowe użytkowników
    - `club_history` - Historia klubowa zawodników
    - `match_videos` - Filmy meczowe
    - `related_players` - Powiązani gracze
    - `coach_reviews` - Opinie trenerów
    - `posts` - Posty społecznościowe
    - `comments` - Komentarze do postów
    - `matches` - Mecze
    - `notifications` - Powiadomienia
    - `market_players` - Gracze na rynku transferowym
    - `watched_players` - Obserwowani gracze

  2. Security
    - Włączenie RLS dla wszystkich tabel
    - Dodanie polityk dostępu dla uwierzytelnionych użytkowników
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  email text UNIQUE NOT NULL,
  phone text,
  profile_type text,
  club text,
  position text,
  height text,
  country text,
  age text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Club history table
CREATE TABLE IF NOT EXISTS club_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  club_name text NOT NULL,
  start_date text NOT NULL,
  end_date text,
  position text,
  achievements text,
  created_at timestamptz DEFAULT now()
);

-- Match videos table
CREATE TABLE IF NOT EXISTS match_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  video_url text NOT NULL,
  thumbnail_url text,
  duration text DEFAULT '00:00',
  views integer DEFAULT 0,
  upload_date timestamptz DEFAULT now()
);

-- Related players table
CREATE TABLE IF NOT EXISTS related_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  position text,
  club text,
  photo text,
  created_at timestamptz DEFAULT now()
);

-- Coach reviews table
CREATE TABLE IF NOT EXISTS coach_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  coach_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  date timestamptz DEFAULT now(),
  club_name text
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  text text,
  image text,
  video text,
  is_live boolean DEFAULT false,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  text text NOT NULL,
  likes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team text NOT NULL,
  away_team text NOT NULL,
  home_score integer,
  away_score integer,
  date text NOT NULL,
  time text NOT NULL,
  stadium text,
  league text,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
  minute integer,
  round integer,
  referee text,
  attendance integer,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'message', 'mention', 'market', 'registration', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  target_id text,
  target_type text,
  created_at timestamptz DEFAULT now()
);

-- Market players table
CREATE TABLE IF NOT EXISTS market_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  position text NOT NULL,
  age integer NOT NULL,
  club text NOT NULL,
  country text NOT NULL,
  price text NOT NULL,
  rating integer NOT NULL,
  image text,
  height text,
  created_at timestamptz DEFAULT now()
);

-- Watched players table
CREATE TABLE IF NOT EXISTS watched_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  player_id uuid REFERENCES market_players(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, player_id)
);

-- Player stats table
CREATE TABLE IF NOT EXISTS player_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  minutes integer DEFAULT 0,
  matches integer DEFAULT 0,
  goals integer DEFAULT 0,
  assists integer DEFAULT 0,
  yellow_cards integer DEFAULT 0,
  red_cards integer DEFAULT 0,
  clean_sheets integer DEFAULT 0,
  saves integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Coach stats table
CREATE TABLE IF NOT EXISTS coach_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  total_matches integer DEFAULT 0,
  wins integer DEFAULT 0,
  draws integer DEFAULT 0,
  losses integer DEFAULT 0,
  points_per_match numeric(3,2) DEFAULT 0,
  developed_players integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Notification settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  new_message boolean DEFAULT true,
  followers boolean DEFAULT true,
  market_activity boolean DEFAULT true,
  post_reactions boolean DEFAULT true,
  match_updates boolean DEFAULT false,
  club_news boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE related_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE watched_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create policies for club_history
CREATE POLICY "Users can view their own club history" 
  ON club_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own club history" 
  ON club_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own club history" 
  ON club_history FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own club history" 
  ON club_history FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for match_videos
CREATE POLICY "Users can view match videos" 
  ON match_videos FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can insert their own match videos" 
  ON match_videos FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own match videos" 
  ON match_videos FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own match videos" 
  ON match_videos FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for related_players
CREATE POLICY "Users can view related players" 
  ON related_players FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can insert their own related players" 
  ON related_players FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own related players" 
  ON related_players FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own related players" 
  ON related_players FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for coach_reviews
CREATE POLICY "Users can view coach reviews" 
  ON coach_reviews FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Coaches can insert reviews" 
  ON coach_reviews FOR INSERT 
  WITH CHECK (auth.uid() = coach_id);

-- Create policies for posts
CREATE POLICY "Anyone can view posts" 
  ON posts FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own posts" 
  ON posts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
  ON posts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
  ON posts FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for comments
CREATE POLICY "Anyone can view comments" 
  ON comments FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own comments" 
  ON comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
  ON comments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
  ON comments FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for matches
CREATE POLICY "Anyone can view matches" 
  ON matches FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert matches" 
  ON matches FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policies for market_players
CREATE POLICY "Anyone can view market players" 
  ON market_players FOR SELECT 
  USING (true);

-- Create policies for watched_players
CREATE POLICY "Users can view their watched players" 
  ON watched_players FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their watched players" 
  ON watched_players FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their watched players" 
  ON watched_players FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for player_stats
CREATE POLICY "Users can view player stats" 
  ON player_stats FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can update their own player stats" 
  ON player_stats FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policies for coach_stats
CREATE POLICY "Users can view coach stats" 
  ON coach_stats FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can update their own coach stats" 
  ON coach_stats FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policies for notification_settings
CREATE POLICY "Users can view their notification settings" 
  ON notification_settings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notification settings" 
  ON notification_settings FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create trigger to create profile after user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'firstName', new.raw_user_meta_data->>'lastName');
  
  INSERT INTO public.player_stats (user_id)
  VALUES (new.id);
  
  INSERT INTO public.coach_stats (user_id)
  VALUES (new.id);
  
  INSERT INTO public.notification_settings (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create sample data for market players
INSERT INTO market_players (first_name, last_name, position, age, club, country, price, rating, image, height)
VALUES
  ('Piotr', 'Kowalski', 'CM', 22, 'Legia Warszawa', 'Polska', '2.5M €', 78, 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1', '180 cm'),
  ('Michał', 'Nowak', 'ST', 19, 'Cracovia', 'Polska', '1.8M €', 75, 'https://images.pexels.com/photos/1222272/pexels-photo-1222272.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1', '185 cm'),
  ('Adam', 'Zieliński', 'CB', 25, 'Wisła Kraków', 'Polska', '3.2M €', 80, 'https://images.pexels.com/photos/1222273/pexels-photo-1222273.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1', '190 cm'),
  ('Jakub', 'Wójcik', 'GK', 28, 'Jagiellonia', 'Polska', '1.5M €', 82, 'https://images.pexels.com/photos/1222274/pexels-photo-1222274.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1', '192 cm');