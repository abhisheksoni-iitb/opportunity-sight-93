import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Copy, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatMessageContent } from '@/lib/utils';
import MultiStepLoader from './MultiStepLoader';
import SupplierCard from './SupplierCard';

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

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface OpportunityChatProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: OpportunityData;
  userId: string;
}

const OpportunityChat: React.FC<OpportunityChatProps> = ({
  isOpen,
  onClose,
  opportunity,
  userId
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialInsight, setHasInitialInsight] = useState(false);
  const { toast } = useToast();

  const generateInitialInsight = async () => {
    if (hasInitialInsight) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('keyai-chat', {
        body: {
          type: 'opportunity-insight',
          data: opportunity,
          userId
        }
      });

      if (error) throw error;

      // Handle rate limiting
      if (data.rateLimited) {
        toast({
          title: "Rate Limit Exceeded",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      };

      setMessages([newMessage]);
      setHasInitialInsight(true);
    } catch (error) {
      console.error('Error generating insight:', error);
      toast({
        title: "Error",
        description: "Failed to generate insights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && !hasInitialInsight) {
      generateInitialInsight();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('keyai-chat', {
        body: {
          type: 'opportunity-insight',
          data: opportunity,
          query: inputValue,
          userId
        }
      });

      if (error) throw error;

      // Handle rate limiting
      if (data.rateLimited) {
        toast({
          title: "Rate Limit Exceeded",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Message copied to clipboard.",
    });
  };

  const extractSuppliers = (content: string) => {
    const supplierMatches = content.match(/SUPPLIER:\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^\n]+)/g) || [];
    return supplierMatches.map(match => {
      const parts = match.replace('SUPPLIER:', '').split('|').map(p => p.trim());
      return {
        name: parts[0] || 'Unknown Supplier',
        location: parts[1] || 'Location TBD',
        speciality: parts[2] || 'General Manufacturing'
      };
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-primary" />
              <span>KeyAI Insights</span>
              <Badge variant="outline" className="ml-auto">
                {opportunity.product_category}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {messages.map((message) => (
                <Card key={message.id} className={`${message.role === 'user' ? 'ml-8' : 'mr-8'}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-2">
                      {message.role === 'assistant' ? (
                        <Bot className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      ) : (
                        <User className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                      )}
                        <div className="flex-1 space-y-2">
                          <div className="text-sm text-foreground break-words max-w-full overflow-hidden">
                            <div dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }} />
                          </div>
                          
                          {/* Render supplier cards if present in assistant messages */}
                          {message.role === 'assistant' && message.content.includes('SUPPLIER:') && (
                            <div className="mt-4">
                              <h4 className="text-sm font-semibold mb-3 text-foreground">🤝 Connect with Suppliers for this Opportunity</h4>
                              <div className="grid grid-cols-1 gap-2">
                                {extractSuppliers(message.content).map((supplier, index) => (
                                  <SupplierCard
                                    key={index}
                                    name={supplier.name}
                                    location={supplier.location}
                                    speciality={supplier.speciality}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          
                         {message.role === 'assistant' && (
                           <div className="flex space-x-2 mt-3">
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => copyToClipboard(message.content)}
                             >
                               <Copy className="w-3 h-3 mr-1" />
                               Copy
                             </Button>
                             <Button variant="ghost" size="sm">
                               <Save className="w-3 h-3 mr-1" />
                               Save to Plan
                             </Button>
                           </div>
                         )}
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {messages.length === 0 && !isLoading && (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>KeyAI is analyzing this opportunity for you...</p>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex-shrink-0 flex space-x-2 pt-4 border-t">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask more about this opportunity..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <MultiStepLoader isOpen={isLoading} />
    </>
  );
};

export default OpportunityChat;