import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Crown } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import Countdown from '@/components/ui/Countdown';
import Avatar from '@/components/ui/Avatar';
import type { BoxGroup } from '@/types';
import { getStatusText, getRuleText, formatTime } from '@/utils/format';
import { cn } from '@/lib/utils';

interface BoxCardProps {
  box: BoxGroup;
  className?: string;
}

export default function BoxCard({ box, className }: BoxCardProps) {
  const navigate = useNavigate();

  const statusColors: Record<string, 'pink' | 'green' | 'gold' | 'blue'> = {
    recruiting: 'green',
    full: 'blue',
    ongoing: 'gold',
    completed: 'pink',
  };

  const handleClick = () => {
    navigate(`/box/${box.id}`);
  };

  return (
    <GlassCard
      className={cn('cursor-pointer', className)}
      glow="pink"
      onClick={handleClick}
    >
      <div className="relative">
        <div className="aspect-[4/3] relative overflow-hidden">
          <img
            src={box.series.coverImage}
            alt={box.series.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary/90 via-transparent to-transparent" />
          
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant={statusColors[box.status] as 'pink' | 'green' | 'gold' | 'blue'} size="sm">
              {getStatusText(box.status)}
            </Badge>
            {box.series.hiddenName && (
              <Badge variant="gold" size="sm" pulse>
                有隐藏款
              </Badge>
            )}
          </div>

          <div className="absolute top-3 right-3">
            <div className="bg-bg-secondary/80 backdrop-blur-sm rounded-lg px-2 py-1">
              <Countdown targetTime={box.meetTime} size="sm" showIcon={false} />
            </div>
          </div>

          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-display font-bold text-lg text-white mb-1 line-clamp-1">
              {box.series.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">{box.storeName}</span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-sm text-text-secondary">
              <Clock className="w-4 h-4" />
              <span>{formatTime(box.meetTime)} 见面</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-accent-gold font-bold">¥{box.series.price}</span>
              <span className="text-text-muted text-xs">/个</span>
            </div>
          </div>

          <ProgressBar
            progress={box.filledSlots}
            total={box.totalSlots}
            color="pink"
            showLabel
            className="mb-3"
          />

          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {box.members.slice(0, 4).map((member, index) => (
                <Avatar
                  key={member.userId}
                  src={member.user.avatar}
                  size="sm"
                  ring={member.isInitiator}
                  ringColor="gold"
                  className="border-2 border-bg-secondary"
                />
              ))}
              {box.totalSlots - box.filledSlots > 0 && (
                <div className="w-8 h-8 rounded-full bg-bg-glass border-2 border-bg-secondary flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-text-muted" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs">
              <Crown className="w-3.5 h-3.5 text-accent-gold" />
              <span className="text-text-muted">{getRuleText(box.rule)}</span>
            </div>
          </div>

          {box.distance && (
            <div className="mt-3 pt-3 border-t border-border-light">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">距你</span>
                <span className="text-accent-blue font-medium">{box.distance}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
