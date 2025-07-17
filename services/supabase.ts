import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Pobierz URL i klucz anonimowy z zmiennych środowiskowych
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Utwórz klienta Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Funkcje pomocnicze dla autentykacji
export const auth = {
  // Rejestracja użytkownika
  async signUp(email: string, password: string, userData: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { data, error };
  },

  // Logowanie użytkownika
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Wylogowanie użytkownika
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Pobranie aktualnego użytkownika
  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
  },

  // Pobranie sesji
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  },
};

// Funkcje pomocnicze dla profilu
export const profiles = {
  // Pobranie profilu użytkownika
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { profile: data, error };
  },

  // Aktualizacja profilu użytkownika
  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { profile: data, error };
  },

  // Pobranie historii klubowej
  async getClubHistory(userId: string) {
    const { data, error } = await supabase
      .from('club_history')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });
    return { history: data, error };
  },

  // Dodanie historii klubowej
  async addClubHistory(userId: string, clubData: any) {
    const { data, error } = await supabase
      .from('club_history')
      .insert({
        user_id: userId,
        ...clubData,
      })
      .select()
      .single();
    return { club: data, error };
  },

  // Aktualizacja historii klubowej
  async updateClubHistory(clubId: string, updates: any) {
    const { data, error } = await supabase
      .from('club_history')
      .update(updates)
      .eq('id', clubId)
      .select()
      .single();
    return { club: data, error };
  },

  // Usunięcie historii klubowej
  async deleteClubHistory(clubId: string) {
    const { error } = await supabase
      .from('club_history')
      .delete()
      .eq('id', clubId);
    return { error };
  },
};

// Funkcje pomocnicze dla postów
export const posts = {
  // Pobranie wszystkich postów
  async getPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          avatar_url,
          club
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20);
    return { posts: data, error };
  },

  // Pobranie szczegółów posta
  async getPost(postId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          avatar_url,
          club
        )
      `)
      .eq('id', postId)
      .single();
    return { post: data, error };
  },

  // Dodanie nowego posta
  async addPost(userId: string, postData: any) {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        ...postData,
      })
      .select()
      .single();
    return { post: data, error };
  },

  // Polubienie/odpolubienie posta
  async toggleLike(userId: string, postId: string) {
    // Sprawdź, czy post jest już polubiony
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();

    if (existingLike) {
      // Usuń polubienie
      await supabase
        .from('post_likes')
        .delete()
        .eq('id', existingLike.id);

      // Zmniejsz licznik polubień
      await supabase.rpc('decrement_post_likes', { post_id: postId });

      return { isLiked: false };
    } else {
      // Dodaj polubienie
      await supabase
        .from('post_likes')
        .insert({
          user_id: userId,
          post_id: postId,
        });

      // Zwiększ licznik polubień
      await supabase.rpc('increment_post_likes', { post_id: postId });

      return { isLiked: true };
    }
  },

  // Pobranie komentarzy do posta
  async getComments(postId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          avatar_url,
          club
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });
    return { comments: data, error };
  },

  // Dodanie komentarza
  async addComment(userId: string, postId: string, text: string) {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        post_id: postId,
        text,
      })
      .select()
      .single();

    // Zwiększ licznik komentarzy
    if (!error) {
      await supabase.rpc('increment_post_comments', { post_id: postId });
    }

    return { comment: data, error };
  },
};

// Funkcje pomocnicze dla rynku transferowego
export const market = {
  // Pobranie graczy z rynku
  async getPlayers(filters: any = {}) {
    let query = supabase
      .from('market_players')
      .select('*');

    // Zastosuj filtry
    if (filters.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,club.ilike.%${filters.search}%,position.ilike.%${filters.search}%,country.ilike.%${filters.search}%`);
    }

    if (filters.position && filters.position !== 'all') {
      // Filtrowanie po pozycji
      switch (filters.position) {
        case 'gk':
          query = query.or('position.ilike.%gk%,position.ilike.%bramkarz%');
          break;
        case 'def':
          query = query.or('position.ilike.%def%,position.ilike.%obrońca%,position.ilike.%cb%,position.ilike.%lb%,position.ilike.%rb%');
          break;
        case 'mid':
          query = query.or('position.ilike.%mid%,position.ilike.%pomocnik%,position.ilike.%cm%,position.ilike.%dm%,position.ilike.%am%');
          break;
        case 'att':
          query = query.or('position.ilike.%att%,position.ilike.%napastnik%,position.ilike.%st%,position.ilike.%lw%,position.ilike.%rw%');
          break;
      }
    }

    if (filters.minAge) {
      query = query.gte('age', filters.minAge);
    }

    if (filters.maxAge) {
      query = query.lte('age', filters.maxAge);
    }

    if (filters.country) {
      query = query.ilike('country', `%${filters.country}%`);
    }

    if (filters.club) {
      query = query.ilike('club', `%${filters.club}%`);
    }

    const { data, error } = await query;
    return { players: data, error };
  },

  // Pobranie szczegółów gracza
  async getPlayer(playerId: string) {
    const { data, error } = await supabase
      .from('market_players')
      .select('*')
      .eq('id', playerId)
      .single();
    return { player: data, error };
  },

  // Pobranie obserwowanych graczy
  async getWatchedPlayers(userId: string) {
    const { data, error } = await supabase
      .from('watched_players')
      .select(`
        player_id,
        market_players (*)
      `)
      .eq('user_id', userId);
    return { watchedPlayers: data, error };
  },

  // Sprawdzenie czy gracz jest obserwowany
  async isPlayerWatched(userId: string, playerId: string) {
    const { data, error } = await supabase
      .from('watched_players')
      .select('id')
      .eq('user_id', userId)
      .eq('player_id', playerId)
      .maybeSingle();
    return { isWatched: !!data, error };
  },

  // Przełączenie obserwowania gracza
  async toggleWatchPlayer(userId: string, playerId: string) {
    // Sprawdź, czy gracz jest już obserwowany
    const { isWatched } = await this.isPlayerWatched(userId, playerId);

    if (isWatched) {
      // Usuń z obserwowanych
      const { error } = await supabase
        .from('watched_players')
        .delete()
        .eq('user_id', userId)
        .eq('player_id', playerId);
      return { isWatched: false, error };
    } else {
      // Dodaj do obserwowanych
      const { error } = await supabase
        .from('watched_players')
        .insert({
          user_id: userId,
          player_id: playerId,
        });
      return { isWatched: true, error };
    }
  },
};

// Funkcje pomocnicze dla powiadomień
export const notifications = {
  // Pobranie powiadomień
  async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        sender:sender_id (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    return { notifications: data, error };
  },

  // Oznaczenie powiadomienia jako przeczytane
  async markAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select();
    return { notification: data?.[0], error };
  },

  // Oznaczenie wszystkich powiadomień jako przeczytane
  async markAllAsRead(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    return { success: !error, error };
  },

  // Pobranie liczby nieprzeczytanych powiadomień
  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    return { count: count || 0, error };
  },

  // Pobranie ustawień powiadomień
  async getSettings(userId: string) {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { settings: data, error };
  },

  // Aktualizacja ustawień powiadomień
  async updateSettings(userId: string, settings: any) {
    const { data, error } = await supabase
      .from('notification_settings')
      .update(settings)
      .eq('user_id', userId)
      .select();
    return { settings: data?.[0], error };
  },
};

export default {
  auth,
  profiles,
  posts,
  market,
  notifications,
};