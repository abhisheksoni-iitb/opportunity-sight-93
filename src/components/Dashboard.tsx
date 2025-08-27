import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  MapPin, 
  Building, 
  Target, 
  Sparkles, 
  BarChart3,
  Globe,
  Users,
  Star,
  ArrowRight,
  RefreshCw,
  Search,
  BookmarkPlus,
  Mail,
  Eye
} from 'lucide-react';
import heroDashboard from '@/assets/hero-dashboard.jpg';
import OpportunityMap from '@/components/OpportunityMap';
import OpportunityCard from '@/components/OpportunityCard';
import ProfileForm from '@/components/ProfileForm';
import TrendExplorer from '@/components/TrendExplorer';

interface UserProfile {
  user_id: string;
  company_name: string;
  location: any;
  certifications: string[];
  current_products: string[];
  processes: string[];
  capacity: string;
  interests: string[];
}

interface OpportunityData {
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

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('opportunities');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [opportunities, setOpportunities] = useState<OpportunityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const { toast } = useToast();

  // Demo user ID for development
  const DEMO_USER_ID = '11111111-1111-1111-1111-111111111111';

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', DEMO_USER_ID)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setUserProfile(data);
        // Auto-generate recommendations
        await generateRecommendations(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error loading profile",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const generateRecommendations = async (profile?: UserProfile) => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('generate-recommendations', {
        body: { 
          user_id: DEMO_USER_ID,
          overrides: profile ? {
            location: profile.location,
            processes: profile.processes,
            certifications: profile.certifications,
            current_products: profile.current_products,
            capacity: profile.capacity,
            interests: profile.interests
          } : undefined
        }
      });

      if (response.error) throw response.error;
      
      setOpportunities(response.data?.opportunities || []);
      
      toast({
        title: "Recommendations updated",
        description: `Found ${response.data?.opportunities?.length || 0} market opportunities for you.`
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error generating recommendations",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const logEvent = async (eventType: string, metadata: any) => {
    try {
      await supabase.functions.invoke('log-event', {
        body: {
          user_id: DEMO_USER_ID,
          event_type: eventType,
          metadata
        }
      });
    } catch (error) {
      console.error('Error logging event:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Market Navigator</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Market Intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="px-3 py-1">
                <Sparkles className="w-3 h-3 mr-1" />
                Premium Analytics
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-primary overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <img 
          src={heroDashboard} 
          alt="Market Analytics Dashboard" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="relative container mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Discover Your Next Market Opportunity
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-6">
              AI-powered insights, personalized recommendations, and real-time market trends to fuel your business growth.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => setActiveTab('opportunities')}
              >
                <Target className="w-5 h-5 mr-2" />
                View Opportunities
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => setActiveTab('explorer')}
              >
                <Search className="w-5 h-5 mr-2" />
                Explore Trends
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="opportunities" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Personalized Opportunities</span>
            </TabsTrigger>
            <TabsTrigger value="explorer" className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>Trend Explorer</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="space-y-6">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Profile Panel */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building className="w-5 h-5" />
                      <span>Your Profile</span>
                    </CardTitle>
                    <CardDescription>
                      Adjust your business details to get better recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProfileForm 
                      profile={userProfile}
                      loading={profileLoading}
                      onUpdate={generateRecommendations}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Opportunities Panel */}
              <div className="lg:col-span-3 space-y-6">
                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Opportunities</p>
                          <p className="text-2xl font-bold text-foreground">{opportunities.length}</p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Avg Fit Score</p>
                          <p className="text-2xl font-bold text-foreground">
                            {opportunities.length > 0 
                              ? Math.round(opportunities.reduce((acc, opp) => acc + opp.fit_score, 0) / opportunities.length)
                              : 0}%
                          </p>
                        </div>
                        <Star className="w-8 h-8 text-accent" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">High Demand</p>
                          <p className="text-2xl font-bold text-foreground">
                            {opportunities.filter(opp => opp.demand_score > 80).length}
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-success" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Map and List */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Globe className="w-5 h-5" />
                        <span>Geographic Opportunities</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <OpportunityMap opportunities={opportunities} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <Users className="w-5 h-5" />
                          <span>Top Matches</span>
                        </CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => generateRecommendations()}
                          disabled={loading}
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                          Refresh
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                      {opportunities
                        .sort((a, b) => b.fit_score - a.fit_score)
                        .slice(0, 10)
                        .map((opportunity) => (
                          <OpportunityCard
                            key={opportunity.rec_id}
                            opportunity={opportunity}
                            onAction={(action) => logEvent(action, { rec_id: opportunity.rec_id })}
                          />
                        ))}
                      {opportunities.length === 0 && !loading && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Target className="w-12 h-12 mx-auto mb-4 opacity-40" />
                          <p>No opportunities yet. Update your profile to get started!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="explorer" className="space-y-6">
            <TrendExplorer onEvent={logEvent} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;