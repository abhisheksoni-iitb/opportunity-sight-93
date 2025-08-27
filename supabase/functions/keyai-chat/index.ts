import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data, query, userId } = await req.json();
    
    let prompt = '';
    
    if (type === 'opportunity-insight') {
      // For opportunity card insights
      prompt = `Help the user understand this opportunity better, expand on it using this data: ${JSON.stringify(data, null, 2)}.

Make the output persuasive and insightful, highlighting why this opportunity is particularly promising for the user and which aspects make it a fit.

Format your response with:
- A compelling overview of why this opportunity stands out
- Key strengths and market advantages (use bullet points)
- Specific next steps and actions the user can take
- Market insights and potential returns

Keep the tone professional yet engaging.`;
    } else if (type === 'trend-exploration') {
      // For trend explorer queries
      const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
      
      // Get all recommendations data for context
      const { data: locationRecs, error: locationError } = await supabase
        .from('location_recommendations')
        .select('*')
        .limit(15);
        
      const { data: userRecs, error: userError } = await supabase
        .from('user_recommendations')
        .select('*')
        .limit(15);
        
      if (locationError || userError) {
        console.error('Error fetching recommendations:', locationError || userError);
      }
      
      const recommendations = {
        location_opportunities: locationRecs || [],
        user_opportunities: userRecs || []
      };
      
      
      prompt = `User has asked this: "${query}".

Use this opportunity data to provide the best, most convincing and actionable answer: ${JSON.stringify(recommendations, null, 2)}

Give the best, most convincing and actionable answer you can, referencing the opportunity data and providing clear reasoning.

Format your response with:
- Top trend/opportunity recommendations with tailored explanations
- "Why this fits" section with specific reasoning
- "Action Steps" with concrete next steps
- "Data evidence" citing specific opportunities from the data

Make it conversational and helpful, focusing on actionable insights.`;
    }

    // Call Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey!,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

    // Log the event
    if (userId) {
      const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
      await supabase.functions.invoke('log-event', {
        body: {
          user_id: userId,
          event_type: type === 'opportunity-insight' ? 'Ask KeyAI' : 'Gemini Trend Question',
          metadata: { query, type }
        }
      });
    }

    return new Response(
      JSON.stringify({ content }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in keyai-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});