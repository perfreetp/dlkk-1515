import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import HallPage from '@/pages/HallPage';
import BoxDetailPage from '@/pages/BoxDetailPage';
import CreateBoxPage from '@/pages/CreateBoxPage';
import ChatPage from '@/pages/ChatPage';
import ResultPage from '@/pages/ResultPage';
import PaymentPage from '@/pages/PaymentPage';
import HistoryPage from '@/pages/HistoryPage';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { useBoxStore } from '@/store/useBoxStore';

function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function InitStore() {
  const initPendingMatches = useBoxStore((state) => state.initPendingMatches);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      initPendingMatches();
    }, 500);
    return () => clearTimeout(timer);
  }, [initPendingMatches]);
  
  return null;
}

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  const isFullscreenPage = location.pathname.includes('/chat');
  const isResultPage = location.pathname.includes('/result') || location.pathname.includes('/payment');
  
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="bg-noise" />
      <div className="bg-grid fixed inset-0 pointer-events-none opacity-50" />
      
      <div className="relative z-10">
        {!isFullscreenPage && !isResultPage && <Header />}
        <main>{children}</main>
        {!isFullscreenPage && !isResultPage && <BottomNav />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <InitStore />
      <LayoutWrapper>
        <Routes>
          <Route path="/" element={<HallPage />} />
          <Route path="/create" element={<CreateBoxPage />} />
          <Route path="/box/:id" element={<BoxDetailPage />} />
          <Route path="/box/:id/chat" element={<ChatPage />} />
          <Route path="/box/:id/result" element={<ResultPage />} />
          <Route path="/box/:id/payment" element={<PaymentPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/chat" element={<div className="text-center py-20 text-text-muted">消息列表页面</div>} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}
