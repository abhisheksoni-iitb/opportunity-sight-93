import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserData {
  user_id: string;
  company_name: string;
  location: any;
  certifications: string[];
  current_products: string[];
  processes: string[];
  capacity: string;
  interests: string[];
}

interface SupplierTrend {
  trend_id: string;
  product_category: string;
  geography: any;
  demand_score: number;
  market_size: number;
  avg_price: number;
  required_setup: string[];
  trending_brands: string[];
  supplier_density: number;
}

interface RecommendationResult {
  rec_id: string;
  trend_id: string;
  fit_score: number;
  reasoning: string;
  setup_requirements: any;
  product_category: string;
  geography: any;
  demand_score: number;
  market_size: number;
  avg_price: number;
  trending_brands: string[];
  supplier_density: number;
}

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

    const { user_id, overrides } = await req.json();

    console.log('Generating recommendations for user:', user_id);

    // Load user profile
    const { data: userData, error: userError } = await supabaseClient
      .from('user_data')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (userError) {
      throw new Error(`Failed to load user data: ${userError.message}`);
    }

    // Merge overrides with user data
    const profile: UserData = {
      ...userData,
      ...overrides
    };

    console.log('User profile loaded:', profile.company_name);

    // Load supplier trends
    const { data: trends, error: trendsError } = await supabaseClient
      .from('supplier_trends')
      .select('*');

    if (trendsError) {
      throw new Error(`Failed to load trends: ${trendsError.message}`);
    }

    console.log('Loaded', trends.length, 'supplier trends');

    // Calculate fit scores and generate recommendations
    const recommendations: RecommendationResult[] = [];

    for (const trend of trends) {
      const fitScore = calculateFitScore(profile, trend);
      const reasoning = generateReasoning(profile, trend, fitScore);
      const setupRequirements = analyzeSetupRequirements(profile, trend);

      if (fitScore >= 40) { // Only include reasonable fits
        // Create recommendation record
        const { data: recommendation, error: recError } = await supabaseClient
          .from('recommendations')
          .insert([{
            user_id: user_id,
            trend_id: trend.trend_id,
            fit_score: fitScore,
            reasoning: reasoning,
            setup_requirements: setupRequirements,
            date_recommended: new Date().toISOString(),
            context: {
              profile_snapshot: profile,
              trend_snapshot: trend,
              calculation_method: 'fit_score_v1'
            }
          }])
          .select('rec_id')
          .single();

        if (recError) {
          console.error('Failed to save recommendation:', recError);
          continue;
        }

        recommendations.push({
          rec_id: recommendation.rec_id,
          trend_id: trend.trend_id,
          fit_score: fitScore,
          reasoning: reasoning,
          setup_requirements: setupRequirements,
          product_category: trend.product_category,
          geography: trend.geography,
          demand_score: trend.demand_score,
          market_size: trend.market_size,
          avg_price: trend.avg_price,
          trending_brands: trend.trending_brands,
          supplier_density: trend.supplier_density
        });
      }
    }

    // Sort by fit score
    recommendations.sort((a, b) => b.fit_score - a.fit_score);

    console.log('Generated', recommendations.length, 'recommendations');

    return new Response(JSON.stringify({ 
      opportunities: recommendations.slice(0, 20) // Return top 20
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-recommendations function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      opportunities: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateFitScore(profile: UserData, trend: SupplierTrend): number {
  let score = 0;
  
  // Geographic match (30% weight)
  const geoScore = calculateGeographicMatch(profile.location, trend.geography);
  score += geoScore * 0.3;
  
  // Process/capability overlap (30% weight)
  const processScore = calculateOverlapScore(profile.processes || [], trend.required_setup || []);
  score += processScore * 0.3;
  
  // Certifications match (15% weight)
  const certScore = calculateOverlapScore(profile.certifications || [], trend.required_setup || []);
  score += certScore * 0.15;
  
  // Current products/category adjacency (10% weight)
  const categoryScore = calculateCategoryMatch(profile.current_products || [], trend.product_category);
  score += categoryScore * 0.1;
  
  // Capacity vs demand (10% weight)
  const capacityScore = calculateCapacityMatch(profile.capacity, trend.market_size, trend.avg_price);
  score += capacityScore * 0.1;
  
  // Interests alignment (5% weight)
  const interestScore = calculateInterestMatch(profile.interests || [], trend.product_category);
  score += interestScore * 0.05;
  
  return Math.round(Math.max(0, Math.min(100, score)));
}

function calculateGeographicMatch(userLocation: any, trendLocation: any): number {
  if (!userLocation || !trendLocation) return 20;
  
  if (userLocation.city === trendLocation.city) return 100;
  if (userLocation.state === trendLocation.state) return 70;
  if (userLocation.country === trendLocation.country) return 50;
  return 20;
}

function calculateOverlapScore(userItems: string[], trendItems: string[]): number {
  if (userItems.length === 0 || trendItems.length === 0) return 0;
  
  const intersection = userItems.filter(item => 
    trendItems.some(trendItem => 
      item.toLowerCase().includes(trendItem.toLowerCase()) ||
      trendItem.toLowerCase().includes(item.toLowerCase())
    )
  );
  
  return Math.min(100, (intersection.length / Math.max(userItems.length, trendItems.length)) * 100);
}

function calculateCategoryMatch(userProducts: string[], trendCategory: string): number {
  if (userProducts.length === 0) return 0;
  
  const matches = userProducts.filter(product => 
    product.toLowerCase().includes(trendCategory.toLowerCase()) ||
    trendCategory.toLowerCase().includes(product.toLowerCase())
  );
  
  return matches.length > 0 ? 80 : 20;
}

function calculateCapacityMatch(capacity: string, marketSize: number, avgPrice: number): number {
  // Simple heuristic based on capacity description
  if (!capacity || !marketSize) return 50;
  
  if (capacity.toLowerCase().includes('large')) return 90;
  if (capacity.toLowerCase().includes('medium')) return 70;
  if (capacity.toLowerCase().includes('small')) return 40;
  
  return 50;
}

function calculateInterestMatch(interests: string[], category: string): number {
  if (interests.length === 0) return 0;
  
  const matches = interests.filter(interest => 
    interest.toLowerCase().includes(category.toLowerCase()) ||
    category.toLowerCase().includes(interest.toLowerCase())
  );
  
  return matches.length > 0 ? 100 : 0;
}

function generateReasoning(profile: UserData, trend: SupplierTrend, fitScore: number): string {
  const reasons = [];
  
  const geoScore = calculateGeographicMatch(profile.location, trend.geography);
  if (geoScore >= 70) {
    reasons.push(`Strong geographic alignment with ${trend.geography?.city || 'target market'}`);
  }
  
  const processScore = calculateOverlapScore(profile.processes || [], trend.required_setup || []);
  if (processScore >= 50) {
    reasons.push('Your existing processes match market requirements');
  }
  
  const categoryScore = calculateCategoryMatch(profile.current_products || [], trend.product_category);
  if (categoryScore >= 50) {
    reasons.push('Aligns with your current product portfolio');
  }
  
  if (trend.demand_score >= 80) {
    reasons.push(`High market demand (${trend.demand_score}% score)`);
  }
  
  if (trend.supplier_density <= 20) {
    reasons.push('Low competition with limited suppliers in the market');
  }
  
  if (reasons.length === 0) {
    reasons.push('Moderate market opportunity based on your profile');
  }
  
  return reasons.slice(0, 3).join('. ') + '.';
}

function analyzeSetupRequirements(profile: UserData, trend: SupplierTrend): any {
  const userCapabilities = [
    ...(profile.processes || []),
    ...(profile.certifications || [])
  ];
  
  const required = trend.required_setup || [];
  const gaps = required.filter(req => 
    !userCapabilities.some(cap => 
      cap.toLowerCase().includes(req.toLowerCase()) ||
      req.toLowerCase().includes(cap.toLowerCase())
    )
  );
  
  return {
    required_setup: required,
    capability_gaps: gaps,
    estimated_investment: gaps.length > 0 ? 'Medium to High' : 'Low to Medium',
    timeline: gaps.length > 2 ? '6-12 months' : '1-3 months'
  };
}