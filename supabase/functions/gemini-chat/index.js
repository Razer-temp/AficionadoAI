// Deno-based Supabase Edge Function for secure server-side Gemini Proxy.
// This prevents client-side exposure of VITE_GEMINI_API_KEY.
// Path: supabase/functions/gemini-chat/index.js

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!GEMINI_API_KEY) {
      throw new Error('Missing GEMINI_API_KEY env var on server')
    }

    const { message, history, systemPrompt } = await req.json()
    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
        topP: 0.95,
      },
    })

    const chat = model.startChat({
      history: (history || []).map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
      systemInstruction: { parts: [{ text: systemPrompt }] },
    })

    const result = await chat.sendMessage(message)
    const responseText = result.response.text()

    return new Response(
      JSON.stringify({ response: responseText }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
