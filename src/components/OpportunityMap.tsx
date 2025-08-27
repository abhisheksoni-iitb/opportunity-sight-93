import React from 'react';
import { MapPin, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

interface OpportunityMapProps {
  opportunities: OpportunityData[];
}

const OpportunityMap: React.FC<OpportunityMapProps> = ({ opportunities }) => {
  // Group opportunities by geography
  const groupedOpportunities = opportunities.reduce((acc, opp) => {
    const city = opp.geography?.city || 'Unknown';
    if (!acc[city]) {
      acc[city] = [];
    }
    acc[city].push(opp);
    return acc;
  }, {} as Record<string, OpportunityData[]>);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-muted';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <span>Interactive map coming soon</span>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span>High fit (80%+)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-warning rounded-full"></div>
            <span>Medium fit (60-79%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-muted rounded-full"></div>
            <span>Lower fit (<60%)</span>
          </div>
        </div>
      </div>

      {/* Temporary list-based map visualization */}
      <div className="bg-gradient-surface rounded-lg p-4 border border-border/50">
        <div className="space-y-3">
          {Object.entries(groupedOpportunities).map(([city, cityOpportunities]) => {
            const avgFitScore = Math.round(
              cityOpportunities.reduce((acc, opp) => acc + opp.fit_score, 0) / cityOpportunities.length
            );
            const totalMarketSize = cityOpportunities.reduce((acc, opp) => acc + (opp.market_size || 0), 0);

            return (
              <div
                key={city}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border/30 hover:border-primary/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${getScoreColor(avgFitScore)}`}></div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{city}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {cityOpportunities.length} opportunities
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Avg fit: {avgFitScore}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Market: ₹{(totalMarketSize / 100000).toFixed(1)}L
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">
                      {cityOpportunities[0]?.product_category}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Top category
                    </div>
                  </div>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {opportunities.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p>No geographic data available</p>
        </div>
      )}
    </div>
  );
};

export default OpportunityMap;