import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Copy, Save, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatMessageContent } from '@/lib/utils';
import MultiStepLoader from './MultiStepLoader';
import SupplierCard from './SupplierCard';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TrendChatProps {
  userId: string;
  userLocation?: any;
}

const sampleQueries = [
  "What's trending in organic beverages in the USA?",
  "Suggest trending categories for a small setup with low budget",
  "What are best new products for my certifications?",
  "Who are the top buyers for energy drinks in New York?"
];

const TrendChat: React.FC<TrendChatProps> = ({ userId, userLocation }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Load from session storage on init
    try {
      const saved = sessionStorage.getItem('trendchat-messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Save to session storage whenever messages change
  React.useEffect(() => {
    try {
      sessionStorage.setItem('trendchat-messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }, [messages]);

  const handleSendMessage = async (query?: string) => {
    const messageText = query || inputValue.trim();
    if (!messageText || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('keyai-chat', {
        body: {
          type: 'trend-exploration',
          query: messageText,
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
        description: "Failed to get trend insights. Please try again.",
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
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>KeyAI Trend Advisor</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Sample Queries */}
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Try asking KeyAI about market trends and opportunities:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {sampleQueries.map((query, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-auto p-3 text-left justify-start"
                    onClick={() => handleSendMessage(query)}
                    disabled={isLoading}
                  >
                    <Bot className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-xs">{query}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

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
          </div>

          {/* Input */}
          <div className="flex-shrink-0 flex space-x-2 pt-4 border-t">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about market trends and opportunities..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <MultiStepLoader isOpen={isLoading} />
    </>
  );
};

export default TrendChat;