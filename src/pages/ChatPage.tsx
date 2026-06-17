import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Users,
  MoreHorizontal,
  Smile,
  Paperclip,
  Zap,
  Crown,
  LogOut,
  UserPlus,
} from 'lucide-react';
import { useBoxStore } from '@/store/useBoxStore';
import { useUserStore } from '@/store/useUserStore';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { formatMessageTime, getStatusText } from '@/utils/format';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addMessage, leaveBox, boxGroups, chatMessages } = useBoxStore();
  const { currentUser } = useUserStore();
  const [message, setMessage] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const box = boxGroups.find(b => b.id === id);
  const messages = chatMessages.filter(m => m.boxGroupId === id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!box) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted">拼盒不存在</p>
      </div>
    );
  }

  const handleSend = () => {
    if (!message.trim()) return;
    addMessage(box.id, message.trim());
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    '我大概几点到',
    '隐藏款归谁',
    '谁带工具',
    '要不要喝奶茶',
  ];

  const isMember = box.members.some(m => m.userId === currentUser.id);

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <div className="sticky top-0 z-40 bg-bg-secondary/90 backdrop-blur-xl border-b border-border-light">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-bg-glass flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <Link to={`/box/${box.id}`} className="block">
                <h2 className="font-display font-bold text-text-primary truncate">
                  {box.series.name}
                </h2>
              </Link>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="green" size="sm">{getStatusText(box.status)}</Badge>
                <span className="text-text-muted">{box.filledSlots}/{box.totalSlots}人</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="w-10 h-10 rounded-full bg-bg-glass flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            >
              <Users className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full bg-bg-glass flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showMembers && (
        <div className="bg-bg-secondary/95 backdrop-blur-xl border-b border-border-light p-4 animate-slide-down">
          <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-accent-pink" />
            拼盒成员 ({box.members.length})
          </h3>
          <div className="flex flex-wrap gap-3">
            {box.members.map((member) => (
              <div key={member.userId} className="flex items-center gap-2">
                <Avatar
                  src={member.user.avatar}
                  size="sm"
                  ring={member.isInitiator}
                  ringColor="gold"
                />
                <div>
                  <p className="text-sm text-text-primary flex items-center gap-1">
                    {member.user.nickname}
                    {member.isInitiator && <Crown className="w-3 h-3 text-accent-gold" />}
                  </p>
                  <p className="text-xs text-text-muted">预算 ¥{member.budget}</p>
                </div>
              </div>
            ))}
            {box.totalSlots - box.filledSlots > 0 && (
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-8 h-8 rounded-full bg-bg-glass border border-dashed border-border-light flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-text-muted" />
                </div>
                <p className="text-sm text-text-muted">虚位以待</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-bg-glass text-xs text-text-muted">
            今天
          </span>
        </div>

        {messages.map((msg) => {
          const isSystem = msg.type === 'system';
          const isMine = msg.userId === currentUser.id;

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center">
                <span className="inline-block px-4 py-1.5 rounded-full bg-accent-pink/10 text-xs text-accent-pink border border-accent-pink/20">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3 max-w-[85%]',
                isMine ? 'ml-auto flex-row-reverse' : ''
              )}
            >
              <Avatar src={msg.user.avatar} size="sm" />
              <div className={cn(
                'rounded-2xl px-4 py-2.5',
                isMine
                  ? 'bg-gradient-to-br from-accent-pink to-accent-purple text-white rounded-br-md'
                  : 'bg-bg-glass text-text-primary border border-border-light rounded-bl-md'
              )}>
                {!isMine && (
                  <p className="text-xs text-text-muted mb-1">{msg.user.nickname}</p>
                )}
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className={cn(
                  'text-xs mt-1.5',
                  isMine ? 'text-white/60' : 'text-text-muted'
                )}>
                  {formatMessageTime(new Date(msg.timestamp))}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-2 border-t border-border-light">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => setMessage(action)}
              className="shrink-0 px-3 py-1.5 bg-bg-glass rounded-full text-xs text-text-secondary border border-border-light hover:border-accent-pink hover:text-accent-pink transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 bg-bg-secondary/95 backdrop-blur-xl border-t border-border-light p-3">
        <div className="flex items-end gap-3">
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-bg-glass flex items-center justify-center text-text-secondary hover:text-accent-pink transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full bg-bg-glass flex items-center justify-center text-text-secondary hover:text-accent-pink transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="输入消息..."
              rows={1}
              className="w-full py-2.5 px-4 bg-bg-glass border border-border-light rounded-2xl text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent-pink/50 transition-colors"
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-all',
              message.trim()
                ? 'bg-gradient-to-br from-accent-pink to-accent-purple text-white shadow-neon-pink'
                : 'bg-bg-glass text-text-muted'
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isMember && box.status === 'recruiting' && (
        <div className="fixed bottom-20 right-4 z-30 md:bottom-4">
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/box/${box.id}/result`)}
              className="shadow-lg"
            >
              <Zap className="w-4 h-4 mr-1.5" />
              模拟拆盒
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                leaveBox(box.id);
                navigate(-1);
              }}
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              退出拼盒
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
