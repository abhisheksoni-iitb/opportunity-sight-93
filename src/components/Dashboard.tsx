import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  MapPin, 
  Target, 
  Users,
  User
} from 'lucide-react';
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
  const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

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

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    generateRecommendations(updatedProfile);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Market Navigator
            </h1>
            <p className="text-muted-foreground">
              Discover personalized market opportunities and explore industry trends
            </p>
          </div>
          <Button
            onClick={() => setActiveTab('opportunities')}
            className="bg-primary hover:bg-primary-deep text-primary-foreground font-medium"
          >
            Explore Opportunities
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="border-b border-border">
            <TabsList className="h-12 bg-muted/30 w-auto rounded-none border-b-0">
              <TabsTrigger 
                value="opportunities"
                className="px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Personalized Opportunities
              </TabsTrigger>
              <TabsTrigger 
                value="trends"
                className="px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Trend Explorer
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="opportunities" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Profile Section - Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <User className="w-5 h-5 text-primary" />
                      <span>Your Profile</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ProfileForm 
                      profile={userProfile}
                      onGenerateRecommendations={() => generateRecommendations()}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-3 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-primary/20">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-6 h-6 mx-auto mb-1 text-primary" />
                      <div className="text-xl font-bold text-foreground">
                        {opportunities.length}
                      </div>
                      <p className="text-muted-foreground text-xs">Opportunities</p>
                    </CardContent>
                  </Card>

                  <Card className="border-success/20">
                    <CardContent className="p-4 text-center">
                      <Target className="w-6 h-6 mx-auto mb-1 text-success" />
                      <div className="text-xl font-bold text-foreground">
                        {opportunities.length > 0 
                          ? Math.round(opportunities.reduce((acc, opp) => acc + opp.fit_score, 0) / opportunities.length)
                          : 0
                        }%
                      </div>
                      <p className="text-muted-foreground text-xs">Avg Fit</p>
                    </CardContent>
                  </Card>

                  <Card className="border-warning/20">
                    <CardContent className="p-4 text-center">
                      <MapPin className="w-6 h-6 mx-auto mb-1 text-warning" />
                      <div className="text-xl font-bold text-foreground">
                        {opportunities.filter(opp => opp.demand_score >= 80).length}
                      </div>
                      <p className="text-muted-foreground text-xs">High Demand</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Map and Opportunities Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Map */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Geographic Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <OpportunityMap opportunities={opportunities} />
                    </CardContent>
                  </Card>

                  {/* Top Opportunities */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        Top Opportunities
                        <Badge variant="secondary" className="text-xs">
                          {opportunities.length} total
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {opportunities
                          .sort((a, b) => b.fit_score - a.fit_score)
                          .slice(0, 8)
                          .map((opportunity) => (
                            <OpportunityCard
                              key={opportunity.rec_id}
                              opportunity={opportunity}
                              onAction={(action) => logEvent(action, { rec_id: opportunity.rec_id })}
                            />
                          ))}
                        
                        {opportunities.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Target className="w-12 h-12 mx-auto mb-4 opacity-40" />
                            <p>No opportunities found. Update your profile to get recommendations!</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <TrendExplorer onEvent={logEvent} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;