// Supabase Edge Function: posts
// Obsługuje operacje na postach i komentarzach

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
    const postId = path[path.length - 2] === 'posts' ? path[path.length - 1] : null
    const action = path[path.length - 1] === 'like' || path[path.length - 1] === 'comments' ? path[path.length - 1] : null

    // Obsługa różnych metod HTTP
    if (req.method === 'GET') {
      if (!postId) {
        // Pobierz wszystkie posty
        const { data: postsData, error: postsError } = await supabaseClient
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
          .limit(20)
        
        if (postsError) {
          return new Response(
            JSON.stringify({ error: postsError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Sprawdź, które posty są polubione przez użytkownika
        const { data: { user } } = await supabaseClient.auth.getUser()
        
        let likedPosts: string[] = []
        
        if (user) {
          const { data: likesData, error: likesError } = await supabaseClient
            .from('post_likes')
            .select('post_id')
            .eq('user_id', user.id)
          
          if (!likesError) {
            likedPosts = likesData.map(like => like.post_id)
          }
        }

        // Przekształć dane do oczekiwanego formatu
        const formattedPosts = postsData.map(post => ({
          id: post.id,
          author: {
            name: `${post.profiles.first_name} ${post.profiles.last_name}`,
            avatar: post.profiles.avatar_url,
            club: post.profiles.club,
            isVerified: false // Można dodać logikę weryfikacji
          },
          content: {
            text: post.text,
            image: post.image,
            video: post.video,
            isLive: post.is_live
          },
          stats: {
            likes: post.likes,
            comments: post.comments,
            shares: 0 // Dodać obsługę udostępnień
          },
          timestamp: formatTimestamp(post.created_at),
          isLiked: user ? likedPosts.includes(post.id) : false
        }))

        return new Response(
          JSON.stringify(formattedPosts),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else if (postId && !action) {
        // Pobierz szczegóły posta
        const { data: postData, error: postError } = await supabaseClient
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
          .single()
        
        if (postError) {
          return new Response(
            JSON.stringify({ error: postError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Sprawdź, czy post jest polubiony przez użytkownika
        const { data: { user } } = await supabaseClient.auth.getUser()
        
        let isLiked = false
        
        if (user) {
          const { data: likeData, error: likeError } = await supabaseClient
            .from('post_likes')
            .select('id')
            .eq('user_id', user.id)
            .eq('post_id', postId)
            .maybeSingle()
          
          if (!likeError) {
            isLiked = !!likeData
          }
        }

        // Przekształć dane do oczekiwanego formatu
        const formattedPost = {
          id: postData.id,
          author: {
            name: `${postData.profiles.first_name} ${postData.profiles.last_name}`,
            avatar: postData.profiles.avatar_url,
            club: postData.profiles.club,
            isVerified: false // Można dodać logikę weryfikacji
          },
          content: {
            text: postData.text,
            image: postData.image,
            video: postData.video,
            isLive: postData.is_live
          },
          stats: {
            likes: postData.likes,
            comments: postData.comments,
            shares: 0 // Dodać obsługę udostępnień
          },
          timestamp: formatTimestamp(postData.created_at),
          isLiked
        }

        return new Response(
          JSON.stringify(formattedPost),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else if (postId && action === 'comments') {
        // Pobierz komentarze do posta
        const { data: commentsData, error: commentsError } = await supabaseClient
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
          .order('created_at', { ascending: false })
        
        if (commentsError) {
          return new Response(
            JSON.stringify({ error: commentsError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Sprawdź, które komentarze są polubione przez użytkownika
        const { data: { user } } = await supabaseClient.auth.getUser()
        
        let likedComments: string[] = []
        
        if (user) {
          const { data: likesData, error: likesError } = await supabaseClient
            .from('comment_likes')
            .select('comment_id')
            .eq('user_id', user.id)
          
          if (!likesError) {
            likedComments = likesData.map(like => like.comment_id)
          }
        }

        // Przekształć dane do oczekiwanego formatu
        const formattedComments = commentsData.map(comment => ({
          id: comment.id,
          author: {
            name: `${comment.profiles.first_name} ${comment.profiles.last_name}`,
            avatar: comment.profiles.avatar_url,
            club: comment.profiles.club
          },
          text: comment.text,
          timestamp: formatTimestamp(comment.created_at),
          likes: comment.likes,
          isLiked: user ? likedComments.includes(comment.id) : false
        }))

        return new Response(
          JSON.stringify(formattedComments),
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

      if (!postId) {
        // Dodaj nowy post
        const { text, image, video, isLive } = await req.json()
        
        const { data, error } = await supabaseClient.rpc(
          'add_post',
          {
            user_id: user.id,
            text,
            image,
            video,
            is_live: isLive || false
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
      } else if (postId && action === 'like') {
        // Polub/odpolub post
        const { data, error } = await supabaseClient.rpc(
          'toggle_like_post',
          {
            user_id: user.id,
            post_id: postId
          }
        )
        
        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ isLiked: data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else if (postId && action === 'comments') {
        // Dodaj komentarz do posta
        const { text } = await req.json()
        
        const { data, error } = await supabaseClient.rpc(
          'add_comment',
          {
            user_id: user.id,
            post_id: postId,
            text
          }
        )
        
        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Pobierz dane profilu
        const { data: profileData, error: profileError } = await supabaseClient
          .from('profiles')
          .select('first_name, last_name, avatar_url, club')
          .eq('id', user.id)
          .single()
        
        if (profileError) {
          return new Response(
            JSON.stringify({ error: profileError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Przekształć dane do oczekiwanego formatu
        const formattedComment = {
          id: data[0].id,
          author: {
            name: `${profileData.first_name} ${profileData.last_name}`,
            avatar: profileData.avatar_url,
            club: profileData.club
          },
          text: data[0].text,
          timestamp: formatTimestamp(data[0].created_at),
          likes: 0,
          isLiked: false
        }

        return new Response(
          JSON.stringify(formattedComment),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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