import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp, Target, Bot } from 'lucide-react';
import OpportunityChat from './OpportunityChat';

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

interface LocationOpportunityCardProps {
  opportunity: LocationOpportunity;
  userId: string;
  onAction?: (action: string) => void;
}

const LocationOpportunityCard: React.FC<LocationOpportunityCardProps> = ({
  opportunity,
  userId,
  onAction
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const getCompetitionColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'bg-success/20 text-success';
      case 'medium': return 'bg-warning/20 text-warning';
      case 'high': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted/20 text-muted-foreground';
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleAskAI = () => {
    setIsChatOpen(true);
    onAction?.('Ask KeyAI Location');
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/30">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">{opportunity.location}</h3>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {opportunity.trending_categories}
              </p>
            </div>
            <Badge variant="outline" className={getCompetitionColor(opportunity.competition_level)}>
              {opportunity.competition_level} Competition
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span className="text-muted-foreground">Demand:</span>
              <span className="font-medium text-foreground">{formatNumber(opportunity.avg_monthly_demand)}/mo</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="w-3 h-3 text-success" />
              <span className="text-muted-foreground">Peak:</span>
              <span className="font-medium text-foreground">{opportunity.peak_season}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs">
              <span className="text-muted-foreground">Suggested SKUs:</span>
              <p className="text-foreground font-medium">{opportunity.suggested_skus}</p>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">Top Brands:</span>
              <p className="text-foreground">{opportunity.top_brands}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs"
              onClick={handleAskAI}
            >
              <Bot className="w-3 h-3 mr-1" />
              Ask KeyAI about this market
            </Button>
          </div>
        </CardContent>
      </Card>

      <OpportunityChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        opportunity={opportunity as any}
        userId={userId}
      />
    </>
  );
};

export default LocationOpportunityCard;