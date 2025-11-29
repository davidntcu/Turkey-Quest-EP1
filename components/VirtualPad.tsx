import React from 'react';

interface VirtualPadProps {
  onUp: () => void;
  onDown: () => void;
  onSelect: () => void;
  onBack?: () => void;
}

export const VirtualPad: React.FC<VirtualPadProps> = ({ onUp, onDown, onSelect }) => {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-center gap-2 z-50 md:hidden opacity-80">
      <div className="flex gap-2">
        <button 
          onClick={onUp}
          className="w-14 h-14 bg-gray-700 rounded-full border-2 border-white text-2xl active:bg-gray-500 flex items-center justify-center shadow-lg"
        >
          ▲
        </button>
      </div>
      <div className="flex gap-14">
         {/* Spacer for D-Pad layout */}
      </div>
      <div className="flex gap-2">
        <button 
          onClick={onDown}
          className="w-14 h-14 bg-gray-700 rounded-full border-2 border-white text-2xl active:bg-gray-500 flex items-center justify-center shadow-lg"
        >
          ▼
        </button>
      </div>
      
      {/* Action Button - positioned absolute relative to this container or fixed nearby */}
      <button 
        onClick={onSelect}
        className="fixed bottom-12 right-6 w-20 h-20 bg-red-700 rounded-full border-4 border-white text-xl font-bold active:bg-red-500 shadow-xl"
      >
        A
      </button>
    </div>
  );
};