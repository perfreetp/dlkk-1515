export const formatCountdown = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}小时${mins}分钟`;
  }
  return `${mins}分钟`;
};

export const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const formatDate = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
};

export const formatDateShort = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
};

export const getTimeRemaining = (meetTime: Date): { hours: number; minutes: number; totalMinutes: number } => {
  const now = new Date();
  const diff = meetTime.getTime() - now.getTime();
  const totalMinutes = Math.max(0, Math.floor(diff / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes, totalMinutes };
};

export const formatPrice = (price: number): string => {
  return `¥${price.toFixed(0)}`;
};

export const getRuleText = (rule: string): string => {
  const ruleMap: Record<string, string> = {
    hidden_priority: '隐藏款优先',
    average: '普通款均分',
    rotation: '按序轮转',
  };
  return ruleMap[rule] || rule;
};

export const getRuleDescription = (rule: string): string => {
  const ruleMap: Record<string, string> = {
    hidden_priority: '隐藏款按报名顺序优先选择，普通款随机均分',
    average: '所有款式随机均分，人人机会均等',
    rotation: '按座位顺序轮流挑选，先到先得',
  };
  return ruleMap[rule] || '';
};

export const getPickupText = (method: string): string => {
  const methodMap: Record<string, string> = {
    self_pickup: '到店自提',
    proxy: '代取服务',
    delivery: '同城送达',
  };
  return methodMap[method] || method;
};

export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    recruiting: '招募中',
    full: '签到中',
    unboxing: '拆盒中',
    ongoing: '进行中',
    completed: '已完成',
  };
  return statusMap[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    recruiting: 'text-accent-green',
    full: 'text-accent-blue',
    unboxing: 'text-accent-gold',
    ongoing: 'text-accent-gold',
    completed: 'text-text-muted',
  };
  return colorMap[status] || 'text-text-secondary';
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export const formatMessageTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  
  return formatDate(date);
};
