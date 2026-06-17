import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Crown,
  Zap,
  ChevronRight,
  Check,
  Package,
  Truck,
  Store,
} from 'lucide-react';
import { useBoxStore } from '@/store/useBoxStore';
import { useUserStore } from '@/store/useUserStore';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { mockSeries, categories } from '@/data/mockSeries';
import { mockCities, mockStores } from '@/data/mockCities';
import type { DistributionRule, PickupMethod, Series } from '@/types';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/utils/format';

export default function CreateBoxPage() {
  const navigate = useNavigate();
  const { createBox } = useBoxStore();
  const { currentUser, selectedCity: userCity } = useUserStore();

  const [step, setStep] = useState(1);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [cityName, setCityName] = useState(userCity);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [meetDate, setMeetDate] = useState('');
  const [meetTime, setMeetTime] = useState('');
  const [totalSlots, setTotalSlots] = useState(4);
  const [rule, setRule] = useState<DistributionRule>('hidden_priority');
  const [pickupMethod, setPickupMethod] = useState<PickupMethod>('self_pickup');
  const [description, setDescription] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('全部');

  const currentCity = mockCities.find(c => c.name === cityName);
  const filteredSeries = categoryFilter === '全部'
    ? mockSeries
    : mockSeries.filter(s => s.category === categoryFilter);

  const filteredStores = mockStores.filter(
    s => s.city === cityName && s.district === selectedDistrict
  );

  const steps = [
    { id: 1, title: '选择系列' },
    { id: 2, title: '选择门店' },
    { id: 3, title: '设置规则' },
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreate = () => {
    if (!selectedSeries || !selectedStore || !meetDate || !meetTime) return;

    const meetDateTime = new Date(`${meetDate}T${meetTime}`);
    
    const newBox = createBox({
      seriesId: selectedSeries.id,
      series: selectedSeries,
      city: cityName,
      district: selectedDistrict,
      storeName: selectedStore,
      storeAddress: mockStores.find(s => s.name === selectedStore)?.address || '',
      meetTime: meetDateTime,
      totalSlots,
      rule,
      pickupMethod,
      description,
      countdownMinutes: Math.floor((meetDateTime.getTime() - Date.now()) / 60000),
    });

    navigate(`/box/${newBox.id}`);
  };

  const rules: { value: DistributionRule; title: string; desc: string; icon: typeof Crown }[] = [
    { value: 'hidden_priority', title: '隐藏款优先', desc: '隐藏款按报名顺序优先选择', icon: Crown },
    { value: 'average', title: '普通款均分', desc: '所有款式随机均分，人人机会均等', icon: Users },
    { value: 'rotation', title: '按序轮转', desc: '按座位顺序轮流挑选，先到先得', icon: Zap },
  ];

  const pickupMethods: { value: PickupMethod; title: string; desc: string; icon: typeof Package }[] = [
    { value: 'self_pickup', title: '到店自提', desc: '现场拆盒，体验拉满', icon: Store },
    { value: 'proxy', title: '代取服务', desc: '发起人代取，快递寄出', icon: Package },
    { value: 'delivery', title: '同城送达', desc: '专人配送，最快30分钟', icon: Truck },
  ];

  const canNext = () => {
    switch (step) {
      case 1:
        return !!selectedSeries;
      case 2:
        return !!cityName && !!selectedDistrict && !!selectedStore && !!meetDate && !!meetTime;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen pb-32 md:pb-8">
      <div className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-xl border-b border-border-light">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-bg-glass flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-xl font-bold text-text-primary">发起拼盒</h1>
          </div>

          <div className="flex items-center justify-between mt-4 max-w-md mx-auto">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                      step >= s.id
                        ? 'bg-gradient-to-br from-accent-pink to-accent-purple text-white shadow-neon-pink'
                        : 'bg-bg-glass text-text-muted border border-border-light'
                    )}
                  >
                    {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                  </div>
                  <span className={cn(
                    'text-xs mt-1.5',
                    step >= s.id ? 'text-accent-pink' : 'text-text-muted'
                  )}>
                    {s.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    'w-16 md:w-24 h-0.5 mx-2 -mt-4',
                    step > s.id ? 'bg-gradient-to-r from-accent-pink to-accent-purple' : 'bg-border-light'
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-bold text-text-primary mb-4">选择潮玩系列</h2>

            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm transition-all',
                    categoryFilter === cat
                      ? 'bg-gradient-to-r from-accent-pink to-accent-purple text-white'
                      : 'bg-bg-glass text-text-secondary border border-border-light hover:border-border-pink'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredSeries.map((series) => (
                <div
                  key={series.id}
                  onClick={() => setSelectedSeries(series)}
                  className={cn(
                    'relative cursor-pointer rounded-xl overflow-hidden transition-all',
                    selectedSeries?.id === series.id
                      ? 'ring-2 ring-accent-pink ring-offset-2 ring-offset-bg-primary scale-105'
                      : 'hover:scale-102'
                  )}
                >
                  <GlassCard className="h-full">
                    <div className="aspect-square relative">
                      <img
                        src={series.coverImage}
                        alt={series.name}
                        className="w-full h-full object-cover"
                      />
                      {series.hiddenName && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="gold" size="sm" pulse>
                            隐藏
                          </Badge>
                        </div>
                      )}
                      {selectedSeries?.id === series.id && (
                        <div className="absolute inset-0 bg-accent-pink/20 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-accent-pink flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-text-primary text-sm truncate">
                        {series.name}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-accent-gold font-bold text-sm">{formatPrice(series.price)}</span>
                        <span className="text-xs text-text-muted">{series.totalPieces}个/盒</span>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
            <GlassCard className="p-4 md:p-6">
              <h3 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent-pink" />
                选择城市
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {mockCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      setCityName(city.name);
                      setSelectedDistrict('');
                      setSelectedStore('');
                    }}
                    className={cn(
                      'py-2.5 px-3 rounded-xl text-sm font-medium transition-all',
                      cityName === city.name
                        ? 'bg-gradient-to-r from-accent-pink to-accent-purple text-white shadow-neon-pink'
                        : 'bg-bg-glass text-text-secondary border border-border-light hover:border-border-pink'
                    )}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </GlassCard>

            {currentCity && (
              <GlassCard className="p-4 md:p-6">
                <h3 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-accent-blue" />
                  选择商圈
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentCity.districts.map((district) => (
                    <button
                      key={district.id}
                      onClick={() => {
                        setSelectedDistrict(district.name);
                        setSelectedStore('');
                      }}
                      className={cn(
                        'py-2 px-4 rounded-full text-sm transition-all',
                        selectedDistrict === district.name
                          ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/50'
                          : 'bg-bg-glass text-text-secondary border border-border-light hover:border-border-blue'
                      )}
                    >
                      {district.name}
                    </button>
                  ))}
                </div>
              </GlassCard>
            )}

            {selectedDistrict && filteredStores.length > 0 && (
              <GlassCard className="p-4 md:p-6">
                <h3 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
                  <Store className="w-5 h-5 text-accent-green" />
                  选择门店
                </h3>
                <div className="space-y-3">
                  {filteredStores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => setSelectedStore(store.name)}
                      className={cn(
                        'w-full p-4 rounded-xl text-left transition-all flex items-center gap-4',
                        selectedStore === store.name
                          ? 'bg-accent-green/10 border border-accent-green/50'
                          : 'bg-bg-glass border border-border-light hover:border-border-light'
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex-shrink-0',
                        selectedStore === store.name
                          ? 'border-accent-green bg-accent-green'
                          : 'border-text-muted'
                      )}>
                        {selectedStore === store.name && (
                          <Check className="w-full h-full p-0.5 text-bg-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-text-primary font-medium">{store.name}</p>
                        <p className="text-sm text-text-muted truncate">{store.address}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </GlassCard>
            )}

            <GlassCard className="p-4 md:p-6">
              <h3 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent-gold" />
                见面时间
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">日期</label>
                  <input
                    type="date"
                    value={meetDate}
                    onChange={(e) => setMeetDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full py-3 px-4 bg-bg-glass border border-border-light rounded-xl text-text-primary focus:outline-none focus:border-accent-pink/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">时间</label>
                  <input
                    type="time"
                    value={meetTime}
                    onChange={(e) => setMeetTime(e.target.value)}
                    className="w-full py-3 px-4 bg-bg-glass border border-border-light rounded-xl text-text-primary focus:outline-none focus:border-accent-pink/50 transition-colors"
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {['1小时后', '2小时后', '今天晚上', '明天下午'].map((time) => (
                  <button
                    key={time}
                    className="px-3 py-1.5 text-xs bg-bg-glass border border-border-light rounded-full text-text-secondary hover:border-accent-pink hover:text-accent-pink transition-colors"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
            <GlassCard className="p-4 md:p-6">
              <h3 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-accent-pink" />
                拼盒人数
              </h3>
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setTotalSlots(Math.max(2, totalSlots - 1))}
                  className="w-12 h-12 rounded-full bg-bg-glass border border-border-light flex items-center justify-center text-text-secondary hover:border-accent-pink hover:text-accent-pink transition-colors text-xl"
                >
                  -
                </button>
                <div className="text-center">
                  <span className="font-display text-4xl font-bold gradient-text">{totalSlots}</span>
                  <p className="text-sm text-text-muted mt-1">人拼一盒</p>
                </div>
                <button
                  onClick={() => setTotalSlots(Math.min(12, totalSlots + 1))}
                  className="w-12 h-12 rounded-full bg-bg-glass border border-border-light flex items-center justify-center text-text-secondary hover:border-accent-pink hover:text-accent-pink transition-colors text-xl"
                >
                  +
                </button>
              </div>
              {selectedSeries && (
                <p className="text-center text-sm text-text-muted mt-4">
                  预计人均 <span className="text-accent-gold font-bold">
                    {formatPrice(Math.round(selectedSeries.price * selectedSeries.totalPieces / totalSlots))}
                  </span>
                </p>
              )}
            </GlassCard>

            <GlassCard className="p-4 md:p-6">
              <h3 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-accent-gold" />
                分配规则
              </h3>
              <div className="space-y-3">
                {rules.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.value}
                      onClick={() => setRule(r.value)}
                      className={cn(
                        'w-full p-4 rounded-xl text-left transition-all flex items-center gap-4',
                        rule === r.value
                          ? 'bg-accent-gold/10 border border-accent-gold/50'
                          : 'bg-bg-glass border border-border-light hover:border-border-light'
                      )}
                    >
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        rule === r.value ? 'bg-accent-gold/20' : 'bg-bg-tertiary'
                      )}>
                        <Icon className={cn(
                          'w-6 h-6',
                          rule === r.value ? 'text-accent-gold' : 'text-text-muted'
                        )} />
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          'font-medium',
                          rule === r.value ? 'text-accent-gold' : 'text-text-primary'
                        )}>
                          {r.title}
                        </p>
                        <p className="text-sm text-text-muted">{r.desc}</p>
                      </div>
                      {rule === r.value && (
                        <div className="w-6 h-6 rounded-full bg-accent-gold flex items-center justify-center">
                          <Check className="w-4 h-4 text-bg-primary" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </GlassCard>

            <GlassCard className="p-4 md:p-6">
              <h3 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-accent-blue" />
                取货方式
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {pickupMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.value}
                      onClick={() => setPickupMethod(method.value)}
                      className={cn(
                        'p-4 rounded-xl text-center transition-all',
                        pickupMethod === method.value
                          ? 'bg-accent-blue/10 border border-accent-blue/50'
                          : 'bg-bg-glass border border-border-light hover:border-border-blue'
                      )}
                    >
                      <Icon className={cn(
                        'w-8 h-8 mx-auto mb-2',
                        pickupMethod === method.value ? 'text-accent-blue' : 'text-text-muted'
                      )} />
                      <p className={cn(
                        'font-medium text-sm',
                        pickupMethod === method.value ? 'text-accent-blue' : 'text-text-primary'
                      )}>
                        {method.title}
                      </p>
                      <p className="text-xs text-text-muted mt-1">{method.desc}</p>
                    </button>
                  );
                })}
              </div>
            </GlassCard>

            <GlassCard className="p-4 md:p-6">
              <h3 className="font-display font-bold text-lg text-text-primary mb-4">拼盒说明</h3>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="写点什么吸引小伙伴一起拼盒吧..."
                rows={4}
                className="w-full p-4 bg-bg-glass border border-border-light rounded-xl text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent-pink/50 transition-colors"
              />
            </GlassCard>

            <GlassCard className="p-4 md:p-6" glow="pink">
              <h3 className="font-display font-bold text-lg text-text-primary mb-4">拼盒预览</h3>
              <div className="flex items-center gap-4">
                {selectedSeries && (
                  <img
                    src={selectedSeries.coverImage}
                    alt={selectedSeries.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-text-primary">{selectedSeries?.name}</h4>
                  <p className="text-sm text-text-muted mt-1">{selectedStore || '选择门店'}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="pink" size="sm">{totalSlots}人拼盒</Badge>
                    <Badge variant="gold" size="sm">{rules.find(r => r.value === rule)?.title}</Badge>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border-light">
                <div className="flex items-center gap-3">
                  <Avatar src={currentUser.avatar} size="sm" ring ringColor="gold" />
                  <div>
                    <p className="text-sm text-text-primary">{currentUser.nickname}</p>
                    <p className="text-xs text-text-muted">发起人</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary/95 backdrop-blur-xl border-t border-border-light p-4">
        <div className="container mx-auto flex items-center gap-3">
          {step > 1 && (
            <Button variant="secondary" onClick={handlePrev} className="flex-1 md:flex-none md:w-32">
              上一步
            </Button>
          )}
          {step < 3 ? (
            <Button
              className="flex-1 md:flex-none md:w-48"
              onClick={handleNext}
              disabled={!canNext()}
            >
              下一步
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              className="flex-1 md:flex-none md:w-48"
              onClick={handleCreate}
              disabled={!canNext()}
              variant="gold"
            >
              <Zap className="w-4 h-4 mr-1.5" />
              发起拼盒
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
