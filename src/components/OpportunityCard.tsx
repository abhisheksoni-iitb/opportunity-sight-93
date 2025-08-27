import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  MapPin,
  TrendingUp,
  Target,
  Settings,
  Award,
  Bookmark,
  MessageSquare,
  Users,
  Bot
} from 'lucide-react';
import OpportunityChat from './OpportunityChat';

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
  userId?: string;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, onAction, userId = '00000000-0000-0000-0000-000000000001' }) => {
  const [showChat, setShowChat] = useState(false);
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

  return (
    <Card className="hover:shadow-medium transition-shadow duration-300 border-border/50 bg-card">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header - Simplified */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground truncate">
                {opportunity.product_category}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">
                  {opportunity.geography?.states?.join(', ') || 'Multiple locations'}
                </span>
              </div>
            </div>
            
            {/* Fit Score Badge */}
            <Badge 
              variant="outline" 
              className={`${getFitScoreBg(opportunity.fit_score)} ${getFitScoreColor(opportunity.fit_score)} border-0 font-medium text-xs ml-2 flex-shrink-0`}
            >
              {opportunity.fit_score}%
            </Badge>
          </div>

          {/* Key Metrics - Simplified */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Demand: {opportunity.demand_score}%</span>
            <span>Market: {formatCurrency(opportunity.market_size)}</span>
            <span>Price: {formatCurrency(opportunity.avg_price)}</span>
          </div>

          {/* Brand Preview */}
          {opportunity.trending_brands && opportunity.trending_brands.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Brand: </span>
              {opportunity.trending_brands[0]}
              {opportunity.trending_brands.length > 1 && (
                <span className="ml-1">+{opportunity.trending_brands.length - 1} more</span>
              )}
            </div>
          )}

          {/* Actions - Simplified */}
          <div className="flex space-x-2 pt-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                  View Details
                </Button>
              </DialogTrigger>
               <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    {opportunity.product_category}
                  </DialogTitle>
                  <DialogDescription className="text-base flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{opportunity.geography?.states?.join(', ') || 'Multiple locations'}</span>
                    </span>
                    <Badge className={`${getFitScoreBg(opportunity.fit_score)} ${getFitScoreColor(opportunity.fit_score)} border-0`}>
                      {opportunity.fit_score}% match
                    </Badge>
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Why This Matches */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold flex items-center space-x-2">
                      <Target className="w-5 h-5 text-primary" />
                      <span>Why This Matches You</span>
                    </h4>
                    <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                      <p className="text-muted-foreground leading-relaxed">
                        {opportunity.reasoning || 'This opportunity aligns well with your current capabilities and market position.'}
                      </p>
                    </div>
                  </div>

                  {/* Market Metrics */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-success" />
                      <span>Market Metrics</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-card border border-border rounded-lg p-4">
                        <div className="text-2xl font-bold text-foreground">
                          {opportunity.demand_score}%
                        </div>
                        <div className="text-sm text-muted-foreground">Demand Score</div>
                      </div>
                      <div className="bg-card border border-border rounded-lg p-4">
                        <div className="text-2xl font-bold text-foreground">
                          {formatCurrency(opportunity.market_size)}
                        </div>
                        <div className="text-sm text-muted-foreground">Market Size</div>
                      </div>
                      <div className="bg-card border border-border rounded-lg p-4">
                        <div className="text-2xl font-bold text-foreground">
                          {formatCurrency(opportunity.avg_price)}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Price</div>
                      </div>
                      <div className="bg-card border border-border rounded-lg p-4">
                        <div className="text-2xl font-bold text-foreground">
                          {opportunity.supplier_density || 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground">Supplier Density</div>
                      </div>
                    </div>
                  </div>

                  {/* Setup Requirements */}
                  {opportunity.setup_requirements && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold flex items-center space-x-2">
                        <Settings className="w-5 h-5 text-warning" />
                        <span>Required Setup</span>
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(opportunity.setup_requirements).map(([key, value]) => (
                          <div key={key} className="bg-card border border-border rounded-lg p-3">
                            <div className="font-medium text-foreground capitalize">
                              {key.replace('_', ' ')}
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {Array.isArray(value) ? value.join(', ') : String(value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Brands */}
                  {opportunity.trending_brands && opportunity.trending_brands.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold flex items-center space-x-2">
                        <Award className="w-5 h-5 text-primary" />
                        <span>Trending Brands</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {opportunity.trending_brands.map((brand, index) => (
                          <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                            {brand}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-border">
                  <Button
                    onClick={() => onAction('save')}
                    className="flex-1 bg-primary hover:bg-primary-deep text-primary-foreground"
                  >
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save Opportunity
                  </Button>
                  <Button
                    onClick={() => onAction('contact')}
                    variant="outline"
                    className="flex-1"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Brand
                  </Button>
                  <Button
                    onClick={() => onAction('suppliers')}
                    variant="outline"
                    className="flex-1"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View Suppliers
                  </Button>
                 </div>
               </DialogContent>
            </Dialog>

            <Button
              onClick={() => setShowChat(true)}
              size="sm"
              variant="outline"
              className="text-xs h-8 px-3"
            >
              <Bot className="w-3 h-3 mr-1" />
              Ask KeyAI
            </Button>

            <Button
              onClick={() => onAction('save')}
              size="sm"
              className="bg-primary hover:bg-primary-deep text-primary-foreground text-xs h-8"
            >
              <Bookmark className="w-3 h-3 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </CardContent>

      <OpportunityChat
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        opportunity={opportunity}
        userId={userId}
      />
    </Card>
  );
};

export default OpportunityCard;