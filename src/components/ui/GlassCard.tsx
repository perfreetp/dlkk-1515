import { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  hover?: boolean;
  glow?: 'pink' | 'blue' | 'gold' | 'none';
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className,
  style,
  hover = true,
  glow = 'none',
  onClick,
}: GlassCardProps) {
  const glowStyles = {
    pink: 'before:bg-accent-pink/20 before:blur-xl',
    blue: 'before:bg-accent-blue/20 before:blur-xl',
    gold: 'before:bg-accent-gold/20 before:blur-xl',
    none: '',
  };

  return (
    <div
      className={cn(
        'relative bg-bg-glass backdrop-blur-xl border border-border rounded-2xl overflow-hidden',
        hover && 'hover:bg-bg-glass-hover hover:border-border-pink transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/10',
        glow !== 'none' && 'relative overflow-hidden',
        onClick && 'cursor-pointer',
        className
      )}
      style={style}
      onClick={onClick}
    >
      {glow !== 'none' && (
        <div className={cn(
          'absolute -top-1/2 -right-1/2 w-full h-full rounded-full opacity-30 blur-3xl pointer-events-none',
          glowStyles[glow]
        )} />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
