import { Redis } from '@upstash/redis'

export const config = {
  runtime: 'edge'
}

function getRedis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return null
  }

  return new Redis({
    url,
    token
  })
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  const redis = getRedis()
  if (!redis) {
    return new Response(
      JSON.stringify({
        success: false,
        configured: false,
        topics: null,
        message: 'Vercel KV no configurado'
      }),
      { status: 200, headers: corsHeaders }
    )
  }

  try {
    if (req.method === 'GET') {
      const topics = await redis.get('andwhy_csharp_topics_v1')
      return new Response(
        JSON.stringify({
          success: true,
          configured: true,
          topics: topics ?? []
        }),
        { status: 200, headers: corsHeaders }
      )
    }

    if (req.method === 'POST') {
      const body = await req.json()
      if (Array.isArray(body)) {
        await redis.set('andwhy_csharp_topics_v1', body)
      } else if (body.topics && Array.isArray(body.topics)) {
        await redis.set('andwhy_csharp_topics_v1', body.topics)
      } else if (body.id) {
        const currentTopics = ((await redis.get('andwhy_csharp_topics_v1')) as Array<{ id: string }>) || []
        const exists = currentTopics.some((t) => t.id === body.id)
        const updated = exists
          ? currentTopics.map((t) => (t.id === body.id ? body : t))
          : [...currentTopics, body]
        await redis.set('andwhy_csharp_topics_v1', updated)
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Temas actualizados en Vercel KV' }),
        { status: 200, headers: corsHeaders }
      )
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url)
      const topicId = url.searchParams.get('id')
      if (topicId) {
        const currentTopics = ((await redis.get('andwhy_csharp_topics_v1')) as Array<{ id: string }>) || []
        const updated = currentTopics.filter((t) => t.id !== topicId)
        await redis.set('andwhy_csharp_topics_v1', updated)
      }
      return new Response(
        JSON.stringify({ success: true, message: 'Tema eliminado en Vercel KV' }),
        { status: 200, headers: corsHeaders }
      )
    }

    return new Response(
      JSON.stringify({ error: `Method ${req.method} not allowed` }),
      { status: 405, headers: corsHeaders }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno'
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: corsHeaders }
    )
  }
}
