// Supabase Edge Function: auth
// Obsługuje logowanie, rejestrację i weryfikację użytkowników

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
    const path = url.pathname.split('/').pop()

    // Obsługa różnych endpointów
    if (req.method === 'POST') {
      const { email, password, firstName, lastName, phone, profileType } = await req.json()

      switch (path) {
        case 'login':
          // Logowanie użytkownika
          const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
          })

          if (signInError) {
            return new Response(
              JSON.stringify({ error: signInError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Pobierz dane profilu
          const { data: profileData } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', signInData.user.id)
            .single()

          return new Response(
            JSON.stringify({ 
              token: signInData.session.access_token,
              user: { 
                ...signInData.user,
                ...profileData
              }
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )

        case 'register':
          // Rejestracja użytkownika
          const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
              data: {
                firstName,
                lastName,
                phone,
                profileType
              }
            }
          })

          if (signUpError) {
            return new Response(
              JSON.stringify({ error: signUpError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ 
              message: 'Rejestracja zakończona pomyślnie',
              user: signUpData.user
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )

        case 'check-unique':
          // Sprawdzanie unikalności emaila i nazwy
          const { email: checkEmail, firstName: checkFirstName, lastName: checkLastName } = await req.json()
          
          // Sprawdź email
          const { data: emailData, error: emailError } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('email', checkEmail)
            .maybeSingle()

          if (emailError) {
            return new Response(
              JSON.stringify({ error: emailError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          if (emailData) {
            return new Response(
              JSON.stringify({ error: 'EMAIL_EXISTS' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Sprawdź imię i nazwisko
          const { data: nameData, error: nameError } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('first_name', checkFirstName)
            .eq('last_name', checkLastName)
            .maybeSingle()

          if (nameError) {
            return new Response(
              JSON.stringify({ error: nameError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          if (nameData) {
            return new Response(
              JSON.stringify({ error: 'NAME_EXISTS' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ unique: true }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )

        case 'verify-email':
          // Weryfikacja emaila
          const { email: verifyEmail, code } = await req.json()
          
          const { data: verifyData, error: verifyError } = await supabaseClient.auth.verifyOtp({
            email: verifyEmail,
            token: code,
            type: 'email'
          })

          if (verifyError) {
            return new Response(
              JSON.stringify({ error: verifyError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Pobierz dane profilu
          const { data: verifyProfileData } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', verifyData.user.id)
            .single()

          return new Response(
            JSON.stringify({ 
              token: verifyData.session?.access_token,
              user: { 
                ...verifyData.user,
                ...verifyProfileData
              }
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )

        case 'resend-code':
          // Ponowne wysłanie kodu weryfikacyjnego
          const { email: resendEmail } = await req.json()
          
          const { error: resendError } = await supabaseClient.auth.resend({
            email: resendEmail,
            type: 'signup'
          })

          if (resendError) {
            return new Response(
              JSON.stringify({ error: resendError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ message: 'Kod został wysłany ponownie' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )

        default:
          return new Response(
            JSON.stringify({ error: 'Nieznany endpoint' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
      }
    } else if (req.method === 'GET' && path === 'profile') {
      // Pobieranie profilu użytkownika
      const { data: { user } } = await supabaseClient.auth.getUser()
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Nie znaleziono użytkownika' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Pobierz dane profilu
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        return new Response(
          JSON.stringify({ error: profileError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(profileData),
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