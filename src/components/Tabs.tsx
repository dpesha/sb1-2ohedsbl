import React from 'react';

interface TabsProps {
  tabs: string[];
  currentTab: number;
  onChange: (index: number) => void;
  completedSteps: number[];
}

export const Tabs: React.FC<TabsProps> = ({ tabs, currentTab, onChange, completedSteps }) => {
  return (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex flex-wrap gap-2" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => onChange(index)}
              className={`
                relative min-w-0 flex-1 overflow-hidden p-4 text-sm font-medium
                hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                border-b-2
                ${currentTab === index ? 'border-blue-500 text-blue-600' :
                  completedSteps.includes(index) ? 'border-green-500 text-green-600' :
                  'border-transparent text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};