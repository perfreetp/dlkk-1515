import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'pink' | 'blue' | 'gold' | 'green' | 'red' | 'purple';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  pulse = false,
  className,
}: BadgeProps) {
  const variants = {
    default: 'bg-bg-glass text-text-secondary border border-border-light',
    pink: 'bg-accent-pink/10 text-accent-pink border border-accent-pink/30',
    blue: 'bg-accent-blue/10 text-accent-blue border border-accent-blue/30',
    gold: 'bg-accent-gold/10 text-accent-gold border border-accent-gold/30',
    green: 'bg-accent-green/10 text-accent-green border border-accent-green/30',
    red: 'bg-accent-red/10 text-accent-red border border-accent-red/30',
    purple: 'bg-accent-purple/10 text-accent-purple border border-accent-purple/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium',
        variants[variant],
        sizes[size],
        pulse && 'animate-pulse',
        className
      )}
    >
      {children}
    </span>
  );
}
