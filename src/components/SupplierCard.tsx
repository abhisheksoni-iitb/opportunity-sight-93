import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Star, ExternalLink } from 'lucide-react';

interface SupplierCardProps {
  name: string;
  location: string;
  speciality: string;
  rating?: number;
  verified?: boolean;
}

const SupplierCard: React.FC<SupplierCardProps> = ({
  name,
  location,
  speciality,
  rating = 4.5,
  verified = true
}) => {
  return (
    <Card className="border border-border/50 hover:border-primary/20 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-sm text-foreground">{name}</h4>
          </div>
          {verified && (
            <Badge variant="secondary" className="text-xs">
              Verified
            </Badge>
          )}
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{location}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Star className="w-3 h-3 text-yellow-500" />
            <span className="text-xs text-muted-foreground">{rating}/5.0</span>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Specializes in: <span className="text-foreground font-medium">{speciality}</span>
          </p>
        </div>
        
        <Button size="sm" variant="outline" className="w-full">
          <ExternalLink className="w-3 h-3 mr-2" />
          Connect
        </Button>
      </CardContent>
    </Card>
  );
};

export default SupplierCard;