
import React from 'react';

interface EmptyStateProps {
  Icon: React.FC<{className?: string}>;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ Icon, title, description, action }) => {
  return (
    <div className="text-center py-20 px-6 flex flex-col items-center">
      <div className="flex items-center justify-center size-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-5">
        <Icon className="size-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
      <p className="text-[var(--text-secondary)] mt-1 max-w-xs">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
