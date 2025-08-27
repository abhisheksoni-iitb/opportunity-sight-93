import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Users, Bot, Star } from 'lucide-react';
import OpportunityChat from './OpportunityChat';

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

interface UserOpportunityCardProps {
  opportunity: UserOpportunity;
  userId: string;
  onAction?: (action: string) => void;
}

const UserOpportunityCard: React.FC<UserOpportunityCardProps> = ({
  opportunity,
  userId,
  onAction
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-info text-info-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getFitScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 75) return 'text-warning';
    return 'text-muted-foreground';
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleAskAI = () => {
    setIsChatOpen(true);
    onAction?.('Ask KeyAI User');
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/30">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">{opportunity.specific_sku}</h3>
              </div>
              <p className="text-xs text-muted-foreground">{opportunity.recommended_category}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={getPriorityColor(opportunity.action_priority)}>
                {opportunity.action_priority}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <Star className={`w-3 h-3 ${getFitScoreColor(opportunity.fit_score)}`} />
              <span className="text-muted-foreground">Fit:</span>
              <span className={`font-bold ${getFitScoreColor(opportunity.fit_score)}`}>
                {opportunity.fit_score}%
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="text-muted-foreground">ROI:</span>
              <span className="font-medium text-success">{opportunity.expected_roi_pct}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Demand:</span>
              <p className="font-medium text-foreground">{formatNumber(opportunity.projected_monthly_demand)}/mo</p>
            </div>
            <div>
              <span className="text-muted-foreground">Confidence:</span>
              <p className="font-medium text-foreground">{opportunity.confidence}%</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs">
              <span className="text-muted-foreground">Why it fits:</span>
              <p className="text-foreground text-xs mt-1 line-clamp-2">{opportunity.why_fit}</p>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">Required:</span>
              <p className="text-foreground">{opportunity.required_certifications}</p>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">Competing brands:</span>
              <p className="text-foreground">{opportunity.top_competing_brands}</p>
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
              Ask KeyAI to analyze this opportunity
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

export default UserOpportunityCard;