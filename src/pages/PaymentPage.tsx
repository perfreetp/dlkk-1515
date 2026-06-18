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
  Package,
  Truck,
  UserCheck,
  Info,
} from 'lucide-react';
import { useBoxStore } from '@/store/useBoxStore';
import { useUserStore } from '@/store/useUserStore';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { formatPrice, formatDate } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { PickupMethod } from '@/types';

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBoxById, getBoxResult, generateBoxResult, setPickupMethod, setProxyUser, calculateFeeBreakdown, quickAction } = useBoxStore();
  const { currentUser } = useUserStore();
  const [payMethod, setPayMethod] = useState('wechat');
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pickupMethod, setPickupMethodLocal] = useState<PickupMethod>('self_pickup');
  const [selectedProxy, setSelectedProxy] = useState<string | null>(null);

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

  useEffect(() => {
    if (box) {
      setPickupMethodLocal(box.pickupMethod);
      setSelectedProxy(box.proxyUserId || null);
    }
  }, [box]);

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

  const feeBreakdown = calculateFeeBreakdown({
    ...box,
    pickupMethod,
    proxyUserId: selectedProxy || undefined,
  });

  const result = boxResult;
  const pieces = boxResult.pieces;
  const myPieces = result.distribution.filter(d => d.userId === currentUser.id);
  const myPieceDetails = myPieces.map(d => pieces.find(p => p.id === d.pieceId)).filter(Boolean);
  const hasHidden = myPieceDetails.some(p => p?.isHidden);
  const isInitiator = box.initiatorId === currentUser.id;

  const paymentMethods = [
    { id: 'wechat', name: '微信支付', icon: Smartphone, color: 'text-green-500' },
    { id: 'alipay', name: '支付宝', icon: Wallet, color: 'text-blue-500' },
    { id: 'balance', name: '余额支付', icon: CreditCard, color: 'text-accent-gold' },
  ];

  const pickupOptions = [
    { id: 'self_pickup' as PickupMethod, name: '到店自提', icon: Package, desc: '现场直接取走', fee: 0 },
    { id: 'proxy' as PickupMethod, name: '代取服务', icon: UserCheck, desc: '委托他人代取', fee: 10 },
    { id: 'delivery' as PickupMethod, name: '同城配送', icon: Truck, desc: '配送到指定地址', fee: 30 },
  ];

  const handlePickupChange = (method: PickupMethod) => {
    setPickupMethodLocal(method);
    setPickupMethod(box.id, method);
    if (method !== 'proxy') {
      setSelectedProxy(null);
    }
  };

  const handleProxySelect = (userId: string) => {
    setSelectedProxy(userId);
    setProxyUser(box.id, userId);
  };

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setPaid(true);
      quickAction(box.id, 'confirm_proxy', { proxyUserId: selectedProxy });
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
                {formatPrice(feeBreakdown.totalPerPerson)}
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
                <span className="text-text-muted">取货方式</span>
                <span className="text-text-primary">
                  {pickupOptions.find(o => o.id === pickupMethod)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">支付方式</span>
                <span className="text-text-primary">微信支付</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border-light">
              <h4 className="text-text-primary font-medium mb-2 flex items-center gap-1">
                <Receipt className="w-4 h-4 text-accent-pink" />
                费用明细
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">基础费用</span>
                  <span className="text-text-primary">{formatPrice(feeBreakdown.baseCost)}</span>
                </div>
                {feeBreakdown.serviceFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">服务费</span>
                    <span className="text-text-primary">{formatPrice(feeBreakdown.serviceFee)}</span>
                  </div>
                )}
                {feeBreakdown.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">配送费</span>
                    <span className="text-text-primary">{formatPrice(feeBreakdown.deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-border-light">
                  <span className="text-text-primary font-medium">合计</span>
                  <span className="text-accent-gold font-bold">{formatPrice(feeBreakdown.totalPerPerson)}</span>
                </div>
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
              <MapPin className="w-5 h-5 text-accent-green" />
              取货方式
            </h3>
            <div className="space-y-3">
              {pickupOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = pickupMethod === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handlePickupChange(option.id)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left',
                      isSelected
                        ? 'bg-accent-green/10 border border-accent-green/50'
                        : 'bg-bg-glass border border-border-light hover:border-border-pink'
                    )}
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      isSelected ? 'bg-accent-green/20 text-accent-green' : 'bg-bg-tertiary text-text-muted'
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={cn(
                          'font-medium',
                          isSelected ? 'text-accent-green' : 'text-text-primary'
                        )}>
                          {option.name}
                        </p>
                        <p className={cn(
                          'text-sm font-bold',
                          option.fee > 0 ? 'text-accent-pink' : 'text-accent-green'
                        )}>
                          {option.fee > 0 ? `+¥${option.fee}/人` : '免费'}
                        </p>
                      </div>
                      <p className="text-sm text-text-muted">{option.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-accent-green flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {pickupMethod === 'proxy' && (
              <div className="mt-4 p-4 bg-bg-tertiary/50 rounded-xl border border-border-light">
                <div className="flex items-start gap-2 mb-3">
                  <Info className="w-4 h-4 text-accent-blue mt-0.5 shrink-0" />
                  <p className="text-xs text-text-muted">
                    代取人将负责现场领取所有款式并分发给大家，需额外支付服务费 ¥10/人
                  </p>
                </div>
                <h4 className="text-text-primary font-medium mb-3">选择代取人</h4>
                <div className="space-y-2">
                  {box.members.map((member) => {
                    const isMe = member.userId === currentUser.id;
                    const isSelected = selectedProxy === member.userId;
                    return (
                      <button
                        key={member.userId}
                        onClick={() => handleProxySelect(member.userId)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left',
                          isSelected
                            ? 'bg-accent-blue/10 border border-accent-blue/50'
                            : 'bg-bg-glass border border-transparent hover:border-border-light'
                        )}
                      >
                        <Avatar
                          src={member.user.avatar}
                          size="sm"
                          ring={member.isInitiator}
                          ringColor="gold"
                        />
                        <div className="flex-1">
                          <p className={cn(
                            'font-medium text-sm',
                            isSelected ? 'text-accent-blue' : 'text-text-primary'
                          )}>
                            {member.user.nickname}
                            {isMe && <span className="text-xs text-accent-pink ml-1">(我)</span>}
                            {member.isInitiator && <Badge variant="gold" size="sm" className="ml-1">发起人</Badge>}
                          </p>
                          {member.checkedIn && (
                            <p className="text-xs text-accent-green">✓ 已签到</p>
                          )}
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-accent-blue flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-border-light">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <MapPin className="w-4 h-4" />
                <span>{box.storeName}</span>
              </div>
              <p className="text-sm text-text-muted ml-6 mt-1">{box.storeAddress}</p>
              <p className="text-sm text-text-muted ml-6 mt-1">
                <Clock className="w-4 h-4 inline mr-1" />
                {formatDate(box.meetTime)}
              </p>
            </div>
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
                <span className="text-text-secondary">人均基础费</span>
                <span className="text-text-primary">{formatPrice(feeBreakdown.baseCost)}</span>
              </div>
              {feeBreakdown.serviceFee > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">
                    {pickupMethod === 'proxy' ? '代取服务费' : '服务费'}
                  </span>
                  <span className="text-accent-pink">+{formatPrice(feeBreakdown.serviceFee)}</span>
                </div>
              )}
              {feeBreakdown.deliveryFee > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">同城配送费</span>
                  <span className="text-accent-pink">+{formatPrice(feeBreakdown.deliveryFee)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-border-light">
                <div className="flex items-center justify-between">
                  <span className="text-text-primary font-medium">应付金额</span>
                  <span className="font-display text-3xl font-bold gradient-gold-text">
                    {formatPrice(feeBreakdown.totalPerPerson)}
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
                const isProxy = member.userId === selectedProxy;

                return (
                  <div
                    key={member.userId}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl',
                      isMe ? 'bg-accent-pink/10 border border-accent-pink/30' : 'bg-bg-glass',
                      isProxy && 'ring-2 ring-accent-blue/50'
                    )}
                  >
                    <Avatar
                      src={member.user.avatar}
                      size="md"
                      ring={hasHidden || isProxy}
                      ringColor={hasHidden ? 'gold' : 'blue'}
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
                        {isProxy && (
                          <Badge variant="blue" size="sm">
                            代取人
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-text-muted">
                        {memberPieces.length} 个款式
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent-gold">
                        {formatPrice(feeBreakdown.totalPerPerson)}
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
        </div>
      )}

      {!paid && !isGenerating && boxResult && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary/95 backdrop-blur-xl border-t border-border-light p-4">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-text-muted">应付金额</p>
              <p className="font-display text-2xl font-bold gradient-gold-text">
                {formatPrice(feeBreakdown.totalPerPerson)}
              </p>
            </div>
            <Button
              size="lg"
              className="flex-1 md:flex-none md:w-48"
              onClick={handlePay}
              loading={paying}
              variant="gold"
              disabled={pickupMethod === 'proxy' && !selectedProxy}
            >
              {pickupMethod === 'proxy' && !selectedProxy ? '请选择代取人' : paying ? '支付中...' : '立即支付'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
