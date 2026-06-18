import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Gift,
  Crown,
  Check,
  ChevronRight,
  PartyPopper,
  RefreshCw,
} from 'lucide-react';
import { useBoxStore } from '@/store/useBoxStore';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { formatPrice } from '@/utils/format';
import { cn } from '@/lib/utils';

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBoxById, getBoxResult, generateBoxResult } = useBoxStore();
  const [revealIndex, setRevealIndex] = useState(-1);
  const [allRevealed, setAllRevealed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const box = getBoxById(id || '');
  const boxResult = getBoxResult(id || '');

  useEffect(() => {
    if (box && !boxResult && !isGenerating) {
      setIsGenerating(true);
      setTimeout(() => {
        generateBoxResult(box.id);
        setIsGenerating(false);
      }, 500);
    }
  }, [box, boxResult, generateBoxResult, isGenerating]);

  const pieces = boxResult?.pieces || [];
  const result = boxResult;

  useEffect(() => {
    if (pieces.length === 0) return;
    
    setRevealIndex(-1);
    setAllRevealed(false);
    
    const timer = setInterval(() => {
      setRevealIndex((prev) => {
        if (prev < pieces.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setAllRevealed(true);
          return prev;
        }
      });
    }, 600);

    return () => clearInterval(timer);
  }, [pieces.length, boxResult?.boxGroupId]);

  if (!box) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted">拼盒不存在</p>
      </div>
    );
  }

  if (isGenerating || !boxResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-bg-secondary to-bg-primary flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-accent-pink animate-spin mx-auto mb-4" />
          <p className="text-text-primary font-medium">正在生成拆盒结果...</p>
          <p className="text-text-muted text-sm mt-1">请稍候</p>
        </div>
      </div>
    );
  }

  const getPieceOwner = (pieceId: string) => {
    const dist = result?.distribution.find(d => d.pieceId === pieceId);
    const member = box.members.find(m => m.userId === dist?.userId);
    return member || null;
  };

  const hiddenPiece = pieces.find(p => p.isHidden);
  const hiddenOwner = hiddenPiece ? getPieceOwner(hiddenPiece.id) : null;

  const handleRevealAll = () => {
    setRevealIndex(pieces.length - 1);
    setAllRevealed(true);
  };

  const handleGoPayment = () => {
    navigate(`/box/${box.id}/payment`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-secondary to-bg-primary pb-24">
      <div className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-xl border-b border-border-light">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-bg-glass flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display font-bold text-xl text-text-primary">拆盒结果</h1>
              <p className="text-sm text-text-muted">{box.series.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-gold/10 border border-accent-gold/30 mb-4">
            <PartyPopper className="w-5 h-5 text-accent-gold" />
            <span className="text-accent-gold font-medium">拆盒完成！</span>
          </div>
          <h2 className="font-display text-3xl font-bold gradient-text mb-2">
            {allRevealed ? '恭喜大家！' : '拆盒进行中...'}
          </h2>
          <p className="text-text-muted">
            已揭晓 {Math.max(0, revealIndex + 1)} / {pieces.length} 个
          </p>
        </div>

        {hiddenPiece && hiddenOwner && allRevealed && (
          <GlassCard className="mb-8 p-6" glow="gold">
            <div className="flex items-center justify-center mb-4">
              <Badge variant="gold" pulse>
                <Crown className="w-3 h-3 mr-1" />
                隐藏款归属
              </Badge>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <div className="absolute inset-0 bg-accent-gold/30 rounded-full blur-xl animate-pulse" />
                <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-accent-gold to-accent-pink p-1 animate-glow-gold">
                  <div className="w-full h-full rounded-xl bg-bg-secondary flex items-center justify-center">
                    <Gift className="w-12 h-12 text-accent-gold" />
                  </div>
                </div>
              </div>
              <h3 className="font-display text-xl font-bold text-accent-gold mb-1">
                {hiddenPiece.name}
              </h3>
              <p className="text-text-muted text-sm mb-4">{hiddenPiece.name}</p>
              <div className="flex items-center gap-3">
                <Avatar src={hiddenOwner.user.avatar} size="md" ring ringColor="gold" />
                <div>
                  <p className="text-text-primary font-medium">{hiddenOwner.user.nickname}</p>
                  <p className="text-xs text-accent-gold">🎉 恭喜获得隐藏款！</p>
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {pieces.map((piece, index) => {
            const isRevealed = index <= revealIndex;
            const owner = getPieceOwner(piece.id);

            return (
              <div
                key={piece.id}
                className={cn(
                  'relative transition-all duration-500',
                  isRevealed ? 'opacity-100 scale-100' : 'opacity-50 scale-95'
                )}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <GlassCard
                  className={cn(
                    'p-3 text-center',
                    piece.isHidden && isRevealed && 'border-accent-gold/50 shadow-neon-gold'
                  )}
                  glow={piece.isHidden && isRevealed ? 'gold' : 'none'}
                >
                  <div className="aspect-square rounded-xl bg-bg-tertiary mb-3 flex items-center justify-center overflow-hidden relative">
                    {isRevealed ? (
                      <>
                        <Gift className={cn(
                          'w-10 h-10',
                          piece.isHidden ? 'text-accent-gold' : 'text-text-muted'
                        )} />
                        {piece.isHidden && (
                          <div className="absolute inset-0 bg-accent-gold/10 animate-pulse" />
                        )}
                      </>
                    ) : (
                      <div className="text-3xl">❓</div>
                    )}
                  </div>
                  <p className={cn(
                    'text-sm font-medium truncate',
                    piece.isHidden && isRevealed ? 'text-accent-gold' : 'text-text-primary'
                  )}>
                    {isRevealed ? piece.name : '???'}
                  </p>
                  {isRevealed && owner && (
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <Avatar src={owner.user.avatar} size="sm" />
                      <span className="text-xs text-text-muted truncate">
                        {owner.user.nickname}
                      </span>
                    </div>
                  )}
                  {piece.isHidden && isRevealed && (
                    <div className="mt-2">
                      <Badge variant="gold" size="sm" pulse>
                        <Crown className="w-3 h-3 mr-1" />
                        隐藏款
                      </Badge>
                    </div>
                  )}
                </GlassCard>
              </div>
            );
          })}
        </div>

        {!allRevealed && (
          <div className="text-center mb-8">
            <Button variant="secondary" onClick={handleRevealAll}>
              一键全部揭晓
            </Button>
          </div>
        )}

        {allRevealed && (
          <div className="space-y-6">
            <GlassCard className="p-4 md:p-6" glow="blue">
              <h3 className="font-display font-bold text-lg text-text-primary mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-blue" />
                分配规则说明
              </h3>
              <div className="p-4 bg-bg-glass rounded-xl border border-accent-blue/30">
                <p className="text-text-primary leading-relaxed">
                  {result?.ruleExplanation}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="blue">{box.members.length} 人参与</Badge>
                  <Badge variant="gold">{pieces.length} 个款式</Badge>
                  <Badge variant="pink">隐藏款 × 1</Badge>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4 md:p-6">
              <h3 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-accent-pink" />
                归属明细
              </h3>
              <div className="space-y-3">
                {box.members.map((member) => {
                  const memberPieces = result?.distribution.filter(d => d.userId === member.userId) || [];
                  const hasHidden = memberPieces.some(d => {
                    const piece = pieces.find(p => p.id === d.pieceId);
                    return piece?.isHidden;
                  });

                  return (
                    <div
                      key={member.userId}
                      className="p-4 bg-bg-glass rounded-xl"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <Avatar
                          src={member.user.avatar}
                          size="md"
                          ring={hasHidden}
                          ringColor="gold"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-text-primary truncate">
                              {member.user.nickname}
                            </p>
                            {member.isInitiator && (
                              <Badge variant="pink" size="sm">
                                <Crown className="w-3 h-3 mr-1" />
                                发起人
                              </Badge>
                            )}
                            {hasHidden && (
                              <Badge variant="gold" size="sm" pulse>
                                隐藏款
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-text-muted mt-1">
                            获得 {memberPieces.length} 个
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-accent-gold font-bold">{formatPrice(result?.feeBreakdown?.totalPerPerson || result?.perPersonCost || 0)}</p>
                          <p className="text-xs text-text-muted">人均费用</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {memberPieces.map((d, idx) => {
                          const piece = pieces.find(p => p.id === d.pieceId);
                          return (
                            <div
                              key={d.pieceId}
                              className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs',
                                piece?.isHidden
                                  ? 'bg-accent-gold/10 border border-accent-gold/30'
                                  : 'bg-bg-tertiary border border-border-light'
                              )}
                            >
                              <Gift className={cn(
                                'w-3.5 h-3.5',
                                piece?.isHidden ? 'text-accent-gold' : 'text-text-muted'
                              )} />
                              <span className={cn(
                                'truncate max-w-[120px]',
                                piece?.isHidden ? 'text-accent-gold font-medium' : 'text-text-secondary'
                              )}>
                                {piece?.name}
                              </span>
                              <span className="text-text-muted text-xs">
                                — {d.assignmentReason}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            <GlassCard className="p-4 md:p-6" glow="pink">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-lg text-text-primary">费用合计</h3>
                <Badge variant="pink">共 {pieces.length} 个</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">商品金额</span>
                  <span className="text-text-primary">{formatPrice(result?.totalCost || 0)}</span>
                </div>
                {result?.feeBreakdown && result.feeBreakdown.serviceFee > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">服务费（¥{result.feeBreakdown.serviceFee}/人 × {box.filledSlots}人）</span>
                    <span className="text-text-primary">{formatPrice(result.feeBreakdown.serviceFee * box.filledSlots)}</span>
                  </div>
                )}
                {result?.feeBreakdown && result.feeBreakdown.deliveryFee > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">配送费（¥{result.feeBreakdown.deliveryFee}/人 × {box.filledSlots}人）</span>
                    <span className="text-text-primary">{formatPrice(result.feeBreakdown.deliveryFee * box.filledSlots)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">参与人数</span>
                  <span className="text-text-primary">{box.filledSlots} 人</span>
                </div>
                <div className="pt-3 border-t border-border-light">
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary font-medium">人均费用</span>
                    <span className="font-display text-2xl font-bold gradient-gold-text">
                      {formatPrice(result?.feeBreakdown?.totalPerPerson || result?.perPersonCost || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      {allRevealed && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary/95 backdrop-blur-xl border-t border-border-light p-4">
          <div className="container mx-auto">
            <Button className="w-full" size="lg" onClick={handleGoPayment} variant="gold">
              <Check className="w-5 h-5 mr-2" />
              确认结果并结算
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
