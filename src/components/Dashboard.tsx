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
import LocationOpportunityCard from '@/components/LocationOpportunityCard';
import UserOpportunityCard from '@/components/UserOpportunityCard';
import ProfileForm from '@/components/ProfileForm';
import TrendChat from '@/components/TrendChat';
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

interface LocationOpportunity {
  rec_id: number;
  location: string;
  trending_categories: string;
  top_brands: string;
  avg_monthly_demand: number;
  peak_season: string;
  competition_level: string;
  suggested_skus: string;
  why_trending: string;
  last_updated: string;
}

interface UserOpportunity {
  rec_id: number;
  user_id: number;
  recommended_category: string;
  specific_sku: string;
  fit_score: number;
  projected_monthly_demand: number;
  top_competing_brands: string;
  expected_roi_pct: number;
  why_fit: string;
  action_priority: string;
  confidence: number;
  required_certifications: string;
  last_recommended: string;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('opportunities');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [locationOpportunities, setLocationOpportunities] = useState<LocationOpportunity[]>([]);
  const [userOpportunities, setUserOpportunities] = useState<UserOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const { toast } = useToast();

  // Demo user ID for development
  const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

  useEffect(() => {
    loadUserProfile();
    loadRecommendations();
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

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      // Load location opportunities
      const { data: locationData, error: locationError } = await supabase
        .from('location_recommendations')
        .select('*')
        .order('avg_monthly_demand', { ascending: false });

      if (locationError) throw locationError;

      // Load user opportunities
      const { data: userData, error: userError } = await supabase
        .from('user_recommendations')
        .select('*')
        .order('fit_score', { ascending: false });

      if (userError) throw userError;

      setLocationOpportunities(locationData || []);
      setUserOpportunities(userData || []);
      
      toast({
        title: "Recommendations loaded",
        description: `Found ${(locationData?.length || 0) + (userData?.length || 0)} opportunities.`
      });
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast({
        title: "Error loading recommendations",
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
    loadRecommendations();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl border border-primary/20 py-8 px-6 mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-60"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-8 bg-gradient-to-b from-primary to-primary-deep rounded-full"></div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-deep bg-clip-text text-transparent">
                  Market Navigator
                </h1>
              </div>
              <p className="text-lg text-muted-foreground ml-5">
                AI-powered market intelligence & opportunity discovery platform
              </p>
              <div className="flex items-center space-x-4 ml-5 pt-2">
                <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                  🎯 Personalized Insights
                </Badge>
                <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                  📈 Real-time Trends
                </Badge>
                <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                  🤖 KeyAI Powered
                </Badge>
              </div>
            </div>
            <Button
              onClick={() => setActiveTab('opportunities')}
              size="lg"
              className="bg-primary hover:bg-primary-deep text-primary-foreground font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Target className="w-5 h-5 mr-2" />
              Explore Opportunities
            </Button>
          </div>
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
              <TabsTrigger 
                value="profile"
                className="px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Profile & Docs
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="opportunities" className="space-y-6 mt-6">
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-primary/20">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-6 h-6 mx-auto mb-1 text-primary" />
                      <div className="text-xl font-bold text-foreground">
                        {userOpportunities.length}
                      </div>
                      <p className="text-muted-foreground text-xs">Personal Opps</p>
                    </CardContent>
                  </Card>

                  <Card className="border-success/20">
                    <CardContent className="p-4 text-center">
                      <Target className="w-6 h-6 mx-auto mb-1 text-success" />
                      <div className="text-xl font-bold text-foreground">
                        {userOpportunities.length > 0 
                          ? Math.round(userOpportunities.reduce((acc, opp) => acc + opp.fit_score, 0) / userOpportunities.length)
                          : 0
                        }%
                      </div>
                      <p className="text-muted-foreground text-xs">Avg Fit Score</p>
                    </CardContent>
                  </Card>

                  <Card className="border-warning/20">
                    <CardContent className="p-4 text-center">
                      <MapPin className="w-6 h-6 mx-auto mb-1 text-warning" />
                      <div className="text-xl font-bold text-foreground">
                        {locationOpportunities.length}
                      </div>
                      <p className="text-muted-foreground text-xs">Market Areas</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Sub-tabs for different opportunity types */}
                <Tabs defaultValue="geographic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="geographic" className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>Geographic Opportunities</span>
                    </TabsTrigger>
                    <TabsTrigger value="personal" className="flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>Top Personal Opportunities</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="geographic" className="mt-6">
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            <span>Geographic Market Opportunities</span>
                          </div>
                          <Badge variant="secondary" className="text-sm">
                            {locationOpportunities.length} markets
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Location-based opportunities with high market demand and growth potential
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
                          {locationOpportunities.map((opportunity) => (
                            <LocationOpportunityCard
                              key={opportunity.rec_id}
                              opportunity={opportunity}
                              userId={DEMO_USER_ID}
                              onAction={(action) => logEvent(action, { rec_id: opportunity.rec_id })}
                            />
                          ))}
                          
                          {locationOpportunities.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                              <MapPin className="w-16 h-16 mx-auto mb-4 opacity-40" />
                              <h3 className="text-lg font-medium mb-2">No Geographic Opportunities</h3>
                              <p>We're analyzing market data to find location-based opportunities for you.</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="personal" className="mt-6">
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Target className="w-5 h-5 text-primary" />
                            <span>Personalized Opportunities</span>
                          </div>
                          <Badge variant="secondary" className="text-sm">
                            {userOpportunities.length} matches
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Tailored recommendations based on your profile, capabilities, and market fit
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
                          {userOpportunities
                            .sort((a, b) => b.fit_score - a.fit_score)
                            .map((opportunity) => (
                              <UserOpportunityCard
                                key={opportunity.rec_id}
                                opportunity={opportunity}
                                userId={DEMO_USER_ID}
                                onAction={(action) => logEvent(action, { rec_id: opportunity.rec_id })}
                              />
                            ))}
                          
                          {userOpportunities.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                              <Target className="w-16 h-16 mx-auto mb-4 opacity-40" />
                              <h3 className="text-lg font-medium mb-2">No Personal Opportunities</h3>
                              <p>Complete your profile to get personalized recommendations.</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChat userId={DEMO_USER_ID} userLocation={userProfile?.location} />
              <TrendExplorer onEvent={logEvent} />
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <User className="w-6 h-6 text-primary" />
                    <span>Your Profile & Documents</span>
                  </CardTitle>
                  <CardDescription>
                    Manage your company profile and documentation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ProfileForm 
                    profile={userProfile}
                    loading={profileLoading}
                     onUpdate={(updatedProfile) => {
                       if (updatedProfile) {
                         handleProfileUpdate(updatedProfile);
                       } else {
                         loadRecommendations();
                       }
                     }}
                  />
                  
                  <div className="pt-6 border-t border-border">
                    <h3 className="text-lg font-medium mb-4">Documents</h3>
                    <div className="text-center py-8 bg-muted/20 rounded-lg border-2 border-dashed border-border">
                      <div className="space-y-3">
                        <div className="text-4xl">📁</div>
                        <div className="space-y-1">
                          <h4 className="font-medium text-foreground">Document Management</h4>
                          <p className="text-sm text-muted-foreground">Coming Soon</p>
                        </div>
                        <Button variant="outline" disabled>
                          Add Document
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;