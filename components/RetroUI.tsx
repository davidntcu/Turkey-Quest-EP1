import React from 'react';

interface WindowProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const RetroWindow: React.FC<WindowProps> = ({ children, className = '', title }) => {
  return (
    <div className={`relative bg-blue-900 border-4 border-double border-white rounded-sm p-4 text-white shadow-lg ${className}`}>
      {title && (
        <div className="absolute -top-3 left-4 bg-blue-900 px-2 text-sm font-bold border border-white">
          {title}
        </div>
      )}
      {children}
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const RetroButton: React.FC<ButtonProps> = ({ children, active, className = '', ...props }) => {
  return (
    <button
      className={`
        w-full text-left px-4 py-2 uppercase font-bold text-lg tracking-wider outline-none
        transition-colors duration-100 flex items-center
        ${active ? 'bg-orange-500 text-white animate-pulse' : 'hover:bg-blue-800 text-gray-200'}
        ${className}
      `}
      {...props}
    >
      <span className={`mr-2 ${active ? 'opacity-100' : 'opacity-0'}`}>▶</span>
      {children}
    </button>
  );
};
