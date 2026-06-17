import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  total?: number;
  color?: 'pink' | 'blue' | 'gold' | 'green';
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({
  progress,
  total = 100,
  color = 'pink',
  height = 'md',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (progress / total) * 100));

  const colors = {
    pink: 'bg-gradient-to-r from-accent-pink to-accent-purple shadow-neon-pink',
    blue: 'bg-gradient-to-r from-accent-blue to-accent-pink shadow-neon-blue',
    gold: 'bg-gradient-to-r from-accent-gold to-[#ffaa00] shadow-neon-gold',
    green: 'bg-gradient-to-r from-accent-green to-[#2ecc71] shadow-neon-green',
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-text-muted mb-1.5">
          <span>{progress} / {total}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn(
        'w-full bg-white/10 rounded-full overflow-hidden',
        heights[height]
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            colors[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
