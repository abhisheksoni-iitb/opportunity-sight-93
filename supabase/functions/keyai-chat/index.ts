import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

// Rate limiter implementation
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  allowed: boolean;
  error?: string;
  resetTime?: number;
}

class RateLimiter {
  private minuteLimit = 3;
  private hourLimit = 10;
  private minuteWindow = 60 * 1000; // 1 minute in milliseconds
  private hourWindow = 60 * 60 * 1000; // 1 hour in milliseconds
  
  private minuteTracker: RateLimitEntry = { count: 0, resetTime: 0 };
  private hourTracker: RateLimitEntry = { count: 0, resetTime: 0 };

  checkLimit(): RateLimitResult {
    const now = Date.now();

    // Reset minute counter if window has passed
    if (now > this.minuteTracker.resetTime) {
      this.minuteTracker = {
        count: 0,
        resetTime: now + this.minuteWindow
      };
    }

    // Reset hour counter if window has passed
    if (now > this.hourTracker.resetTime) {
      this.hourTracker = {
        count: 0,
        resetTime: now + this.hourWindow
      };
    }

    // Check minute limit first (more restrictive)
    if (this.minuteTracker.count >= this.minuteLimit) {
      const resetInSeconds = Math.ceil((this.minuteTracker.resetTime - now) / 1000);
      return {
        allowed: false,
        error: `Rate limit exceeded. You can make ${this.minuteLimit} requests per minute. Try again in ${resetInSeconds} seconds.`,
        resetTime: this.minuteTracker.resetTime
      };
    }

    // Check hour limit
    if (this.hourTracker.count >= this.hourLimit) {
      const resetInMinutes = Math.ceil((this.hourTracker.resetTime - now) / (1000 * 60));
      return {
        allowed: false,
        error: `Hourly rate limit exceeded. You can make ${this.hourLimit} requests per hour. Try again in ${resetInMinutes} minutes.`,
        resetTime: this.hourTracker.resetTime
      };
    }

    // Increment counters
    this.minuteTracker.count++;
    this.hourTracker.count++;

    return { allowed: true };
  }
}

// Create a singleton instance
const geminiRateLimiter = new RateLimiter();

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
    
    // Check rate limit before processing
    const rateLimitResult = geminiRateLimiter.checkLimit();
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: rateLimitResult.error,
          rateLimited: true 
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    let prompt = '';
    
    if (type === 'opportunity-insight') {
      // For opportunity card insights
      prompt = `Analyze this opportunity and provide crisp, actionable insights: ${JSON.stringify(data, null, 2)}.

**Requirements:**
- Keep response under 200 words
- Do NOT include any rec_id, trend_id, or technical IDs
- Focus on business value and actionability
- Include relevant supplier connections

**Format:**
## Why This Opportunity
Brief compelling overview (2-3 sentences)

## Market Advantages  
- 2-3 key strengths (bullet points)

## Next Steps
- 2-3 specific actions to take

## Connect with Suppliers
List 2-3 relevant supplier types for this opportunity in this format:
SUPPLIER: [Company Name] | [Location] | [Speciality]

Keep it concise and business-focused.`;
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
      
      
      prompt = `User Query: "${query}"

Using this opportunity data: ${JSON.stringify(recommendations, null, 2)}

**Requirements:**
- Keep response under 250 words
- Do NOT include any rec_id, trend_id, or technical IDs  
- Focus on top 2-3 most relevant opportunities
- Include supplier connections for each recommendation

**Format:**
## Top Opportunities for You

### [Opportunity 1 Name]
Brief why it fits (1-2 sentences)
- Key advantage 1
- Key advantage 2

### [Opportunity 2 Name] 
Brief why it fits (1-2 sentences)
- Key advantage 1  
- Key advantage 2

## Connect with Suppliers
For each opportunity, list relevant suppliers in this format:
SUPPLIER: [Company Name] | [Location] | [Speciality]

Keep it crisp and actionable.`;
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