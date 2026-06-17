import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownProps {
  targetTime: Date;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  variant?: 'default' | 'urgent';
  className?: string;
}

export default function Countdown({
  targetTime,
  size = 'md',
  showIcon = true,
  variant = 'default',
  className,
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = targetTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setIsUrgent(false);
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ hours, minutes, seconds });
      setIsUrgent(diff < 5 * 60 * 1000);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetTime]);

  const sizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg font-bold',
  };

  const displayVariant = isUrgent ? 'urgent' : variant;

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 font-display',
      sizes[size],
      displayVariant === 'urgent' ? 'text-accent-red animate-countdown-blink' : 'text-accent-pink',
      className
    )}>
      {showIcon && <Clock className={cn(size === 'lg' ? 'w-5 h-5' : 'w-4 h-4')} />}
      <span className="tabular-nums">
        {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
      </span>
    </div>
  );
}
