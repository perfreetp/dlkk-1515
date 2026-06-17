import { useState, useMemo } from 'react';
import { Zap, Filter, TrendingUp, Clock, MapPin, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBoxStore } from '@/store/useBoxStore';
import { useUserStore } from '@/store/useUserStore';
import BoxCard from '@/components/features/BoxCard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';
import { categories } from '@/data/mockSeries';
import { cn } from '@/lib/utils';

export default function HallPage() {
  const navigate = useNavigate();
  const { boxGroups } = useBoxStore();
  const { selectedCity } = useUserStore();
  const [activeCategory, setActiveCategory] = useState('全部');
  const [sortBy, setSortBy] = useState<'time' | 'distance' | 'popularity'>('time');
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredBoxes = useMemo(() => {
    let result = [...boxGroups];

    if (activeCategory !== '全部') {
      result = result.filter(box => box.series.category === activeCategory);
    }

    result = result.filter(box => box.city === selectedCity);

    switch (sortBy) {
      case 'time':
        result.sort((a, b) => new Date(a.meetTime).getTime() - new Date(b.meetTime).getTime());
        break;
      case 'distance':
        result.sort((a, b) => {
          const distA = parseFloat(a.distance || '999');
          const distB = parseFloat(b.distance || '999');
          return distA - distB;
        });
        break;
      case 'popularity':
        result.sort((a, b) => b.series.popularity - a.series.popularity);
        break;
    }

    return result;
  }, [boxGroups, activeCategory, sortBy, selectedCity]);

  const recruitingCount = boxGroups.filter(b => b.status === 'recruiting').length;

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="bg-gradient-to-b from-bg-secondary to-bg-primary">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
                拼盒大厅
              </h2>
              <p className="text-text-secondary text-sm">
                当前 <span className="text-accent-pink font-bold">{recruitingCount}</span> 个拼盒正在招募中
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 px-4 py-2.5 bg-bg-glass rounded-xl border border-border-light hover:border-border-pink transition-colors"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter className="w-4 h-4 text-text-secondary" />
                <span className="text-sm text-text-primary">筛选</span>
              </button>
              
              <Button
                onClick={() => navigate('/create')}
                className="hidden md:flex"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                发起拼盒
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm transition-all duration-300',
                  activeCategory === category
                    ? 'bg-gradient-to-r from-accent-pink to-accent-purple text-white shadow-neon-pink'
                    : 'bg-bg-glass text-text-secondary hover:text-text-primary border border-border-light hover:border-border-pink'
                )}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-text-muted">排序:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('time')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors',
                  sortBy === 'time' ? 'text-accent-pink bg-accent-pink/10' : 'text-text-muted hover:text-text-secondary'
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                最新
              </button>
              <button
                onClick={() => setSortBy('distance')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors',
                  sortBy === 'distance' ? 'text-accent-pink bg-accent-pink/10' : 'text-text-muted hover:text-text-secondary'
                )}
              >
                <MapPin className="w-3.5 h-3.5" />
                最近
              </button>
              <button
                onClick={() => setSortBy('popularity')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors',
                  sortBy === 'popularity' ? 'text-accent-pink bg-accent-pink/10' : 'text-text-muted hover:text-text-secondary'
                )}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                热门
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBoxes.map((box, index) => (
            <div
              key={box.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <BoxCard box={box} />
            </div>
          ))}
        </div>

        {filteredBoxes.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-bg-glass flex items-center justify-center">
              <Zap className="w-10 h-10 text-text-muted" />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">
              暂无拼盒
            </h3>
            <p className="text-text-muted text-sm mb-6">
              换个分类试试，或者自己发起一个吧！
            </p>
            <Button onClick={() => navigate('/create')}>
              <Plus className="w-4 h-4 mr-1.5" />
              发起拼盒
            </Button>
          </div>
        )}
      </div>

      <button
        className="fixed right-6 bottom-24 md:bottom-6 w-14 h-14 rounded-full bg-gradient-to-br from-accent-pink to-accent-purple shadow-neon-pink flex items-center justify-center z-40 md:hidden animate-pulse-glow"
        onClick={() => navigate('/create')}
      >
        <Plus className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
