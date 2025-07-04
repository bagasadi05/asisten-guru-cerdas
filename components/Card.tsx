
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-[var(--background-white)] rounded-xl shadow-md ${className}`}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    iconBgColor?: string;
    iconColor?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ icon, title, description, iconBgColor = 'bg-blue-100', iconColor = 'text-[var(--primary-color)]' }) => (
    <div className="flex items-start p-5">
        <div className={`flex items-center justify-center rounded-lg p-3 mr-4 ${iconBgColor} ${iconColor}`}>
            {icon}
        </div>
        <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">{title}</h2>
            <p className="text-[var(--text-secondary)] text-sm mt-1">{description}</p>
        </div>
    </div>
);
