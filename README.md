# Game Profil - Backend

Backend dla aplikacji Game Profil zbudowany na Supabase.

## Struktura projektu

- `supabase/migrations/` - Pliki migracji bazy danych
- `supabase/functions/` - Edge Functions (serverless)

## Tabele bazy danych

- `profiles` - Profile użytkowników
- `club_history` - Historia klubowa
- `match_videos` - Filmy meczowe
- `related_players` - Powiązani gracze
- `coach_reviews` - Opinie trenerów
- `posts` - Posty społecznościowe
- `comments` - Komentarze do postów
- `matches` - Mecze
- `notifications` - Powiadomienia
- `market_players` - Gracze na rynku transferowym
- `watched_players` - Obserwowani gracze
- `player_stats` - Statystyki graczy
- `coach_stats` - Statystyki trenerów
- `notification_settings` - Ustawienia powiadomień
- `post_likes` - Polubienia postów
- `comment_likes` - Polubienia komentarzy
- `device_tokens` - Tokeny urządzeń do powiadomień push

## Edge Functions

- `auth` - Obsługa autentykacji (logowanie, rejestracja, weryfikacja)
- `profile` - Operacje na profilach użytkowników
- `club-history` - Zarządzanie historią klubową
- `market` - Operacje na rynku transferowym
- `posts` - Zarządzanie postami i komentarzami
- `notifications` - Obsługa powiadomień
- `matches` - Zarządzanie meczami

## Jak połączyć z aplikacją

1. Utwórz projekt w Supabase
2. Uruchom migracje z katalogu `supabase/migrations/`
3. Wdróż Edge Functions z katalogu `supabase/functions/`
4. Zaktualizuj plik `.env` w projekcie aplikacji:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=https://your-project-id.supabase.co/functions/v1
```

5. Zaimportuj klienta Supabase w aplikacji:

```typescript
import { supabase, auth, profiles, posts, market, notifications } from '@/services/supabase';
```

## Przykłady użycia

### Autentykacja

```typescript
// Rejestracja
const { data, error } = await auth.signUp(email, password, {
  firstName,
  lastName,
  phone,
  profileType
});

// Logowanie
const { data, error } = await auth.signIn(email, password);

// Wylogowanie
await auth.signOut();
```

### Profil

```typescript
// Pobranie profilu
const { profile, error } = await profiles.getProfile(userId);

// Aktualizacja profilu
const { profile, error } = await profiles.updateProfile(userId, {
  first_name: 'Jan',
  last_name: 'Kowalski'
});

// Pobranie historii klubowej
const { history, error } = await profiles.getClubHistory(userId);
```

### Posty

```typescript
// Pobranie postów
const { posts, error } = await posts.getPosts();

// Dodanie posta
const { post, error } = await posts.addPost(userId, {
  text: 'Treść posta',
  image: 'url_do_obrazka'
});

// Polubienie posta
const { isLiked } = await posts.toggleLike(userId, postId);
```

### Rynek transferowy

```typescript
// Pobranie graczy
const { players, error } = await market.getPlayers({
  search: 'Kowalski',
  position: 'mid'
});

// Obserwowanie gracza
const { isWatched, error } = await market.toggleWatchPlayer(userId, playerId);
```

### Powiadomienia

```typescript
// Pobranie powiadomień
const { notifications, error } = await notifications.getNotifications(userId);

// Oznaczenie jako przeczytane
await notifications.markAsRead(notificationId);

// Aktualizacja ustawień
await notifications.updateSettings(userId, {
  new_message: true,
  followers: true
});
```