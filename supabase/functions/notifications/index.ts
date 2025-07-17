// Supabase Edge Function: notifications
// Obsługuje operacje na powiadomieniach

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Pobierz aktualnego użytkownika
    const { data: { user } } = await supabaseClient.auth.getUser()
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Nie znaleziono użytkownika' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const path = url.pathname.split('/')
    const endpoint = path[path.length - 1]
    const notificationId = endpoint !== 'notifications' && endpoint !== 'settings' && endpoint !== 'read-all' && endpoint !== 'count' && endpoint !== 'register-device' ? path[path.length - 2] : null

    // Obsługa różnych metod HTTP
    if (req.method === 'GET') {
      if (endpoint === 'notifications' || endpoint === '') {
        // Pobierz powiadomienia
        const { data, error } = await supabaseClient
          .from('notifications')
          .select(`
            *,
            sender:sender_id (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)
        
        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Przekształć dane do oczekiwanego formatu
        const formattedNotifications = data.map(notification => ({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          timestamp: formatTimestamp(notification.created_at),
          isRead: notification.is_read,
          data: {
            senderId: notification.sender_id,
            senderName: notification.sender ? `${notification.sender.first_name} ${notification.sender.last_name}` : undefined,
            senderAvatar: notification.sender?.avatar_url,
            targetId: notification.target_id,
            targetType: notification.target_type
          }
        }))

        return new Response(
          JSON.stringify({ notifications: formattedNotifications }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else if (endpoint === 'settings') {
        // Pobierz ustawienia powiadomień
        const { data, error } = await supabaseClient
          .from('notification_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (error && error.code !== 'PGRST116') {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Jeśli nie ma ustawień, zwróć domyślne
        const settings = data || {
          new_message: true,
          followers: true,
          market_activity: true,
          post_reactions: true,
          match_updates: false,
          club_news: false
        }

        return new Response(
          JSON.stringify({ settings }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else if (endpoint === 'count') {
        // Pobierz liczbę nieprzeczytanych powiadomień
        const { count, error } = await supabaseClient
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false)
        
        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ count: count || 0 }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else if (req.method === 'POST') {
      if (endpoint === 'read-all') {
        // Oznacz wszystkie powiadomienia jako przeczytane
        const { data, error } = await supabaseClient.rpc(
          'mark_all_notifications_read',
          {
            user_id: user.id
          }
        )
        
        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else if (endpoint === 'register-device') {
        // Zarejestruj token urządzenia
        const { pushToken, deviceType } = await req.json()
        
        const { data, error } = await supabaseClient.rpc(
          'register_device_token',
          {
            user_id: user.id,
            token: pushToken,
            device_type: deviceType || 'unknown'
          }
        )
        
        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else if (endpoint === 'read' && notificationId) {
        // Oznacz powiadomienie jako przeczytane
        const { data, error } = await supabaseClient
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId)
          .eq('user_id', user.id)
        
        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else if (req.method === 'PUT' && endpoint === 'settings') {
      // Aktualizuj ustawienia powiadomień
      const { settings } = await req.json()
      
      const { data, error } = await supabaseClient.rpc(
        'update_notification_settings',
        {
          user_id: user.id,
          new_message: settings.newMessage,
          followers: settings.followers,
          market_activity: settings.marketActivity,
          post_reactions: settings.postReactions,
          match_updates: settings.matchUpdates,
          club_news: settings.clubNews
        }
      )
      
      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ settings: data[0] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Metoda nie obsługiwana' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Funkcja pomocnicza do formatowania timestampu
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) {
    return 'teraz'
  } else if (diffMin < 60) {
    return `${diffMin} min. temu`
  } else if (diffHour < 24) {
    return `${diffHour} godz. temu`
  } else if (diffDay < 7) {
    return `${diffDay} dni temu`
  } else {
    return date.toLocaleDateString('pl-PL')
  }
}