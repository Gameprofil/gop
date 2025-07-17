/*
  # Funkcje pomocnicze dla Game Profil

  1. Funkcje
    - `get_profile` - Pobiera profil użytkownika
    - `update_profile` - Aktualizuje profil użytkownika
    - `add_club_history` - Dodaje historię klubową
    - `update_club_history` - Aktualizuje historię klubową
    - `delete_club_history` - Usuwa historię klubową
    - `add_match_video` - Dodaje film meczowy
    - `delete_match_video` - Usuwa film meczowy
    - `add_related_player` - Dodaje powiązanego gracza
    - `delete_related_player` - Usuwa powiązanego gracza
    - `add_coach_review` - Dodaje opinię trenera
    - `toggle_watch_player` - Przełącza obserwowanie gracza
    - `is_player_watched` - Sprawdza czy gracz jest obserwowany
*/

-- Funkcja pobierająca profil użytkownika
CREATE OR REPLACE FUNCTION get_profile(user_id uuid)
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM profiles WHERE id = user_id;
$$;

-- Funkcja aktualizująca profil użytkownika
CREATE OR REPLACE FUNCTION update_profile(
  user_id uuid,
  first_name text,
  last_name text,
  phone text,
  club text,
  position text,
  height text,
  country text,
  age text,
  avatar_url text
)
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE profiles
  SET 
    first_name = COALESCE(update_profile.first_name, profiles.first_name),
    last_name = COALESCE(update_profile.last_name, profiles.last_name),
    phone = COALESCE(update_profile.phone, profiles.phone),
    club = COALESCE(update_profile.club, profiles.club),
    position = COALESCE(update_profile.position, profiles.position),
    height = COALESCE(update_profile.height, profiles.height),
    country = COALESCE(update_profile.country, profiles.country),
    age = COALESCE(update_profile.age, profiles.age),
    avatar_url = COALESCE(update_profile.avatar_url, profiles.avatar_url),
    updated_at = now()
  WHERE id = user_id
  RETURNING *;
$$;

-- Funkcja dodająca historię klubową
CREATE OR REPLACE FUNCTION add_club_history(
  user_id uuid,
  club_name text,
  start_date text,
  end_date text,
  position text,
  achievements text
)
RETURNS SETOF club_history
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO club_history (user_id, club_name, start_date, end_date, position, achievements)
  VALUES (user_id, club_name, start_date, end_date, position, achievements)
  RETURNING *;
$$;

-- Funkcja aktualizująca historię klubową
CREATE OR REPLACE FUNCTION update_club_history(
  history_id uuid,
  club_name text,
  start_date text,
  end_date text,
  position text,
  achievements text
)
RETURNS SETOF club_history
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE club_history
  SET 
    club_name = COALESCE(update_club_history.club_name, club_history.club_name),
    start_date = COALESCE(update_club_history.start_date, club_history.start_date),
    end_date = update_club_history.end_date,
    position = COALESCE(update_club_history.position, club_history.position),
    achievements = update_club_history.achievements
  WHERE id = history_id
  RETURNING *;
$$;

-- Funkcja usuwająca historię klubową
CREATE OR REPLACE FUNCTION delete_club_history(history_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM club_history WHERE id = history_id;
  RETURN FOUND;
END;
$$;

-- Funkcja dodająca film meczowy
CREATE OR REPLACE FUNCTION add_match_video(
  user_id uuid,
  title text,
  video_url text,
  thumbnail_url text
)
RETURNS SETOF match_videos
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO match_videos (user_id, title, video_url, thumbnail_url)
  VALUES (user_id, title, video_url, thumbnail_url)
  RETURNING *;
$$;

-- Funkcja usuwająca film meczowy
CREATE OR REPLACE FUNCTION delete_match_video(video_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM match_videos WHERE id = video_id;
  RETURN FOUND;
END;
$$;

-- Funkcja dodająca powiązanego gracza
CREATE OR REPLACE FUNCTION add_related_player(
  user_id uuid,
  name text,
  position text,
  club text,
  photo text
)
RETURNS SETOF related_players
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO related_players (user_id, name, position, club, photo)
  VALUES (user_id, name, position, club, photo)
  RETURNING *;
$$;

-- Funkcja usuwająca powiązanego gracza
CREATE OR REPLACE FUNCTION delete_related_player(player_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM related_players WHERE id = player_id;
  RETURN FOUND;
END;
$$;

-- Funkcja dodająca opinię trenera
CREATE OR REPLACE FUNCTION add_coach_review(
  coach_id uuid,
  player_id uuid,
  rating integer,
  comment text,
  club_name text
)
RETURNS SETOF coach_reviews
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  coach_name text;
  v_result coach_reviews;
BEGIN
  -- Get coach name
  SELECT first_name || ' ' || last_name INTO coach_name
  FROM profiles
  WHERE id = coach_id;
  
  -- Insert review
  INSERT INTO coach_reviews (coach_id, player_id, coach_name, rating, comment, club_name)
  VALUES (coach_id, player_id, coach_name, rating, comment, club_name)
  RETURNING * INTO v_result;
  
  RETURN NEXT v_result;
END;
$$;

-- Funkcja przełączająca obserwowanie gracza
CREATE OR REPLACE FUNCTION toggle_watch_player(
  user_id uuid,
  player_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_watched boolean;
BEGIN
  -- Check if player is already watched
  SELECT EXISTS (
    SELECT 1 FROM watched_players
    WHERE user_id = toggle_watch_player.user_id AND player_id = toggle_watch_player.player_id
  ) INTO is_watched;
  
  IF is_watched THEN
    -- Remove from watched
    DELETE FROM watched_players
    WHERE user_id = toggle_watch_player.user_id AND player_id = toggle_watch_player.player_id;
    RETURN false;
  ELSE
    -- Add to watched
    INSERT INTO watched_players (user_id, player_id)
    VALUES (toggle_watch_player.user_id, toggle_watch_player.player_id);
    RETURN true;
  END IF;
END;
$$;

-- Funkcja sprawdzająca czy gracz jest obserwowany
CREATE OR REPLACE FUNCTION is_player_watched(
  user_id uuid,
  player_id uuid
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM watched_players
    WHERE user_id = is_player_watched.user_id AND player_id = is_player_watched.player_id
  );
$$;

-- Funkcja dodająca post
CREATE OR REPLACE FUNCTION add_post(
  user_id uuid,
  text text,
  image text,
  video text,
  is_live boolean
)
RETURNS SETOF posts
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO posts (user_id, text, image, video, is_live)
  VALUES (user_id, text, image, video, is_live)
  RETURNING *;
$$;

-- Funkcja dodająca komentarz
CREATE OR REPLACE FUNCTION add_comment(
  user_id uuid,
  post_id uuid,
  text text
)
RETURNS SETOF comments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result comments;
BEGIN
  -- Insert comment
  INSERT INTO comments (user_id, post_id, text)
  VALUES (user_id, post_id, text)
  RETURNING * INTO v_result;
  
  -- Update post comments count
  UPDATE posts
  SET comments = comments + 1
  WHERE id = post_id;
  
  RETURN NEXT v_result;
END;
$$;

-- Funkcja przełączająca polubienie posta
CREATE OR REPLACE FUNCTION toggle_like_post(
  user_id uuid,
  post_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_liked boolean;
BEGIN
  -- Check if post is already liked
  SELECT EXISTS (
    SELECT 1 FROM post_likes
    WHERE user_id = toggle_like_post.user_id AND post_id = toggle_like_post.post_id
  ) INTO is_liked;
  
  IF is_liked THEN
    -- Remove like
    DELETE FROM post_likes
    WHERE user_id = toggle_like_post.user_id AND post_id = toggle_like_post.post_id;
    
    -- Update post likes count
    UPDATE posts
    SET likes = likes - 1
    WHERE id = post_id;
    
    RETURN false;
  ELSE
    -- Add like
    INSERT INTO post_likes (user_id, post_id)
    VALUES (toggle_like_post.user_id, toggle_like_post.post_id);
    
    -- Update post likes count
    UPDATE posts
    SET likes = likes + 1
    WHERE id = post_id;
    
    RETURN true;
  END IF;
END;
$$;

-- Funkcja przełączająca polubienie komentarza
CREATE OR REPLACE FUNCTION toggle_like_comment(
  user_id uuid,
  comment_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_liked boolean;
BEGIN
  -- Check if comment is already liked
  SELECT EXISTS (
    SELECT 1 FROM comment_likes
    WHERE user_id = toggle_like_comment.user_id AND comment_id = toggle_like_comment.comment_id
  ) INTO is_liked;
  
  IF is_liked THEN
    -- Remove like
    DELETE FROM comment_likes
    WHERE user_id = toggle_like_comment.user_id AND comment_id = toggle_like_comment.comment_id;
    
    -- Update comment likes count
    UPDATE comments
    SET likes = likes - 1
    WHERE id = comment_id;
    
    RETURN false;
  ELSE
    -- Add like
    INSERT INTO comment_likes (user_id, comment_id)
    VALUES (toggle_like_comment.user_id, toggle_like_comment.comment_id);
    
    -- Update comment likes count
    UPDATE comments
    SET likes = likes + 1
    WHERE id = comment_id;
    
    RETURN true;
  END IF;
END;
$$;

-- Funkcja dodająca powiadomienie
CREATE OR REPLACE FUNCTION add_notification(
  user_id uuid,
  type text,
  title text,
  message text,
  sender_id uuid,
  target_id text,
  target_type text
)
RETURNS SETOF notifications
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO notifications (user_id, type, title, message, sender_id, target_id, target_type)
  VALUES (user_id, type, title, message, sender_id, target_id, target_type)
  RETURNING *;
$$;

-- Funkcja oznaczająca wszystkie powiadomienia jako przeczytane
CREATE OR REPLACE FUNCTION mark_all_notifications_read(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE notifications
  SET is_read = true
  WHERE user_id = mark_all_notifications_read.user_id AND is_read = false;
  
  RETURN FOUND;
END;
$$;

-- Funkcja aktualizująca ustawienia powiadomień
CREATE OR REPLACE FUNCTION update_notification_settings(
  user_id uuid,
  new_message boolean,
  followers boolean,
  market_activity boolean,
  post_reactions boolean,
  match_updates boolean,
  club_news boolean
)
RETURNS SETOF notification_settings
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE notification_settings
  SET 
    new_message = COALESCE(update_notification_settings.new_message, notification_settings.new_message),
    followers = COALESCE(update_notification_settings.followers, notification_settings.followers),
    market_activity = COALESCE(update_notification_settings.market_activity, notification_settings.market_activity),
    post_reactions = COALESCE(update_notification_settings.post_reactions, notification_settings.post_reactions),
    match_updates = COALESCE(update_notification_settings.match_updates, notification_settings.match_updates),
    club_news = COALESCE(update_notification_settings.club_news, notification_settings.club_news),
    updated_at = now()
  WHERE user_id = update_notification_settings.user_id
  RETURNING *;
$$;

-- Funkcja dodająca mecz
CREATE OR REPLACE FUNCTION add_match(
  created_by uuid,
  home_team text,
  away_team text,
  date text,
  time text,
  stadium text,
  league text
)
RETURNS SETOF matches
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO matches (created_by, home_team, away_team, date, time, stadium, league)
  VALUES (created_by, home_team, away_team, date, time, stadium, league)
  RETURNING *;
$$;

-- Funkcja aktualizująca statystyki gracza
CREATE OR REPLACE FUNCTION update_player_stats(
  user_id uuid,
  minutes integer,
  matches integer,
  goals integer,
  assists integer,
  yellow_cards integer,
  red_cards integer,
  clean_sheets integer,
  saves integer
)
RETURNS SETOF player_stats
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE player_stats
  SET 
    minutes = COALESCE(update_player_stats.minutes, player_stats.minutes),
    matches = COALESCE(update_player_stats.matches, player_stats.matches),
    goals = COALESCE(update_player_stats.goals, player_stats.goals),
    assists = COALESCE(update_player_stats.assists, player_stats.assists),
    yellow_cards = COALESCE(update_player_stats.yellow_cards, player_stats.yellow_cards),
    red_cards = COALESCE(update_player_stats.red_cards, player_stats.red_cards),
    clean_sheets = COALESCE(update_player_stats.clean_sheets, player_stats.clean_sheets),
    saves = COALESCE(update_player_stats.saves, player_stats.saves),
    updated_at = now()
  WHERE user_id = update_player_stats.user_id
  RETURNING *;
$$;

-- Funkcja aktualizująca statystyki trenera
CREATE OR REPLACE FUNCTION update_coach_stats(
  user_id uuid,
  total_matches integer,
  wins integer,
  draws integer,
  losses integer,
  points_per_match numeric,
  developed_players integer
)
RETURNS SETOF coach_stats
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE coach_stats
  SET 
    total_matches = COALESCE(update_coach_stats.total_matches, coach_stats.total_matches),
    wins = COALESCE(update_coach_stats.wins, coach_stats.wins),
    draws = COALESCE(update_coach_stats.draws, coach_stats.draws),
    losses = COALESCE(update_coach_stats.losses, coach_stats.losses),
    points_per_match = COALESCE(update_coach_stats.points_per_match, coach_stats.points_per_match),
    developed_players = COALESCE(update_coach_stats.developed_players, coach_stats.developed_players),
    updated_at = now()
  WHERE user_id = update_coach_stats.user_id
  RETURNING *;
$$;