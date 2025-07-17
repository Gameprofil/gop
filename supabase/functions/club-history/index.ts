// Supabase Edge Function: club-history
// Obsługuje operacje na historii klubowej

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
    const clubId = path[path.length - 1] !== 'club-history' ? path[path.length - 1] : null

    // Obsługa różnych metod HTTP
    if (req.method === 'GET') {
      // Pobierz historię klubową
      const { data, error } = await supabaseClient
        .from('club_history')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false })

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
    } else if (req.method === 'POST') {
      // Dodaj nowy klub
      const requestData = await req.json()
      
      const { data, error } = await supabaseClient.rpc(
        'add_club_history',
        {
          user_id: user.id,
          club_name: requestData.clubName,
          start_date: requestData.startDate,
          end_date: requestData.endDate,
          position: requestData.position,
          achievements: requestData.achievements
        }
      )

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ club: data[0] }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (req.method === 'PUT' && clubId) {
      // Aktualizuj klub
      const requestData = await req.json()
      
      const { data, error } = await supabaseClient.rpc(
        'update_club_history',
        {
          history_id: clubId,
          club_name: requestData.clubName,
          start_date: requestData.startDate,
          end_date: requestData.endDate,
          position: requestData.position,
          achievements: requestData.achievements
        }
      )

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ club: data[0] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (req.method === 'DELETE' && clubId) {
      // Usuń klub
      const { data, error } = await supabaseClient.rpc(
        'delete_club_history',
        {
          history_id: clubId
        }
      )

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: data }),
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