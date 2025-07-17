// Supabase Edge Function: matches
// Obsługuje operacje na meczach

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

    const url = new URL(req.url)
    const path = url.pathname.split('/')
    const matchId = path[path.length - 1] !== 'matches' ? path[path.length - 1] : null

    // Obsługa różnych metod HTTP
    if (req.method === 'GET') {
      if (!matchId) {
        // Pobierz wszystkie mecze
        const leagueFilter = url.searchParams.get('league') || ''
        const roundFilter = url.searchParams.get('round') || ''
        const searchQuery = url.searchParams.get('search') || ''
        
        let query = supabaseClient
          .from('matches')
          .select('*')
          .order('date', { ascending: false })
        
        if (leagueFilter) {
          query = query.eq('league', leagueFilter)
        }
        
        if (roundFilter && roundFilter !== 'Wszystkie') {
          query = query.eq('round', parseInt(roundFilter))
        }
        
        if (searchQuery) {
          query = query.or(`home_team.ilike.%${searchQuery}%,away_team.ilike.%${searchQuery}%,stadium.ilike.%${searchQuery}%`)
        }
        
        const { data, error } = await query
        
        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(data),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        // Pobierz szczegóły meczu
        const { data, error } = await supabaseClient
          .from('matches')
          .select('*')
          .eq('id', matchId)
          .single()
        
        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(data),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else if (req.method === 'POST') {
      // Pobierz aktualnego użytkownika
      const { data: { user } } = await supabaseClient.auth.getUser()
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Nie znaleziono użytkownika' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Dodaj nowy mecz
      const { homeTeam, awayTeam, date, time, stadium, league } = await req.json()
      
      const { data, error } = await supabaseClient.rpc(
        'add_match',
        {
          created_by: user.id,
          home_team: homeTeam,
          away_team: awayTeam,
          date,
          time,
          stadium,
          league
        }
      )
      
      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(data[0]),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (req.method === 'PUT' && matchId) {
      // Pobierz aktualnego użytkownika
      const { data: { user } } = await supabaseClient.auth.getUser()
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Nie znaleziono użytkownika' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Aktualizuj mecz
      const requestData = await req.json()
      
      // Sprawdź, czy użytkownik jest twórcą meczu
      const { data: matchData, error: matchError } = await supabaseClient
        .from('matches')
        .select('created_by')
        .eq('id', matchId)
        .single()
      
      if (matchError) {
        return new Response(
          JSON.stringify({ error: matchError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (matchData.created_by !== user.id) {
        return new Response(
          JSON.stringify({ error: 'Brak uprawnień do aktualizacji meczu' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data, error } = await supabaseClient
        .from('matches')
        .update(requestData)
        .eq('id', matchId)
        .select()
      
      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(data[0]),
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