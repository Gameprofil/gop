/*
  # Aktualizacja parametrów position na player_position

  1. Zmiany
    - Zmiana nazwy parametru `position` na `player_position` w sygnaturach funkcji
    - Dodanie cudzysłowów do odwołań do kolumny "position" w SQL
    - Zaktualizowanie odwołań do parametrów w treściach funkcji
*/

-- Aktualizacja funkcji update_profile
CREATE OR REPLACE FUNCTION update_profile(
  user_id uuid,
  first_name text,
  last_name text,
  phone text,
  club text,
  player_position text,
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
    "position" = COALESCE(update_profile.player_position, profiles."position"),
    height = COALESCE(update_profile.height, profiles.height),
    country = COALESCE(update_profile.country, profiles.country),
    age = COALESCE(update_profile.age, profiles.age),
    avatar_url = COALESCE(update_profile.avatar_url, profiles.avatar_url),
    updated_at = now()
  WHERE id = user_id
  RETURNING *;
$$;

-- Aktualizacja funkcji add_club_history
CREATE OR REPLACE FUNCTION add_club_history(
  user_id uuid,
  club_name text,
  start_date text,
  end_date text,
  player_position text,
  achievements text
)
RETURNS SETOF club_history
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO club_history (user_id, club_name, start_date, end_date, "position", achievements)
  VALUES (user_id, club_name, start_date, end_date, player_position, achievements)
  RETURNING *;
$$;

-- Aktualizacja funkcji update_club_history
CREATE OR REPLACE FUNCTION update_club_history(
  history_id uuid,
  club_name text,
  start_date text,
  end_date text,
  player_position text,
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
    "position" = COALESCE(update_club_history.player_position, club_history."position"),
    achievements = update_club_history.achievements
  WHERE id = history_id
  RETURNING *;
$$;

-- Aktualizacja funkcji add_related_player
CREATE OR REPLACE FUNCTION add_related_player(
  user_id uuid,
  name text,
  player_position text,
  club text,
  photo text
)
RETURNS SETOF related_players
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO related_players (user_id, name, "position", club, photo)
  VALUES (user_id, name, player_position, club, photo)
  RETURNING *;
$$;