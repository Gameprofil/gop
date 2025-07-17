// Supabase Edge Function: market
// Obsługuje operacje na rynku transferowym

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
    const playerId = endpoint !== 'market' && endpoint !== 'players' && endpoint !== 'watched' && endpoint !== 'is-watched' ? endpoint : null

    // Obsługa różnych metod HTTP
    if (req.method === 'GET') {
      if (endpoint === 'players' || endpoint === 'market') {
        // Pobierz graczy z rynku
        const searchQuery = url.searchParams.get('search') || ''
        const positionFilter = url.searchParams.get('position') || ''
        
        let query = supabaseClient
          .from('market_players')
          .select('*')
        
        if (searchQuery) {
          query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,club.ilike.%${searchQuery}%,position.ilike.%${searchQuery}%,country.ilike.%${searchQuery}%`)
        }
        
        if (positionFilter && positionFilter !== 'all') {
          // Filtrowanie po pozycji
          switch (positionFilter) {
            case 'gk':
              query = query.or('position.ilike.%gk%,position.ilike.%bramkarz%')
              break
            case 'def':
              query = query.or('position.ilike.%def%,position.ilike.%obrońca%,position.ilike.%cb%,position.ilike.%lb%,position.ilike.%rb%')
              break
            case 'mid':
              query = query.or('position.ilike.%mid%,position.ilike.%pomocnik%,position.ilike.%cm%,position.ilike.%dm%,position.ilike.%am%')
              break
            case 'att':
              query = query.or('position.ilike.%att%,position.ilike.%napastnik%,position.ilike.%st%,position.ilike.%lw%,position.ilike.%rw%')
              break
          }
        }
        
        const { data, error } = await query
        
        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Sprawdź, którzy gracze są obserwowani przez użytkownika
        const { data: watchedData, error: watchedError } = await supabaseClient
          .from('watched_players')
          .select('player_id')
          .eq('user_id', user.id)
        
        if (watchedError) {
          return new Response(
            JSON.stringify({ error: watchedError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const watchedPlayerIds = watchedData.map(item => item.player_id)
        
        // Dodaj flagę isWatched do każdego gracza
        const playersWithWatchStatus = data.map(player => ({
          ...player,
          isWatched: watchedPlayerIds.includes(player.id)
        }))

        return new Response(
          JSON.stringify({ players: playersWithWatchStatus }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else if (endpoint === 'watched') {
        // Pobierz obserwowanych graczy
        const { data, error } = await supabaseClient
          .from('watched_players')
          .select(`
            player_id,
            market_players (*)
          `)
          .eq('user_id', user.id)
        
        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Przekształć dane do oczekiwanego formatu
        const watchedPlayers = data.map(item => ({
          ...item.market_players,
          isWatched: true
        }))

        return new Response(
          JSON.stringify({ watchedPlayers }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else if (endpoint === 'is-watched' && playerId) {
        // Sprawdź czy gracz jest obserwowany
        const { data, error } = await supabaseClient.rpc(
          'is_player_watched',
          {
            user_id: user.id,
            player_id: playerId
          }
        )
        
        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ isWatched: data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else if (playerId) {
        // Pobierz szczegóły gracza
        const { data, error } = await supabaseClient
          .from('market_players')
          .select('*')
          .eq('id', playerId)
          .single()
        
        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Sprawdź czy gracz jest obserwowany
        const { data: isWatchedData, error: isWatchedError } = await supabaseClient.rpc(
          'is_player_watched',
          {
            user_id: user.id,
            player_id: playerId
          }
        )
        
        if (isWatchedError) {
          return new Response(
            JSON.stringify({ error: isWatchedError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ 
            player: {
              ...data,
              isWatched: isWatchedData
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else if (req.method === 'POST' && endpoint === 'watch' && playerId) {
      // Dodaj gracza do obserwowanych
      const { data, error } = await supabaseClient.rpc(
        'toggle_watch_player',
        {
          user_id: user.id,
          player_id: playerId
        }
      )
      
      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ isWatched: data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (req.method === 'DELETE' && endpoint === 'watch' && playerId) {
      // Usuń gracza z obserwowanych
      const { data, error } = await supabaseClient.rpc(
        'toggle_watch_player',
        {
          user_id: user.id,
          player_id: playerId
        }
      )
      
      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ isWatched: data }),
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