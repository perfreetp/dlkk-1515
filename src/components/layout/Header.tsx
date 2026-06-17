import { Search, MapPin, User, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import { useState } from 'react';

export default function Header() {
  const { currentUser, selectedCity } = useUserStore();
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-border-light">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-pink to-accent-blue flex items-center justify-center shadow-neon-pink">
              <span className="font-display font-bold text-white text-lg">闪</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-lg gradient-text">闪电拼盒</h1>
              <p className="text-xs text-text-muted">同城潮玩 极速拼单</p>
            </div>
          </Link>

          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className={`relative transition-all duration-300 ${searchFocused ? 'scale-105' : ''}`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="搜索系列、门店..."
                className="w-full bg-bg-glass border border-border-light rounded-full py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-pink/50 focus:shadow-neon-pink transition-all duration-300"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-1.5 px-3 py-2 bg-bg-glass rounded-full border border-border-light hover:border-border-pink transition-colors"
            >
              <MapPin className="w-4 h-4 text-accent-pink" />
              <span className="text-sm text-text-primary">{selectedCity}</span>
            </button>

            <button className="relative p-2 text-text-secondary hover:text-text-primary transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-pink rounded-full" />
            </button>

            <button
              className="flex items-center gap-2 p-1 pr-3 bg-bg-glass rounded-full border border-border-light hover:border-border-pink transition-colors"
              onClick={() => navigate('/history')}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.nickname}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm text-text-primary hidden sm:block">{currentUser.nickname}</span>
            </button>
          </div>
        </div>

        <div className="mt-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="搜索系列、门店..."
              className="w-full bg-bg-glass border border-border-light rounded-full py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-pink/50 transition-all"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
