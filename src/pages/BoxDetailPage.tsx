import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Crown,
  MessageCircle,
  Share2,
  Info,
  Gift,
  Package,
  Truck,
  UserPlus,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useBoxStore } from '@/store/useBoxStore';
import { useUserStore } from '@/store/useUserStore';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import Countdown from '@/components/ui/Countdown';
import Avatar from '@/components/ui/Avatar';
import {
  getStatusText,
  getRuleText,
  getRuleDescription,
  getPickupText,
  formatDate,
  formatPrice,
} from '@/utils/format';
import { cn } from '@/lib/utils';

export default function BoxDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBoxById, joinBox, leaveBox } = useBoxStore();
  const { currentUser } = useUserStore();
  const [box, setBox] = useState(getBoxById(id || ''));
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [budget, setBudget] = useState(200);

  useEffect(() => {
    setBox(getBoxById(id || ''));
  }, [id, getBoxById]);

  if (!box) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted mb-4">拼盒不存在</p>
          <Button onClick={() => navigate('/')}>返回大厅</Button>
        </div>
      </div>
    );
  }

  const isMember = box.members.some(m => m.userId === currentUser.id);
  const isInitiator = box.initiatorId === currentUser.id;
  const isFull = box.filledSlots >= box.totalSlots;

  const statusColors: Record<string, 'pink' | 'green' | 'gold' | 'blue'> = {
    recruiting: 'green',
    full: 'blue',
    ongoing: 'gold',
    completed: 'pink',
  };

  const handleJoin = () => {
    if (joinBox(box.id, budget)) {
      setBox(getBoxById(box.id));
      setShowJoinModal(false);
    }
  };

  const handleLeave = () => {
    if (leaveBox(box.id)) {
      setBox(getBoxById(box.id));
    }
  };

  const handleStartBox = () => {
    navigate(`/box/${box.id}/result`);
  };

  return (
    <div className="min-h-screen pb-32 md:pb-8">
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={box.series.coverImage}
          alt={box.series.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-bg-secondary/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-bg-secondary/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-bg-secondary/80 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={statusColors[box.status]}>{getStatusText(box.status)}</Badge>
            <Badge variant="gold">有隐藏款</Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
            {box.series.name}
          </h1>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="text-accent-gold font-bold text-lg">{box.series.brand}</span>
            <span>·</span>
            <span>{box.series.totalPieces} 个/盒</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-4 relative z-10 space-y-6">
        <GlassCard className="p-4 md:p-6" glow="pink">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-accent-pink" />
              <div>
                <p className="text-sm text-text-muted">倒计时</p>
                <Countdown targetTime={box.meetTime} size="lg" showIcon={false} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-muted">见面时间</p>
              <p className="text-text-primary font-medium">{formatDate(box.meetTime)}</p>
            </div>
          </div>
          
          <ProgressBar
            progress={box.filledSlots}
            total={box.totalSlots}
            color="pink"
            showLabel
            className="mb-4"
          />

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <MapPin className="w-4 h-4 text-accent-blue" />
              <span>{box.storeName}</span>
            </div>
            {box.distance && (
              <span className="text-accent-blue">{box.distance}</span>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-text-primary flex items-center gap-2">
              <Users className="w-5 h-5 text-accent-pink" />
              拼盒成员
            </h3>
            <span className="text-sm text-text-muted">
              {box.filledSlots} / {box.totalSlots} 人
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: box.totalSlots }).map((_, index) => {
              const member = box.members[index];
              const isEmpty = !member;

              return (
                <div
                  key={index}
                  className={cn(
                    'relative rounded-xl p-4 text-center transition-all',
                    isEmpty
                      ? 'bg-bg-glass border border-dashed border-border-light'
                      : 'bg-bg-secondary/50 border border-border-light'
                  )}
                >
                  {member ? (
                    <>
                      <div className="relative inline-block mb-2">
                        <Avatar
                          src={member.user.avatar}
                          size="lg"
                          ring={member.isInitiator}
                          ringColor="gold"
                        />
                        {member.isInitiator && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-gold flex items-center justify-center">
                            <Crown className="w-3 h-3 text-bg-primary" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-text-primary font-medium truncate">
                        {member.user.nickname}
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        预算 ¥{member.budget}
                      </p>
                      <div className="mt-2">
                        <Badge size="sm" variant={member.status === 'confirmed' ? 'green' : 'default'}>
                          {member.status === 'confirmed' ? '已确认' : '待确认'}
                        </Badge>
                      </div>
                    </>
                  ) : (
                    <div className="py-2">
                      <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-bg-glass border border-dashed border-border-light flex items-center justify-center">
                        <UserPlus className="w-6 h-6 text-text-muted" />
                      </div>
                      <p className="text-sm text-text-muted">虚位以待</p>
                      <p className="text-xs text-text-muted mt-1">等待加入</p>
                    </div>
                  )}

                  <div className="absolute top-2 left-2">
                    <span className="w-6 h-6 rounded-full bg-bg-tertiary text-text-muted text-xs flex items-center justify-center font-display">
                      {index + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="p-4 md:p-6">
          <h3 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-gold" />
            拼盒规则
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-bg-glass rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-accent-pink/10 flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5 text-accent-pink" />
              </div>
              <div>
                <p className="text-text-primary font-medium">{getRuleText(box.rule)}</p>
                <p className="text-sm text-text-muted mt-1">{getRuleDescription(box.rule)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-bg-glass rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-accent-blue" />
              </div>
              <div>
                <p className="text-text-primary font-medium">{getPickupText(box.pickupMethod)}</p>
                <p className="text-sm text-text-muted mt-1">
                  {box.pickupMethod === 'self_pickup' && '到店自取，现场拆盒更有氛围'}
                  {box.pickupMethod === 'proxy' && '发起人代取，同城快递寄出'}
                  {box.pickupMethod === 'delivery' && '专人配送，最快30分钟送达'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-bg-glass rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-accent-gold/10 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 text-accent-gold" />
              </div>
              <div>
                <p className="text-text-primary font-medium">隐藏款: {box.series.hiddenName}</p>
                <p className="text-sm text-text-muted mt-1">全盒仅此一只，珍稀度爆表！</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 md:p-6">
          <h3 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-accent-purple" />
            拼盒说明
          </h3>
          <p className="text-text-secondary text-sm leading-relaxed">
            {box.description || '一起拼盒拆盲盒，分摊成本，共享乐趣！请在约定时间到达门店，遵守拼盒规则，文明拆盒～'}
          </p>
        </GlassCard>

        <GlassCard className="p-4 md:p-6">
          <h3 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent-green" />
            门店信息
          </h3>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-text-primary font-medium">{box.storeName}</p>
              <p className="text-sm text-text-muted mt-1">{box.storeAddress}</p>
            </div>
            <Button variant="outline" size="sm">导航</Button>
          </div>
        </GlassCard>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary/95 backdrop-blur-xl border-t border-border-light p-4 md:hidden">
        <div className="flex items-center gap-3">
          {isMember ? (
            <>
              <Button variant="secondary" className="flex-1" onClick={() => navigate(`/box/${box.id}/chat`)}>
                <MessageCircle className="w-4 h-4 mr-2" />
                聊天
              </Button>
              {isInitiator && box.status === 'full' ? (
                <Button className="flex-1" onClick={handleStartBox}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  开始拆盒
                </Button>
              ) : (
                <Button variant="outline" className="flex-1" onClick={handleLeave}>
                  <LogOut className="w-4 h-4 mr-2" />
                  退出拼盒
                </Button>
              )}
            </>
          ) : (
            <Button
              className="flex-1"
              size="lg"
              disabled={isFull}
              onClick={() => setShowJoinModal(true)}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              {isFull ? '已满员' : '立即加入'}
            </Button>
          )}
        </div>
      </div>

      <div className="hidden md:block container mx-auto px-4 pb-8">
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => navigate(`/box/${box.id}/chat`)}>
            <MessageCircle className="w-4 h-4 mr-2" />
            进入聊天
          </Button>
          {isMember ? (
            isInitiator && box.status === 'full' ? (
              <Button onClick={handleStartBox}>
                <Sparkles className="w-4 h-4 mr-2" />
                开始拆盒
              </Button>
            ) : (
              <Button variant="outline" onClick={handleLeave}>
                <LogOut className="w-4 h-4 mr-2" />
                退出拼盒
              </Button>
            )
          ) : (
            <Button disabled={isFull} onClick={() => setShowJoinModal(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              {isFull ? '已满员' : '加入拼盒'}
            </Button>
          )}
        </div>
      </div>

      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6" glow="pink">
            <h3 className="font-display text-xl font-bold text-text-primary mb-4">
              加入拼盒
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm text-text-secondary mb-2">
                你的预算
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="100"
                  max="500"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="flex-1 accent-accent-pink"
                />
                <span className="text-accent-pink font-bold min-w-[60px] text-right">
                  ¥{budget}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-2">
                预计人均: {formatPrice(box.series.price * box.series.totalPieces / box.totalSlots)}
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowJoinModal(false)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleJoin}>
                确认加入
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
