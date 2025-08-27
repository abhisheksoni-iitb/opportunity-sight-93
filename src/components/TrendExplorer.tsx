import React, { useState } from 'react';
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
  Sparkles,
  Search,
  MapPin,
  DollarSign,
  TrendingUp,
  Building,
  Star,
  ArrowRight,
  BookmarkPlus,
  Eye,
  Globe,
  Target,
  RefreshCw
} from 'lucide-react';

interface AIOpportunity {
  rank: number;
  title: string;
  product_category: string;
  geography: string;
  score: number;
  why: string;
  steps: string[];
  required_setup: string[];
  suggested_brands: string[];
  supplier_keywords: string[];
}

interface TrendExplorerProps {
  onEvent: (eventType: string, metadata: any) => void;
}

const TrendExplorer: React.FC<TrendExplorerProps> = ({ onEvent }) => {
  const [loading, setLoading] = useState(false);
  const [opportunities, setOpportunities] = useState<AIOpportunity[]>(() => {
    // Load from session storage on component mount
    const saved = sessionStorage.getItem('trendExplorerResults');
    return saved ? JSON.parse(saved) : [];
  });
  const [formData, setFormData] = useState(() => {
    // Load form data from session storage
    const saved = sessionStorage.getItem('trendExplorerForm');
    return saved ? JSON.parse(saved) : {
      location: '',
      budget: '',
      processes: '',
      certifications: '',
      target_brands: '',
      industries: '',
      query_text: ''
    };
  });

  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    const newData = {
      ...formData,
      [field]: value
    };
    setFormData(newData);
    // Save to session storage
    sessionStorage.setItem('trendExplorerForm', JSON.stringify(newData));
  };

  const handleExplore = async () => {
    if (!formData.query_text.trim()) {
      toast({
        title: "Query required",
        description: "Please enter a question or trend to explore.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Build enhanced query with criteria
      let enhancedQuery = formData.query_text;
      const criteria = [];
      
      if (formData.location) criteria.push(`Location(s): ${formData.location}`);
      if (formData.budget) criteria.push(`Budget Range: ${formData.budget}`);
      if (formData.processes) criteria.push(`Available Processes: ${formData.processes}`);
      if (formData.certifications) criteria.push(`Certifications: ${formData.certifications}`);
      if (formData.target_brands) criteria.push(`Target Brands: ${formData.target_brands}`);
      if (formData.industries) criteria.push(`Industries: ${formData.industries}`);
      
      if (criteria.length > 0) {
        enhancedQuery = `${formData.query_text}\n\nCriteria:\n${criteria.join(';\n')};`;
      }

      const response = await supabase.functions.invoke('gemini-trends', {
        body: {
          user_id: '11111111-1111-1111-1111-111111111111', // Demo user
          query_text: enhancedQuery,
          location: formData.location,
          budget: formData.budget,
          processes: formData.processes.split(',').map(p => p.trim()).filter(Boolean),
          certifications: formData.certifications.split(',').map(c => c.trim()).filter(Boolean),
          target_brands: formData.target_brands.split(',').map(b => b.trim()).filter(Boolean),
          industries: formData.industries.split(',').map(i => i.trim()).filter(Boolean)
        }
      });

      if (response.error) throw response.error;
      
      // Handle rate limiting
      if (response.data?.rateLimited) {
        toast({
          title: "Rate Limit Exceeded",
          description: response.data.error,
          variant: "destructive"
        });
        return;
      }
      
      const results = response.data?.opportunities || [];
      setOpportunities(results);
      // Save to session storage
      sessionStorage.setItem('trendExplorerResults', JSON.stringify(results));
      
      onEvent('gemini_query', { query: formData.query_text, results_count: results.length });
      
      toast({
        title: "Analysis complete",
        description: `Found ${results.length} AI-powered opportunities.`
      });
    } catch (error) {
      console.error('Error exploring trends:', error);
      toast({
        title: "Analysis failed",
        description: "Please try again later or simplify your query.",
        variant: "destructive"
      });
      
      // Mock response for demo
      const mockOpportunities: AIOpportunity[] = [
        {
          rank: 1,
          title: "Sustainable Packaging Solutions for E-commerce",
          product_category: "Eco-friendly Packaging",
          geography: "Bengaluru, Karnataka",
          score: 92,
          why: "Rising e-commerce demand and environmental consciousness create perfect market conditions. Your location in tech hub provides access to innovative startups needing sustainable packaging.",
          steps: [
            "Research biodegradable materials suppliers",
            "Develop prototypes for common package sizes",
            "Partner with local e-commerce companies",
            "Obtain environmental certifications",
            "Scale production based on demand"
          ],
          required_setup: ["Packaging machinery", "Environmental certification", "Quality testing lab"],
          suggested_brands: ["Amazon", "Flipkart", "Nykaa", "BigBasket"],
          supplier_keywords: ["biodegradable materials", "packaging machinery", "eco-friendly supplies"]
        },
        {
          rank: 2,
          title: "Smart Home IoT Components",
          product_category: "IoT Electronics",
          geography: "Pune, Maharashtra",
          score: 87,
          why: "Growing smart home adoption in urban areas. Your electronics background positions you well for component manufacturing in this rapidly expanding market.",
          steps: [
            "Identify high-demand IoT components",
            "Set up PCB manufacturing capabilities",
            "Develop testing protocols",
            "Build relationships with system integrators",
            "Establish quality certifications"
          ],
          required_setup: ["PCB manufacturing equipment", "Testing facilities", "Clean room setup"],
          suggested_brands: ["Xiaomi", "Amazon", "Google", "Philips"],
          supplier_keywords: ["IoT sensors", "microcontrollers", "wireless modules"]
        }
      ];
      setOpportunities(mockOpportunities);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action: string, opportunity: AIOpportunity) => {
    onEvent(action, { 
      opportunity_title: opportunity.title,
      rank: opportunity.rank,
      score: opportunity.score
    });
    
    if (action === 'save') {
      toast({
        title: "Saved to market plan",
        description: `"${opportunity.title}" has been added to your opportunities.`
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Content Area */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Panel - Criteria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Explore Trends</span>
            </CardTitle>
            <CardDescription>
              Set your parameters and discover AI-powered market opportunities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location(s)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., New York, California, Texas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget Range</Label>
              <Input
                id="budget"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                placeholder="e.g., $100K - $500K"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="processes">Available Processes</Label>
              <Input
                id="processes"
                value={formData.processes}
                onChange={(e) => handleInputChange('processes', e.target.value)}
                placeholder="e.g., Manufacturing, Assembly"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications</Label>
              <Input
                id="certifications"
                value={formData.certifications}
                onChange={(e) => handleInputChange('certifications', e.target.value)}
                placeholder="e.g., ISO 9001, CE Marking"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_brands">Target Brands</Label>
              <Input
                id="target_brands"
                value={formData.target_brands}
                onChange={(e) => handleInputChange('target_brands', e.target.value)}
                placeholder="e.g., Amazon, Walmart, Target"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industries">Industries</Label>
              <Input
                id="industries"
                value={formData.industries}
                onChange={(e) => handleInputChange('industries', e.target.value)}
                placeholder="e.g., E-commerce, Healthcare, Manufacturing"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="query_text">Free-form Question</Label>
              <Textarea
                id="query_text"
                value={formData.query_text}
                onChange={(e) => handleInputChange('query_text', e.target.value)}
                placeholder="e.g., What are the trending opportunities in sustainable packaging for US manufacturers?"
                rows={4}
              />
            </div>

            <Button 
              variant="gradient" 
              className="w-full" 
              onClick={handleExplore}
              disabled={loading}
            >
              <Sparkles className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Analyzing...' : 'Ask Gemini AI'}
            </Button>
          </CardContent>
        </Card>

        {/* Right Panel - Criteria Summary and Results */}
        <div className="space-y-6">
          {/* Active Criteria Display */}
          <Card className="bg-muted/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Active Search Criteria</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {formData.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span className="text-muted-foreground">Location:</span>
                    <span className="text-foreground font-medium">{formData.location}</span>
                  </div>
                )}
                {formData.budget && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-3 h-3 text-success" />
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="text-foreground font-medium">{formData.budget}</span>
                  </div>
                )}
                {formData.target_brands && (
                  <div className="flex items-center space-x-2">
                    <Building className="w-3 h-3 text-warning" />
                    <span className="text-muted-foreground">Target Brands:</span>
                    <span className="text-foreground font-medium">{formData.target_brands}</span>
                  </div>
                )}
                {!formData.location && !formData.budget && !formData.target_brands && (
                  <p className="text-muted-foreground italic">Set criteria on the left to see them here</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {opportunities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>AI-Powered Opportunities</span>
                </CardTitle>
                <CardDescription>
                  Ranked insights from Gemini AI based on your criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                  {opportunities.map((opportunity) => (
                    <Card key={opportunity.rank} className="border-border/50 hover:border-primary/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline" className="px-2 py-1 text-xs">
                                #{opportunity.rank}
                              </Badge>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-accent" />
                                <span className="text-sm font-medium text-accent">{opportunity.score}%</span>
                              </div>
                            </div>
                            <h4 className="font-semibold text-base text-foreground mb-1 line-clamp-2">
                              {opportunity.title}
                            </h4>
                            <div className="flex items-center space-x-3 text-sm text-muted-foreground mb-2">
                              <div className="flex items-center space-x-1">
                                <Building className="w-3 h-3" />
                                <span className="truncate">{opportunity.product_category}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{opportunity.geography}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium text-sm text-foreground mb-1">Why this opportunity?</h5>
                            <p className="text-xs text-muted-foreground line-clamp-2">{opportunity.why}</p>
                          </div>

                          <div>
                            <h5 className="font-medium text-sm text-foreground mb-1">Next Steps</h5>
                            <ul className="space-y-1">
                              {opportunity.steps.slice(0, 2).map((step, index) => (
                                <li key={index} className="text-xs text-muted-foreground flex items-start space-x-2">
                                  <span className="text-primary font-medium">{index + 1}.</span>
                                  <span className="line-clamp-1">{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-border/30">
                            <div className="flex space-x-1">
                              <Button
                                variant="analytics"
                                size="sm"
                                className="text-xs px-2 py-1"
                                onClick={() => handleAction('save', opportunity)}
                              >
                                <BookmarkPlus className="w-3 h-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs px-2 py-1"
                                onClick={() => handleAction('view_suppliers', opportunity)}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Suppliers
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs px-2 py-1"
                              onClick={() => handleAction('show_map', opportunity)}
                            >
                              <Globe className="w-3 h-3 mr-1" />
                              Map
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {opportunities.length === 0 && !loading && (
            <Card className="bg-gradient-to-br from-primary/5 via-transparent to-primary/10 border-primary/20">
              <CardContent className="p-8 text-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-full blur-3xl"></div>
                  <Sparkles className="relative w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-deep bg-clip-text text-transparent mb-2">
                  🚀 Ready to Explore Market Trends?
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                  Discover emerging opportunities tailored to your business capabilities and market interests. Get actionable insights in seconds.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <Badge variant="outline" className="px-3 py-1 bg-background/50 backdrop-blur-sm text-xs">
                    🤖 AI-Powered Analysis
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 bg-background/50 backdrop-blur-sm text-xs">
                    📊 Real-time Insights
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 bg-background/50 backdrop-blur-sm text-xs">
                    ⚡ Actionable Steps
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {loading && (
            <Card>
              <CardContent className="p-8 text-center">
                <RefreshCw className="w-6 h-6 mx-auto mb-3 animate-spin text-primary" />
                <h3 className="text-base font-semibold text-foreground mb-1">
                  Analyzing Market Trends...
                </h3>
                <p className="text-sm text-muted-foreground">
                  Gemini AI is processing your query and market data
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendExplorer;