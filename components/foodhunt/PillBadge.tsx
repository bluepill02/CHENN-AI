import React from 'react';

interface PillBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function PillBadge({ children, className = '' }: PillBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${className}`}>
      {children}
    </span>
  );
}

export default PillBadge;
