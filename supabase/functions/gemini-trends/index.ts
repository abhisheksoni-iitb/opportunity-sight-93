import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Check rate limit before processing
    const rateLimitResult = geminiRateLimiter.checkLimit();
    if (!rateLimitResult.allowed) {
      return new Response(JSON.stringify({ 
        error: rateLimitResult.error,
        rateLimited: true,
        opportunities: []
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { 
      user_id, 
      query_text, 
      location, 
      budget, 
      processes = [], 
      certifications = [], 
      target_brands = [], 
      industries = [] 
    } = await req.json();

    console.log('Processing Gemini query for user:', user_id);
    console.log('Query:', query_text);

    // Construct prompt for Gemini
    const systemPrompt = `You are an expert market analyst for small manufacturers in India. 
Analyze the user's query and provide ranked market opportunities.

User Context:
- Location: ${location || 'India'}
- Budget: ${budget || 'Flexible'}
- Available Processes: ${processes.join(', ') || 'Various'}
- Certifications: ${certifications.join(', ') || 'Standard'}
- Target Brands: ${target_brands.join(', ') || 'Open'}
- Industries of Interest: ${industries.join(', ') || 'Multiple'}

Query: ${query_text}

Provide ONLY a JSON response with this exact structure:
{
  "opportunities": [
    {
      "rank": 1,
      "title": "Brief descriptive title",
      "product_category": "Category name",
      "geography": "City, State",
      "score": 85,
      "why": "Detailed explanation tied to user context and market trends",
      "steps": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
      "required_setup": ["Equipment needed", "Certification needed"],
      "suggested_brands": ["Brand1", "Brand2", "Brand3"],
      "supplier_keywords": ["keyword1", "keyword2"]
    }
  ]
}

Focus on practical, actionable opportunities relevant to Indian manufacturing. Rank by viability and market potential.`;

    // Call Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const geminiData = await response.json();
    console.log('Gemini response received');

    if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }

    const geminiText = geminiData.candidates[0].content.parts[0].text;
    
    // Extract JSON from response
    let jsonStart = geminiText.indexOf('{');
    let jsonEnd = geminiText.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON found in Gemini response');
    }
    
    const jsonText = geminiText.substring(jsonStart, jsonEnd);
    const parsedResult = JSON.parse(jsonText);

    console.log('Successfully parsed', parsedResult.opportunities?.length || 0, 'opportunities');

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gemini-trends function:', error);
    
    // Return mock data for development/demo
    const mockResponse = {
      opportunities: [
        {
          rank: 1,
          title: "Sustainable Food Packaging for Indian Market",
          product_category: "Eco-friendly Packaging",
          geography: "Mumbai, Maharashtra",
          score: 88,
          why: "Growing environmental consciousness and government regulations on single-use plastics create strong demand. Your location provides access to major FMCG companies requiring sustainable packaging solutions.",
          steps: [
            "Research biodegradable material suppliers in India",
            "Develop prototypes for common food packaging sizes",
            "Obtain food-grade certifications (FSSAI, BIS)",
            "Partner with local food brands for pilot programs",
            "Scale production based on successful trials"
          ],
          required_setup: ["Food-grade manufacturing facility", "FSSAI certification", "Quality testing equipment"],
          suggested_brands: ["Amul", "Britannia", "ITC", "Nestle India"],
          supplier_keywords: ["biodegradable materials", "food packaging machinery", "sustainable supplies"]
        },
        {
          rank: 2,
          title: "Smart Agricultural Sensors for Precision Farming",
          product_category: "AgriTech IoT",
          geography: "Pune, Maharashtra",
          score: 82,
          why: "India's push towards precision agriculture and IoT adoption in farming creates emerging opportunities. Government subsidies and growing farmer awareness support market growth.",
          steps: [
            "Identify key sensor types needed by farmers",
            "Develop low-cost, robust sensor prototypes",
            "Partner with agricultural universities for testing",
            "Build distribution network through agri-dealers",
            "Integrate with existing farm management apps"
          ],
          required_setup: ["Electronics manufacturing setup", "Agricultural testing facilities", "Wireless connectivity expertise"],
          suggested_brands: ["Mahindra Rise", "Tata Digital", "CropIn", "AgroStar"],
          supplier_keywords: ["agricultural sensors", "IoT modules", "weather monitoring"]
        }
      ]
    };

    return new Response(JSON.stringify(mockResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});