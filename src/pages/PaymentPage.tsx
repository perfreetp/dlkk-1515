import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Smartphone,
  Check,
  ChevronRight,
  Receipt,
  Users,
  Gift,
  Clock,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { useBoxStore } from '@/store/useBoxStore';
import { useUserStore } from '@/store/useUserStore';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { formatPrice, formatDate } from '@/utils/format';
import { cn } from '@/lib/utils';

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBoxById, getBoxResult, generateBoxResult } = useBoxStore();
  const { currentUser } = useUserStore();
  const [payMethod, setPayMethod] = useState('wechat');
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
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
          <p className="text-text-primary font-medium">正在加载费用明细...</p>
        </div>
      </div>
    );
  }

  const result = boxResult;
  const pieces = boxResult.pieces;
  const myPieces = result.distribution.filter(d => d.userId === currentUser.id);
  const myPieceDetails = myPieces.map(d => pieces.find(p => p.id === d.pieceId)).filter(Boolean);
  const hasHidden = myPieceDetails.some(p => p?.isHidden);

  const paymentMethods = [
    { id: 'wechat', name: '微信支付', icon: Smartphone, color: 'text-green-500' },
    { id: 'alipay', name: '支付宝', icon: Wallet, color: 'text-blue-500' },
    { id: 'balance', name: '余额支付', icon: CreditCard, color: 'text-accent-gold' },
  ];

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setPaid(true);
    }, 2000);
  };

  const handleDone = () => {
    navigate('/history');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-secondary to-bg-primary pb-32">
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
              <h1 className="font-display font-bold text-xl text-text-primary">分摊结算</h1>
              <p className="text-sm text-text-muted">{box.series.name}</p>
            </div>
          </div>
        </div>
      </div>

      {paid ? (
        <div className="container mx-auto px-4 py-12 text-center animate-scale-in">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-accent-green/20 flex items-center justify-center">
            <Check className="w-12 h-12 text-accent-green" />
          </div>
          <h2 className="font-display text-3xl font-bold text-text-primary mb-2">
            支付成功！
          </h2>
          <p className="text-text-muted mb-8">拼盒记录已保存到历史战绩</p>

          <GlassCard className="p-6 mb-8 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-light">
              <span className="text-text-secondary">订单金额</span>
              <span className="font-display text-2xl font-bold gradient-gold-text">
                {formatPrice(result.perPersonCost)}
              </span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">拼盒名称</span>
                <span className="text-text-primary">{box.series.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">参与人数</span>
                <span className="text-text-primary">{box.filledSlots} 人</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">获得数量</span>
                <span className="text-text-primary">{myPieces.length} 个</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">支付方式</span>
                <span className="text-text-primary">微信支付</span>
              </div>
            </div>
          </GlassCard>

          <div className="max-w-md mx-auto space-y-3">
            <Button className="w-full" onClick={handleDone}>
              查看历史战绩
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => navigate('/')}>
              返回大厅
            </Button>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-6 space-y-6">
          <GlassCard className="p-4 md:p-6">
            <h3 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-accent-gold" />
              我的战利品
            </h3>
            <div className="flex flex-wrap gap-3">
              {myPieceDetails.map((piece, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl',
                    piece?.isHidden
                      ? 'bg-accent-gold/10 border border-accent-gold/30'
                      : 'bg-bg-glass border border-border-light'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    piece?.isHidden ? 'bg-accent-gold/20' : 'bg-bg-tertiary'
                  )}>
                    <Gift className={cn(
                      'w-5 h-5',
                      piece?.isHidden ? 'text-accent-gold' : 'text-text-muted'
                    )} />
                  </div>
                  <div>
                    <p className={cn(
                      'font-medium text-sm',
                      piece?.isHidden ? 'text-accent-gold' : 'text-text-primary'
                    )}>
                      {piece?.name}
                    </p>
                    {piece?.isHidden && (
                      <Badge variant="gold" size="sm" className="mt-1">
                        隐藏款
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {hasHidden && (
              <div className="mt-4 p-4 bg-gradient-to-r from-accent-gold/10 to-accent-pink/10 rounded-xl border border-accent-gold/20">
                <p className="text-center text-accent-gold font-medium">
                  🎉 恭喜你抽到隐藏款！太幸运了！
                </p>
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-4 md:p-6">
            <h3 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-accent-pink" />
              费用明细
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">商品总价</span>
                <span className="text-text-primary">{formatPrice(result.totalCost)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">参与人数</span>
                <span className="text-text-primary">{box.filledSlots} 人</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">人均分摊</span>
                <span className="text-text-primary">{formatPrice(result.perPersonCost)}</span>
              </div>
              <div className="pt-3 border-t border-border-light">
                <div className="flex items-center justify-between">
                  <span className="text-text-primary font-medium">应付金额</span>
                  <span className="font-display text-3xl font-bold gradient-gold-text">
                    {formatPrice(result.perPersonCost)}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 md:p-6">
            <h3 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-accent-blue" />
              全员分摊
            </h3>
            <div className="space-y-3">
              {box.members.map((member) => {
                const isMe = member.userId === currentUser.id;
                const memberPieces = result.distribution.filter(d => d.userId === member.userId);
                const hasHidden = memberPieces.some(d => {
                  const piece = pieces.find(p => p.id === d.pieceId);
                  return piece?.isHidden;
                });

                return (
                  <div
                    key={member.userId}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl',
                      isMe ? 'bg-accent-pink/10 border border-accent-pink/30' : 'bg-bg-glass'
                    )}
                  >
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
                          {isMe && <span className="text-xs text-accent-pink">(我)</span>}
                        </p>
                        {hasHidden && (
                          <Badge variant="gold" size="sm">
                            隐藏款
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-text-muted">
                        {memberPieces.length} 个款式
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent-gold">
                        {formatPrice(result.perPersonCost)}
                      </p>
                      <p className="text-xs text-accent-green">已支付</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard className="p-4 md:p-6">
            <h3 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-accent-purple" />
              支付方式
            </h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPayMethod(method.id)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl transition-all',
                      payMethod === method.id
                        ? 'bg-accent-pink/10 border border-accent-pink/50'
                        : 'bg-bg-glass border border-border-light hover:border-border-pink'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg bg-bg-tertiary flex items-center justify-center',
                      method.color
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-left text-text-primary font-medium">
                      {method.name}
                    </span>
                    {payMethod === method.id && (
                      <div className="w-6 h-6 rounded-full bg-accent-pink flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard className="p-4 md:p-6">
            <h3 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent-green" />
              取货信息
            </h3>
            <div className="space-y-2">
              <p className="text-text-primary">{box.storeName}</p>
              <p className="text-sm text-text-muted">{box.storeAddress}</p>
              <p className="text-sm text-text-muted">
                <Clock className="w-4 h-4 inline mr-1" />
                {formatDate(box.meetTime)}
              </p>
            </div>
          </GlassCard>
        </div>
      )}

      {!paid && !isGenerating && boxResult && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary/95 backdrop-blur-xl border-t border-border-light p-4">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-text-muted">应付金额</p>
              <p className="font-display text-2xl font-bold gradient-gold-text">
                {formatPrice(result.perPersonCost)}
              </p>
            </div>
            <Button
              size="lg"
              className="flex-1 md:flex-none md:w-48"
              onClick={handlePay}
              loading={paying}
              variant="gold"
            >
              {paying ? '支付中...' : '立即支付'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
