import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id, rec_id, trend_id, event_type, metadata } = await req.json();

    console.log('Logging event:', event_type, 'for user:', user_id);

    // If rec_id is provided, update the recommendations table
    if (rec_id) {
      const { error: updateError } = await supabaseClient
        .from('recommendations')
        .update({
          engagement_action: event_type,
          outcome: getOutcomeFromEvent(event_type)
        })
        .eq('rec_id', rec_id)
        .eq('user_id', user_id);

      if (updateError) {
        console.error('Failed to update recommendation:', updateError);
      } else {
        console.log('Updated recommendation engagement:', rec_id);
      }
    }

    // Log the event (you could create a separate events table here if needed)
    console.log('Event logged successfully:', {
      user_id,
      rec_id,
      trend_id,
      event_type,
      metadata,
      timestamp: new Date().toISOString()
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in log-event function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      ok: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getOutcomeFromEvent(eventType: string): string {
  switch (eventType) {
    case 'save':
    case 'contact':
    case 'view_suppliers':
      return 'accepted';
    case 'reject':
      return 'rejected';
    default:
      return 'pending';
  }
}