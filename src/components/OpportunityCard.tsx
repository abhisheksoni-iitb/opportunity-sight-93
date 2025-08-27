import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Star,
  TrendingUp,
  MapPin,
  Users,
  DollarSign,
  BookmarkPlus,
  Mail,
  Eye,
  ArrowRight,
  Building,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

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

interface OpportunityCardProps {
  opportunity: OpportunityData;
  onAction: (action: string) => void;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, onAction }) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const getFitScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getFitScoreBg = (score: number) => {
    if (score >= 80) return 'bg-success/10 border-success/20';
    if (score >= 60) return 'bg-warning/10 border-warning/20';
    return 'bg-muted/10 border-muted/20';
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const handleAction = (action: string) => {
    onAction(action);
    if (action === 'view_details') {
      setIsDetailOpen(true);
    }
  };

  return (
    <Card className="hover:shadow-medium transition-all duration-200 border-border/50 hover:border-primary/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-1">{opportunity.product_category}</h4>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{opportunity.geography?.city || 'Unknown'}, {opportunity.geography?.state || 'India'}</span>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-lg border ${getFitScoreBg(opportunity.fit_score)}`}>
            <div className="flex items-center space-x-1">
              <Star className={`w-3 h-3 ${getFitScoreColor(opportunity.fit_score)}`} />
              <span className={`text-xs font-medium ${getFitScoreColor(opportunity.fit_score)}`}>
                {opportunity.fit_score}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-3 h-3 text-primary" />
            <span className="text-muted-foreground">Demand:</span>
            <span className="text-foreground font-medium">{opportunity.demand_score}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSign className="w-3 h-3 text-accent" />
            <span className="text-muted-foreground">Market:</span>
            <span className="text-foreground font-medium">{formatCurrency(opportunity.market_size || 0)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3 text-secondary" />
            <span className="text-muted-foreground">Suppliers:</span>
            <span className="text-foreground font-medium">{opportunity.supplier_density || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Building className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Avg Price:</span>
            <span className="text-foreground font-medium">₹{opportunity.avg_price || 0}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          <div className="flex space-x-2">
            <Button
              variant="analytics"
              size="sm"
              onClick={() => handleAction('view_details')}
            >
              <Eye className="w-3 h-3 mr-1" />
              Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('save')}
            >
              <BookmarkPlus className="w-3 h-3" />
            </Button>
          </div>
          <Badge variant="outline" className="text-xs">
            {opportunity.trending_brands?.[0] || 'Market Leader'}
          </Badge>
        </div>

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>{opportunity.product_category}</span>
              </DialogTitle>
              <DialogDescription>
                Market opportunity in {opportunity.geography?.city}, {opportunity.geography?.state}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Fit Score Analysis */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center space-x-2">
                  <Star className="w-4 h-4" />
                  <span>Why This Matches You ({opportunity.fit_score}% fit)</span>
                </h4>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-foreground">{opportunity.reasoning || 'Strong alignment with your business capabilities and market positioning.'}</p>
                </div>
              </div>

              {/* Market Metrics */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Market Size</p>
                        <p className="text-xl font-bold text-foreground">{formatCurrency(opportunity.market_size || 0)}</p>
                      </div>
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Demand Score</p>
                        <p className="text-xl font-bold text-foreground">{opportunity.demand_score}%</p>
                      </div>
                      <Star className="w-6 h-6 text-accent" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Setup Requirements */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Required Setup</span>
                </h4>
                <div className="space-y-2">
                  {(opportunity.setup_requirements?.requirements || []).map((req: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-warning" />
                      <span className="text-sm text-foreground">{req}</span>
                    </div>
                  ))}
                  {(!opportunity.setup_requirements?.requirements || opportunity.setup_requirements.requirements.length === 0) && (
                    <p className="text-sm text-muted-foreground">No specific setup requirements identified.</p>
                  )}
                </div>
              </div>

              {/* Trending Brands */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center space-x-2">
                  <Building className="w-4 h-4" />
                  <span>Key Players</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {opportunity.trending_brands.map((brand, index) => (
                    <Badge key={index} variant="outline">
                      {brand}
                    </Badge>
                  ))}
                  {opportunity.trending_brands.length === 0 && (
                    <p className="text-sm text-muted-foreground">Market players data not available.</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <Separator />
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button
                    variant="success"
                    onClick={() => handleAction('save')}
                  >
                    <BookmarkPlus className="w-4 h-4 mr-2" />
                    Save to Market Plan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAction('contact')}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Brands
                  </Button>
                </div>
                <Button
                  variant="analytics"
                  onClick={() => handleAction('view_suppliers')}
                >
                  View Suppliers
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default OpportunityCard;