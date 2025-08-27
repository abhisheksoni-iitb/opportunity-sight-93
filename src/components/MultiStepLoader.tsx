import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface MultiStepLoaderProps {
  isOpen: boolean;
  onClose?: () => void;
}

const loadingSteps = [
  "Reading about you…",
  "Searching Keychain suppliers…", 
  "Identifying market trends…",
  "Scoring best opportunities for your profile…",
  "Getting expert insights…",
  "Finalizing recommendation…"
];

const MultiStepLoader: React.FC<MultiStepLoaderProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % loadingSteps.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center space-y-6 p-6">
          <div className="relative">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              KeyAI is thinking...
            </h3>
            <p className="text-muted-foreground text-sm">
              {loadingSteps[currentStep]}
            </p>
          </div>
          
          <div className="flex space-x-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MultiStepLoader;