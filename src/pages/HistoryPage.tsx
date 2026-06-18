import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Crown,
  Gift,
  TrendingUp,
  Calendar,
  ChevronRight,
  Star,
  Zap,
  Settings,
  Bell,
  User,
  Receipt,
  Package,
  Truck,
  UserCheck,
  Info,
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useBoxStore } from '@/store/useBoxStore';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { mockBoxPieces } from '@/data/mockDataIndex';
import { formatDateShort, formatPrice, getRuleText } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { PickupMethod } from '@/types';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const { historyBoxes, boxResults, getBoxResult } = useBoxStore();
  const [activeTab, setActiveTab] = useState<'all' | 'hidden' | 'initiator'>('all');
  const [expandedBox, setExpandedBox] = useState<string | null>(null);

  const pickupMethodLabels: Record<PickupMethod, { name: string; icon: any }> = {
    self_pickup: { name: '到店自提', icon: Package },
    proxy: { name: '代取服务', icon: UserCheck },
    delivery: { name: '同城配送', icon: Truck },
  };

  const stats = [
    { label: '拼盒次数', value: currentUser.totalBoxes, icon: Gift, color: 'text-accent-pink' },
    { label: '隐藏款数', value: currentUser.hiddenCount, icon: Crown, color: 'text-accent-gold' },
    { label: '累计花费', value: '¥3,280', icon: TrendingUp, color: 'text-accent-blue' },
    { label: '等级', value: `Lv.${currentUser.level}`, icon: Star, color: 'text-accent-green' },
  ];

  const filteredHistory = historyBoxes.filter(box => {
    if (activeTab === 'hidden') {
      const result = getBoxResult(box.id);
      if (!result) return false;
      return result.distribution.some(d => {
        const piece = result.pieces.find(p => p.id === d.pieceId);
        return piece?.isHidden && d.userId === currentUser.id;
      });
    }
    if (activeTab === 'initiator') {
      return box.initiatorId === currentUser.id;
    }
    return true;
  });

  const tabs = [
    { id: 'all', label: '全部' },
    { id: 'hidden', label: '中隐藏' },
    { id: 'initiator', label: '我发起' },
  ];

  const toggleExpand = (boxId: string) => {
    setExpandedBox(expandedBox === boxId ? null : boxId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-secondary to-bg-primary pb-24">
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/30 via-accent-purple/20 to-accent-blue/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-primary" />
        
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
              <Bell className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <GlassCard className="p-6 mb-6" glow="pink">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar src={currentUser.avatar} size="xl" ring ringColor="gold" />
              <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-accent-gold text-xs font-bold text-bg-primary">
                Lv.{currentUser.level}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold text-white">{currentUser.nickname}</h2>
              <p className="text-text-secondary text-sm">ID: {currentUser.id}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="gold" size="sm">
                  <Crown className="w-3 h-3 mr-1" />
                  资深玩家
                </Badge>
                <Badge variant="pink" size="sm">
                  {currentUser.city}
                </Badge>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <GlassCard key={stat.label} className="p-4 text-center">
                <Icon className={cn('w-6 h-6 mx-auto mb-2', stat.color)} />
                <p className="font-display text-2xl font-bold text-text-primary">{stat.value}</p>
                <p className="text-xs text-text-muted mt-1">{stat.label}</p>
              </GlassCard>
            );
          })}
        </div>

        <div className="flex gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'all' | 'hidden' | 'initiator')}
              className={cn(
                'px-4 py-2 rounded-full text-sm transition-all',
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-accent-pink to-accent-purple text-white'
                  : 'bg-bg-glass text-text-secondary border border-border-light'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredHistory.map((box, index) => {
            const result = getBoxResult(box.id);
            const hasHidden = result?.distribution.some(d => {
              const piece = result.pieces.find(p => p.id === d.pieceId);
              return piece?.isHidden && d.userId === currentUser.id;
            });
            const isInitiator = box.initiatorId === currentUser.id;
            const isExpanded = expandedBox === box.id;
            const myPieces = result?.distribution.filter(d => d.userId === currentUser.id) || [];
            const feeBreakdown = result?.feeBreakdown;
            const pickupInfo = pickupMethodLabels[box.pickupMethod];
            const PickupIcon = pickupInfo?.icon || Package;

            return (
              <GlassCard
                key={box.id}
                className="overflow-hidden hover:border-border-pink transition-colors"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className="flex cursor-pointer"
                  onClick={() => toggleExpand(box.id)}
                >
                  <div className="w-24 h-24 shrink-0">
                    <img
                      src={box.series.coverImage}
                      alt={box.series.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-text-primary truncate">{box.series.name}</h3>
                      {hasHidden && (
                        <Badge variant="gold" size="sm" pulse>
                          <Crown className="w-3 h-3 mr-1" />
                          中隐藏
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="pink" size="sm">{box.totalSlots}人拼盒</Badge>
                      <Badge variant="blue" size="sm">{getRuleText(box.rule)}</Badge>
                      {isInitiator && (
                        <Badge variant="purple" size="sm">
                          <Zap className="w-3 h-3 mr-1" />
                          我发起
                        </Badge>
                      )}
                      <Badge variant="green" size="sm">
                        <PickupIcon className="w-3 h-3 mr-1" />
                        {pickupInfo?.name}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-text-muted">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDateShort(box.meetTime)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-text-muted">人均</span>
                        <span className="font-bold text-accent-gold">
                          {formatPrice(feeBreakdown?.totalPerPerson || result?.perPersonCost || 0)}
                        </span>
                        <ChevronRight className={cn(
                          'w-4 h-4 text-text-muted transition-transform',
                          isExpanded && 'rotate-90'
                        )} />
                      </div>
                    </div>
                  </div>
                </div>

                {isExpanded && result && (
                  <div className="border-t border-border-light p-4 bg-bg-tertiary/30 animate-slide-down">
                    {myPieces.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
                          <Gift className="w-4 h-4 text-accent-gold" />
                          我的战利品
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {myPieces.map((d, idx) => {
                            const piece = result.pieces.find(p => p.id === d.pieceId);
                            if (!piece) return null;
                            return (
                              <div
                                key={idx}
                                className={cn(
                                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                                  piece.isHidden
                                    ? 'bg-accent-gold/10 border border-accent-gold/30'
                                    : 'bg-bg-glass border border-border-light'
                                )}
                              >
                                <Gift className={cn(
                                  'w-4 h-4',
                                  piece.isHidden ? 'text-accent-gold' : 'text-text-muted'
                                )} />
                                <span className={cn(
                                  piece.isHidden ? 'text-accent-gold' : 'text-text-primary'
                                )}>
                                  {piece.name}
                                </span>
                                {piece.isHidden && (
                                  <Badge variant="gold" size="sm">隐藏款</Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {feeBreakdown && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-accent-pink" />
                          费用明细
                        </h4>
                        <div className="bg-bg-glass rounded-lg p-3 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-text-muted">基础费用</span>
                            <span className="text-text-primary">{formatPrice(feeBreakdown.baseCost)}</span>
                          </div>
                          {feeBreakdown.serviceFee > 0 && (
                            <div className="flex justify-between">
                              <span className="text-text-muted">
                                {box.pickupMethod === 'proxy' ? '代取服务费' : '服务费'}
                              </span>
                              <span className="text-accent-pink">+{formatPrice(feeBreakdown.serviceFee)}</span>
                            </div>
                          )}
                          {feeBreakdown.deliveryFee > 0 && (
                            <div className="flex justify-between">
                              <span className="text-text-muted">同城配送费</span>
                              <span className="text-accent-pink">+{formatPrice(feeBreakdown.deliveryFee)}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-2 border-t border-border-light">
                            <span className="text-text-primary font-medium">合计</span>
                            <span className="text-accent-gold font-bold">{formatPrice(feeBreakdown.totalPerPerson)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {result.ruleExplanation && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
                          <Info className="w-4 h-4 text-accent-blue" />
                          分配规则
                        </h4>
                        <p className="text-sm text-text-muted bg-bg-glass rounded-lg p-3">
                          {result.ruleExplanation}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/box/${box.id}/result`);
                        }}
                      >
                        <Zap className="w-4 h-4 mr-1.5" />
                        查看详情
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/box/${box.id}`);
                        }}
                      >
                        查看拼盒
                      </Button>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-bg-glass flex items-center justify-center">
              <Trophy className="w-10 h-10 text-text-muted" />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">
              暂无战绩记录
            </h3>
            <p className="text-text-muted text-sm mb-6">
              快去拼盒大厅开启你的第一次拼盒吧！
            </p>
            <Button onClick={() => navigate('/')}>
              <Zap className="w-4 h-4 mr-1.5" />
              去拼盒
            </Button>
          </div>
        )}

        <div className="mt-8 mb-6">
          <h3 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent-pink" />
            我的收藏系列
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {['Molly', 'Dimoo', 'Skullpanda', 'Labubu', 'Pucky'].map((series, index) => (
              <div
                key={series}
                className="shrink-0 w-28 text-center"
              >
                <div className="w-24 h-24 mx-auto mb-2 rounded-xl bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 border border-border-light flex items-center justify-center">
                  <Gift className="w-10 h-10 text-accent-pink" />
                </div>
                <p className="text-sm text-text-primary font-medium">{series}</p>
                <p className="text-xs text-text-muted">已拼 {index + 3} 次</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
