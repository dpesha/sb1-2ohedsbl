import React from 'react';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  steps: string[];
  currentStep: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full py-4">
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={step} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                <div className={`w-full h-1 ${
                  index === 0 ? 'hidden' : ''
                } ${isCompleted ? 'bg-blue-500' : 'bg-gray-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-blue-500 text-white' :
                  isCurrent ? 'bg-blue-100 text-blue-500 border-2 border-blue-500' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className={`w-full h-1 ${
                  index === steps.length - 1 ? 'hidden' : ''
                } ${isCompleted ? 'bg-blue-500' : 'bg-gray-200'}`} />
              </div>
              <span className={`mt-2 text-sm ${
                isCurrent ? 'text-blue-500 font-medium' : 'text-gray-500'
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};