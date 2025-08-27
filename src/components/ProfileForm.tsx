import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building, 
  MapPin, 
  Award, 
  Package, 
  Settings, 
  TrendingUp,
  Plus,
  X,
  RefreshCw
} from 'lucide-react';

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

interface ProfileFormProps {
  profile: UserProfile | null;
  loading: boolean;
  onUpdate: (profile?: UserProfile) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, loading, onUpdate }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    company_name: '',
    location: { city: '', state: '', country: 'India' },
    certifications: [],
    current_products: [],
    processes: [],
    capacity: '',
    interests: []
  });

  const [newTag, setNewTag] = useState('');
  const [activeTagType, setActiveTagType] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        company_name: profile.company_name || '',
        location: profile.location || { city: '', state: '', country: 'India' },
        certifications: profile.certifications || [],
        current_products: profile.current_products || [],
        processes: profile.processes || [],
        capacity: profile.capacity || '',
        interests: profile.interests || []
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const addTag = (type: keyof UserProfile) => {
    if (!newTag.trim()) return;
    
    const currentTags = formData[type] as string[] || [];
    if (!currentTags.includes(newTag.trim())) {
      handleInputChange(type, [...currentTags, newTag.trim()]);
    }
    setNewTag('');
    setActiveTagType(null);
  };

  const removeTag = (type: keyof UserProfile, tagToRemove: string) => {
    const currentTags = formData[type] as string[] || [];
    handleInputChange(type, currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleRefresh = () => {
    onUpdate(formData as UserProfile);
  };

  const renderTagSection = (
    type: keyof UserProfile,
    label: string,
    icon: React.ReactNode,
    placeholder: string
  ) => {
    const tags = formData[type] as string[] || [];
    
    return (
      <div className="space-y-2">
        <Label className="flex items-center space-x-2 text-sm font-medium">
          {icon}
          <span>{label}</span>
        </Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="flex items-center space-x-1">
              <span>{tag}</span>
              <button
                onClick={() => removeTag(type, tag)}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        {activeTagType === type ? (
          <div className="flex space-x-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder={placeholder}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(type);
                }
                if (e.key === 'Escape') {
                  setNewTag('');
                  setActiveTagType(null);
                }
              }}
              autoFocus
            />
            <Button variant="outline" size="sm" onClick={() => addTag(type)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTagType(type)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add {label}
          </Button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company_name" className="flex items-center space-x-2">
            <Building className="w-4 h-4" />
            <span>Company Name</span>
          </Label>
          <Input
            id="company_name"
            value={formData.company_name || ''}
            onChange={(e) => handleInputChange('company_name', e.target.value)}
            placeholder="Your company name"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>Location</span>
          </Label>
          <div className="space-y-2">
            <Input
              value={formData.location?.city || ''}
              onChange={(e) => handleLocationChange('city', e.target.value)}
              placeholder="City"
            />
            <Input
              value={formData.location?.state || ''}
              onChange={(e) => handleLocationChange('state', e.target.value)}
              placeholder="State"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Capacity</span>
          </Label>
          <Input
            value={formData.capacity || ''}
            onChange={(e) => handleInputChange('capacity', e.target.value)}
            placeholder="e.g., Medium (100-500 units/day)"
          />
        </div>
      </div>

      <Separator />

      {/* Tags Sections */}
      <div className="space-y-4">
        {renderTagSection(
          'certifications',
          'Certifications',
          <Award className="w-4 h-4" />,
          'e.g., ISO 9001, FSSAI'
        )}

        {renderTagSection(
          'current_products',
          'Current Products',
          <Package className="w-4 h-4" />,
          'e.g., Organic Foods, Electronics'
        )}

        {renderTagSection(
          'processes',
          'Manufacturing Processes',
          <Settings className="w-4 h-4" />,
          'e.g., Food Processing, PCB Assembly'
        )}

        {renderTagSection(
          'interests',
          'Market Interests',
          <TrendingUp className="w-4 h-4" />,
          'e.g., Sustainable Fashion, IoT Devices'
        )}
      </div>

      <Separator />

      <Button 
        variant="gradient" 
        className="w-full" 
        onClick={handleRefresh}
        disabled={loading}
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        Refresh Opportunities
      </Button>
    </div>
  );
};

export default ProfileForm;