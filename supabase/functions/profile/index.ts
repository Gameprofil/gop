// Supabase Edge Function: profile
// Obsługuje operacje na profilach użytkowników

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
    const path = url.pathname.split('/').pop()

    // Obsługa różnych endpointów
    if (req.method === 'GET') {
      switch (path) {
        case 'player':
          // Pobierz profil gracza
          const { data: playerData, error: playerError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (playerError) {
            return new Response(
              JSON.stringify({ error: playerError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Pobierz statystyki gracza
          const { data: statsData, error: statsError } = await supabaseClient
            .from('player_stats')
            .select('*')
            .eq('user_id', user.id)
            .single()

          if (statsError && statsError.code !== 'PGRST116') {
            return new Response(
              JSON.stringify({ error: statsError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Pobierz historię klubową
          const { data: clubHistoryData, error: clubHistoryError } = await supabaseClient
            .from('club_history')
            .select('*')
            .eq('user_id', user.id)
            .order('start_date', { ascending: false })

          if (clubHistoryError) {
            return new Response(
              JSON.stringify({ error: clubHistoryError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Pobierz powiązanych graczy
          const { data: relatedPlayersData, error: relatedPlayersError } = await supabaseClient
            .from('related_players')
            .select('*')
            .eq('user_id', user.id)

          if (relatedPlayersError) {
            return new Response(
              JSON.stringify({ error: relatedPlayersError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Pobierz opinie trenerów
          const { data: coachReviewsData, error: coachReviewsError } = await supabaseClient
            .from('coach_reviews')
            .select('*')
            .eq('player_id', user.id)
            .order('date', { ascending: false })

          if (coachReviewsError) {
            return new Response(
              JSON.stringify({ error: coachReviewsError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({
              player: playerData,
              stats: statsData || {},
              clubHistory: clubHistoryData,
              relatedPlayers: relatedPlayersData,
              coachReviews: coachReviewsData
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )

        case 'coach':
          // Pobierz profil trenera
          const { data: coachData, error: coachError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (coachError) {
            return new Response(
              JSON.stringify({ error: coachError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Pobierz statystyki trenera
          const { data: coachStatsData, error: coachStatsError } = await supabaseClient
            .from('coach_stats')
            .select('*')
            .eq('user_id', user.id)
            .single()

          if (coachStatsError && coachStatsError.code !== 'PGRST116') {
            return new Response(
              JSON.stringify({ error: coachStatsError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Pobierz historię klubową
          const { data: coachClubHistoryData, error: coachClubHistoryError } = await supabaseClient
            .from('club_history')
            .select('*')
            .eq('user_id', user.id)
            .order('start_date', { ascending: false })

          if (coachClubHistoryError) {
            return new Response(
              JSON.stringify({ error: coachClubHistoryError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({
              coach: coachData,
              stats: coachStatsData || {},
              clubHistory: coachClubHistoryData
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )

        default:
          return new Response(
            JSON.stringify({ error: 'Nieznany endpoint' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
      }
    } else if (req.method === 'PUT') {
      const requestData = await req.json()

      switch (path) {
        case 'basic-data':
          // Aktualizuj podstawowe dane
          const { data: updateData, error: updateError } = await supabaseClient.rpc(
            'update_profile',
            {
              user_id: user.id,
              first_name: requestData.firstName,
              last_name: requestData.lastName,
              phone: requestData.phone,
              club: requestData.club,
              position: requestData.position,
              height: requestData.height,
              country: requestData.country,
              age: requestData.age,
              avatar_url: requestData.avatar_url
            }
          )

          if (updateError) {
            return new Response(
              JSON.stringify({ error: updateError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify(updateData[0]),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )

        case 'player-stats':
          // Aktualizuj statystyki gracza
          const { data: statsUpdateData, error: statsUpdateError } = await supabaseClient.rpc(
            'update_player_stats',
            {
              user_id: user.id,
              minutes: requestData.minutes,
              matches: requestData.matches,
              goals: requestData.goals,
              assists: requestData.assists,
              yellow_cards: requestData.yellowCards,
              red_cards: requestData.redCards,
              clean_sheets: requestData.cleanSheets,
              saves: requestData.saves
            }
          )

          if (statsUpdateError) {
            return new Response(
              JSON.stringify({ error: statsUpdateError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify(statsUpdateData[0]),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )

        case 'coach-stats':
          // Aktualizuj statystyki trenera
          const { data: coachStatsUpdateData, error: coachStatsUpdateError } = await supabaseClient.rpc(
            'update_coach_stats',
            {
              user_id: user.id,
              total_matches: requestData.totalMatches,
              wins: requestData.wins,
              draws: requestData.draws,
              losses: requestData.losses,
              points_per_match: requestData.pointsPerMatch,
              developed_players: requestData.developedPlayers
            }
          )

          if (coachStatsUpdateError) {
            return new Response(
              JSON.stringify({ error: coachStatsUpdateError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify(coachStatsUpdateData[0]),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )

        default:
          return new Response(
            JSON.stringify({ error: 'Nieznany endpoint' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
      }
    } else if (req.method === 'POST') {
      const requestData = await req.json()

      if (path === 'upload-photo') {
        // Obsługa przesyłania zdjęcia profilowego
        // W rzeczywistej implementacji należałoby obsłużyć przesyłanie pliku do storage
        // Tutaj tylko symulujemy aktualizację URL zdjęcia
        
        const { data: updateData, error: updateError } = await supabaseClient.rpc(
          'update_profile',
          {
            user_id: user.id,
            avatar_url: requestData.photoUrl || 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'
          }
        )

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ photoUrl: updateData[0].avatar_url }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
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