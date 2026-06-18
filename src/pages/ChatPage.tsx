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
  Bell,
  Clock,
  UserCheck,
  Calendar,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import { useBoxStore } from '@/store/useBoxStore';
import { useUserStore } from '@/store/useUserStore';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { formatMessageTime, getStatusText, formatDate } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { VoteRecord } from '@/types';

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addMessage, leaveBox, boxGroups, chatMessages, quickAction, createVote, castVote, checkIn } = useBoxStore();
  const { currentUser } = useUserStore();
  const [message, setMessage] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [voteType, setVoteType] = useState<'change_time' | 'confirm_proxy' | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedProxy, setSelectedProxy] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const box = boxGroups.find(b => b.id === id);
  const messages = chatMessages.filter(m => m.boxGroupId === id);
  const activeVote = box?.activeVote;

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

  const isMember = box.members.some(m => m.userId === currentUser.id);
  const isInitiator = box.initiatorId === currentUser.id;
  const currentMember = box.members.find(m => m.userId === currentUser.id);
  const checkedInCount = box.members.filter(m => m.checkedIn).length;
  const notCheckedInMembers = box.members.filter(m => !m.checkedIn);

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

  const handleQuickAction = (action: 'remind_checkin' | 'change_time' | 'confirm_proxy') => {
    if (action === 'remind_checkin') {
      quickAction(box.id, 'remind_checkin');
    } else if (action === 'change_time') {
      setVoteType('change_time');
      setShowVoteModal(true);
    } else if (action === 'confirm_proxy') {
      setVoteType('confirm_proxy');
      setShowVoteModal(true);
    }
  };

  const handleCreateVote = () => {
    if (voteType === 'change_time' && selectedTime) {
      createVote(box.id, 'change_time', selectedTime);
    } else if (voteType === 'confirm_proxy' && selectedProxy) {
      createVote(box.id, 'confirm_proxy', undefined, selectedProxy);
    }
    setShowVoteModal(false);
    setVoteType(null);
    setSelectedTime('');
    setSelectedProxy('');
  };

  const handleVote = (approve: boolean) => {
    if (activeVote) {
      castVote(box.id, activeVote.id, currentUser.id, approve);
    }
  };

  const handleCheckIn = () => {
    checkIn(box.id, currentUser.id);
  };

  const quickActions = [
    { id: 'remind_checkin', name: '提醒签到', icon: Bell, color: 'text-accent-orange', desc: '提醒未签到成员' },
    { id: 'change_time', name: '改时间', icon: Calendar, color: 'text-accent-blue', desc: '投票修改见面时间' },
    { id: 'confirm_proxy', name: '确认代取人', icon: UserCheck, color: 'text-accent-green', desc: '投票确认代取人' },
  ];

  const hasVoted = activeVote?.yesVotes.includes(currentUser.id) || activeVote?.noVotes.includes(currentUser.id);
  const myVote = activeVote?.yesVotes.includes(currentUser.id) ? 'yes' : activeVote?.noVotes.includes(currentUser.id) ? 'no' : null;

  const getVoteTitle = (vote: VoteRecord) => {
    switch (vote.type) {
      case 'change_time':
        return `修改见面时间为 ${formatDate(new Date(vote.targetValue!))}`;
      case 'confirm_proxy':
        const proxyMember = box.members.find(m => m.userId === vote.targetUserId);
        return `确认 ${proxyMember?.user.nickname} 为代取人`;
      case 'remind_checkin':
        return '提醒未签到成员';
      default:
        return '投票';
    }
  };

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
                {box.status === 'full' && (
                  <Badge variant="blue" size="sm">
                    签到 {checkedInCount}/{box.filledSlots}
                  </Badge>
                )}
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
          <div className="space-y-2">
            {box.members.map((member) => (
              <div key={member.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-glass transition-colors">
                <Avatar
                  src={member.user.avatar}
                  size="sm"
                  ring={member.isInitiator}
                  ringColor="gold"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-text-primary flex items-center gap-1">
                      {member.user.nickname}
                      {member.isInitiator && <Crown className="w-3 h-3 text-accent-gold" />}
                    </p>
                    {member.checkedIn ? (
                      <Badge variant="green" size="sm">已签到</Badge>
                    ) : box.status === 'full' ? (
                      <Badge variant="orange" size="sm">未签到</Badge>
                    ) : null}
                    {box.proxyUserId === member.userId && (
                      <Badge variant="blue" size="sm">代取人</Badge>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">预算 ¥{member.budget}</p>
                </div>
                {member.checkedIn && member.checkedInAt && (
                  <span className="text-xs text-text-muted">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {formatMessageTime(new Date(member.checkedInAt))}
                  </span>
                )}
              </div>
            ))}
            {box.totalSlots - box.filledSlots > 0 && (
              <div className="flex items-center gap-2 opacity-50 p-2">
                <div className="w-8 h-8 rounded-full bg-bg-glass border border-dashed border-border-light flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-text-muted" />
                </div>
                <p className="text-sm text-text-muted">虚位以待</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeVote && activeVote.status === 'active' && (
        <div className="bg-accent-purple/10 border-b border-accent-purple/30 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-purple/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-accent-purple" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-text-primary mb-1">
                {getVoteTitle(activeVote)}
              </h4>
              <p className="text-xs text-text-muted mb-3">
                发起人发起投票 · 剩余 {Math.max(0, Math.ceil((new Date(activeVote.expiresAt).getTime() - Date.now()) / 60000))} 分钟
              </p>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-green transition-all"
                    style={{ width: `${(activeVote.yesVotes.length / box.members.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-text-muted">
                  {activeVote.yesVotes.length} 赞成 / {activeVote.noVotes.length} 反对
                </span>
              </div>
              {!hasVoted ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-accent-green/50 text-accent-green hover:bg-accent-green/10"
                    onClick={() => handleVote(true)}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    赞成
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-accent-pink/50 text-accent-pink hover:bg-accent-pink/10"
                    onClick={() => handleVote(false)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    反对
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-text-muted">你已投票：</span>
                  <Badge variant={myVote === 'yes' ? 'green' : 'pink'} size="sm">
                    {myVote === 'yes' ? '赞成' : '反对'}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-bg-glass text-xs text-text-muted">
            今天
          </span>
        </div>

        {box.status === 'full' && notCheckedInMembers.length > 0 && currentMember && !currentMember.checkedIn && (
          <div className="bg-accent-orange/10 border border-accent-orange/30 rounded-xl p-4 text-center">
            <Clock className="w-8 h-8 text-accent-orange mx-auto mb-2" />
            <p className="text-text-primary font-medium mb-2">你还没签到哦</p>
            <p className="text-sm text-text-muted mb-3">请在到店后点击签到，全部到齐后开始拆盒</p>
            <Button size="sm" onClick={handleCheckIn}>
              <Check className="w-4 h-4 mr-1" />
              立即签到
            </Button>
          </div>
        )}

        {messages.map((msg) => {
          const isSystem = msg.type === 'system';
          const isAction = msg.type === 'action';
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

          if (isAction) {
            return (
              <div key={msg.id} className="text-center">
                <span className="inline-block px-4 py-1.5 rounded-full bg-accent-blue/10 text-xs text-accent-blue border border-accent-blue/20">
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

      {isMember && (
        <div className="border-t border-border-light">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <Zap className="w-4 h-4 text-accent-gold" />
            拼盒快捷操作
            {showQuickActions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showQuickActions && (
            <div className="px-4 py-3 bg-bg-secondary/50 border-b border-border-light">
              <div className="grid grid-cols-3 gap-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  const disabled = action.id === 'remind_checkin' && notCheckedInMembers.length === 0;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action.id as any)}
                      disabled={disabled}
                      className={cn(
                        'flex flex-col items-center gap-1 p-3 rounded-xl transition-all',
                        disabled
                          ? 'opacity-50 cursor-not-allowed bg-bg-glass'
                          : 'bg-bg-glass hover:bg-accent-pink/10 hover:border-accent-pink/50 border border-transparent'
                      )}
                    >
                      <Icon className={cn('w-5 h-5', action.color)} />
                      <span className="text-xs text-text-primary font-medium">{action.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {['我大概几点到', '隐藏款归谁', '谁带工具', '要不要喝奶茶'].map((action) => (
                  <button
                    key={action}
                    onClick={() => setMessage(action)}
                    className="shrink-0 px-3 py-1.5 bg-bg-tertiary rounded-full text-xs text-text-secondary border border-border-light hover:border-accent-pink hover:text-accent-pink transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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

      {showVoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6" glow="pink">
            <h3 className="font-display text-xl font-bold text-text-primary mb-4">
              {voteType === 'change_time' ? '发起改时间投票' : '发起代取人投票'}
            </h3>

            {voteType === 'change_time' && (
              <div className="mb-6">
                <label className="block text-sm text-text-secondary mb-2">选择新的见面时间</label>
                <input
                  type="datetime-local"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  min={new Date(Date.now() + 15 * 60000).toISOString().slice(0, 16)}
                  className="w-full px-4 py-3 bg-bg-glass border border-border-light rounded-xl text-text-primary focus:outline-none focus:border-accent-pink/50 transition-colors"
                />
              </div>
            )}

            {voteType === 'confirm_proxy' && (
              <div className="mb-6">
                <label className="block text-sm text-text-secondary mb-2">选择代取人</label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {box.members.map((member) => {
                    const isSelected = selectedProxy === member.userId;
                    return (
                      <button
                        key={member.userId}
                        onClick={() => setSelectedProxy(member.userId)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left',
                          isSelected
                            ? 'bg-accent-blue/10 border border-accent-blue/50'
                            : 'bg-bg-glass border border-transparent hover:border-border-light'
                        )}
                      >
                        <Avatar src={member.user.avatar} size="sm" />
                        <div className="flex-1">
                          <p className={cn(
                            'font-medium text-sm',
                            isSelected ? 'text-accent-blue' : 'text-text-primary'
                          )}>
                            {member.user.nickname}
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

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowVoteModal(false);
                  setVoteType(null);
                  setSelectedTime('');
                  setSelectedProxy('');
                }}
              >
                取消
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateVote}
                disabled={(voteType === 'change_time' && !selectedTime) || (voteType === 'confirm_proxy' && !selectedProxy)}
              >
                发起投票
              </Button>
            </div>
          </GlassCard>
        </div>
      )}

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
