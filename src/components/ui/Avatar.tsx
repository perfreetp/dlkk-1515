import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  ring?: boolean;
  ringColor?: 'pink' | 'gold' | 'blue';
  className?: string;
}

export default function Avatar({
  src,
  alt = 'avatar',
  size = 'md',
  ring = false,
  ringColor = 'pink',
  className,
}: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-lg',
  };

  const ringStyles = {
    pink: 'ring-2 ring-accent-pink ring-offset-2 ring-offset-bg-primary',
    gold: 'ring-2 ring-accent-gold ring-offset-2 ring-offset-bg-primary',
    blue: 'ring-2 ring-accent-blue ring-offset-2 ring-offset-bg-primary',
  };

  return (
    <div className={cn(
      'relative rounded-full overflow-hidden bg-bg-tertiary flex items-center justify-center',
      sizes[size],
      ring && ringStyles[ringColor],
      className
    )}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <User className="w-1/2 h-1/2 text-text-muted" />
      )}
    </div>
  );
}
