import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const apiKey = (config as any).geminiApiKey || (config.public && (config.public as any).geminiApiKey) || process.env.GEMINI_API_KEY
  if (!apiKey) {
    return new Response('Missing Gemini API key', { status: 500 })
  }

  const prompt = body?.prompt as string
  const model = (body?.model as string) || 'gemini-pro-latest'
  const generationConfig = body?.generationConfig || { temperature: 0.3, maxOutputTokens: 1800 }
  const systemPrompt = body?.systemPrompt as string | undefined

  const requestPayload: Record<string, any> = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig
  }

  if (systemPrompt) {
    requestPayload.systemInstruction = {
      role: 'system',
      parts: [{ text: systemPrompt }]
    }
  }

  const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestPayload)
  })

  // 直接將 Gemini 的 SSE 轉發給客戶端
  const headers = new Headers()
  headers.set('Content-Type', 'text/event-stream')
  headers.set('Cache-Control', 'no-cache')
  headers.set('Connection', 'keep-alive')

  return new Response(upstream.body as any, { headers })
})
