import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BoxGroup, BoxMember, ChatMessage, DistributionRule, PickupMethod,
  BoxStatus, BoxResult, BoxPiece, PieceDistribution, FeeBreakdown,
  VoteRecord
} from '@/types';
import { mockBoxGroups, mockChatMessages, currentUser, mockUsers, mockHistoryBoxes } from '@/data/mockDataIndex';
import { generateId, getRuleText } from '@/utils/format';

interface BoxResultMap {
  [boxId: string]: BoxResult;
}

interface PendingMatch {
  boxId: string;
  targetCount: number;
  createdAt: number;
}

interface ServiceFeeConfig {
  [key: string]: { serviceFee: number; deliveryFee: number };
}

const SERVICE_FEES: ServiceFeeConfig = {
  self_pickup: { serviceFee: 0, deliveryFee: 0 },
  proxy: { serviceFee: 10, deliveryFee: 0 },
  delivery: { serviceFee: 10, deliveryFee: 20 },
};

interface BoxStore {
  boxGroups: BoxGroup[];
  chatMessages: ChatMessage[];
  historyBoxes: BoxGroup[];
  boxResults: BoxResultMap;
  pendingMatches: PendingMatch[];

  joinBox: (boxId: string, budget?: number) => boolean;
  leaveBox: (boxId: string) => boolean;
  addMessage: (boxId: string, content: string) => void;
  createBox: (boxData: Partial<BoxGroup>) => BoxGroup;
  getBoxById: (id: string) => BoxGroup | undefined;
  getMessagesByBoxId: (boxId: string) => ChatMessage[];
  getBoxResult: (boxId: string) => BoxResult | undefined;
  generateBoxResult: (boxId: string) => BoxResult;
  autoMatchPlayers: (boxId: string, count: number) => void;
  updateBoxStatus: (boxId: string, status: BoxStatus) => void;
  initPendingMatches: () => void;

  checkIn: (boxId: string, userId: string) => boolean;
  startUnboxing: (boxId: string) => boolean;

  calculateFeeBreakdown: (box: BoxGroup) => FeeBreakdown;
  setPickupMethod: (boxId: string, method: PickupMethod) => void;
  setProxyUser: (boxId: string, userId: string) => boolean;

  createVote: (boxId: string, type: VoteRecord['type'], targetValue?: string, targetUserId?: string) => VoteRecord | null;
  castVote: (boxId: string, voteId: string, userId: string, approve: boolean) => void;

  quickAction: (boxId: string, action: 'remind_checkin' | 'confirm_proxy' | 'change_time', params?: any) => void;
}

const generateBoxPieces = (seriesName: string, totalPieces: number): BoxPiece[] => {
  const pieces: BoxPiece[] = [];
  const baseNames = ['基础款A', '基础款B', '基础款C', '基础款D', '基础款E', '基础款F', '稀有款A', '稀有款B', '稀有款C', '特别款', '限定款'];

  for (let i = 0; i < totalPieces - 1; i++) {
    pieces.push({
      id: `piece-${i}`,
      name: `${seriesName.slice(0, 4)} - ${baseNames[i % baseNames.length]}`,
      image: '',
      isHidden: false,
      rarity: i < totalPieces - 3 ? 'common' : 'rare',
    });
  }

  pieces.push({
    id: `piece-hidden`,
    name: `${seriesName.slice(0, 4)} - 隐藏款`,
    image: '',
    isHidden: true,
    rarity: 'hidden',
  });

  return pieces;
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getRuleExplanation = (rule: DistributionRule, memberCount: number): string => {
  switch (rule) {
    case 'hidden_priority':
      return '隐藏款优先规则：隐藏款首先按报名顺序分配给第一位成员；剩余普通款随机均分给所有人';
    case 'average':
      return '普通款均分规则：所有款式（含隐藏款）完全随机分配，每人机会均等';
    case 'rotation':
      return '按序轮转规则：按座位顺序轮流挑选，第1轮1→2→3→4，第2轮4→3→2→1，依次轮转';
    default:
      return '分配完成';
  }
};

const createDistribution = (
  pieces: BoxPiece[],
  members: BoxMember[],
  rule: DistributionRule
): PieceDistribution[] => {
  const distribution: PieceDistribution[] = [];
  const hiddenPiece = pieces.find(p => p.isHidden);
  const regularPieces = pieces.filter(p => !p.isHidden);

  if (rule === 'hidden_priority' && hiddenPiece) {
    distribution.push({
      pieceId: hiddenPiece.id,
      userId: members[0].userId,
      userName: members[0].user.nickname,
      assignmentReason: '隐藏款优先：按报名顺序分配给发起人',
    });

    const shuffledRegular = shuffleArray(regularPieces);
    shuffledRegular.forEach((piece, idx) => {
      const memberIdx = idx % members.length;
      distribution.push({
        pieceId: piece.id,
        userId: members[memberIdx].userId,
        userName: members[memberIdx].user.nickname,
        assignmentReason: '普通款随机均分',
      });
    });
  } else if (rule === 'average') {
    const allShuffled = shuffleArray(pieces);
    allShuffled.forEach((piece, idx) => {
      const memberIdx = idx % members.length;
      distribution.push({
        pieceId: piece.id,
        userId: members[memberIdx].userId,
        userName: members[memberIdx].user.nickname,
        assignmentReason: piece.isHidden ? '随机抽取获得隐藏款' : '随机均分',
      });
    });
  } else {
    const sortedMembers = [...members].sort((a, b) => a.slotIndex - b.slotIndex);
    const allPieces = hiddenPiece ? [hiddenPiece, ...shuffleArray(regularPieces)] : shuffleArray(regularPieces);

    allPieces.forEach((piece, idx) => {
      const round = Math.floor(idx / sortedMembers.length);
      const posInRound = idx % sortedMembers.length;
      const memberIdx = round % 2 === 0 ? posInRound : (sortedMembers.length - 1 - posInRound);
      const member = sortedMembers[memberIdx];

      distribution.push({
        pieceId: piece.id,
        userId: member.userId,
        userName: member.user.nickname,
        assignmentReason: piece.isHidden
          ? `第${round + 1}轮${round % 2 === 0 ? '正序' : '倒序'}轮选`
          : `第${round + 1}轮${round % 2 === 0 ? '正序' : '倒序'}轮选`,
      });
    });
  }

  return distribution;
};

const createResultForBox = (box: BoxGroup): BoxResult => {
  const pieces = generateBoxPieces(box.series.name, box.series.totalPieces);
  const distribution = createDistribution(pieces, box.members, box.rule);

  const fees = calculateFeeBreakdownStatic(box);
  const totalCost = box.series.price * box.series.totalPieces +
    (fees.serviceFee + fees.deliveryFee) * box.filledSlots;
  const perPersonCost = Math.round(totalCost / Math.max(1, box.filledSlots));

  return {
    boxGroupId: box.id,
    pieces,
    distribution,
    totalCost,
    perPersonCost,
    completedAt: new Date(),
    feeBreakdown: {
      ...fees,
      totalPerPerson: perPersonCost,
    },
    ruleExplanation: getRuleExplanation(box.rule, box.members.length),
    pickupMethod: box.pickupMethod,
  };
};

const calculateFeeBreakdownStatic = (box: BoxGroup): Omit<FeeBreakdown, 'totalPerPerson'> => {
  const baseCost = Math.round((box.series.price * box.series.totalPieces) / Math.max(1, box.filledSlots));
  const fees = SERVICE_FEES[box.pickupMethod] || SERVICE_FEES.self_pickup;
  return {
    baseCost,
    serviceFee: fees.serviceFee,
    deliveryFee: fees.deliveryFee,
  };
};

const reviveDates = <T,>(obj: T): T => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => reviveDates(item)) as unknown as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      result[key] = new Date(value);
    } else if (value && typeof value === 'object') {
      result[key] = reviveDates(value);
    } else {
      result[key] = value;
    }
  }
  return result as T;
};

const ensureMemberDefaults = (members: BoxMember[]): BoxMember[] => {
  return members.map(m => ({
    ...m,
    checkedIn: m.checkedIn ?? false,
    isProxy: m.isProxy ?? false,
  }));
};

export const useBoxStore = create<BoxStore>()(
  persist(
    (set, get) => ({
      boxGroups: mockBoxGroups.map(box => ({
        ...box,
        members: ensureMemberDefaults(box.members),
      })),
      chatMessages: mockChatMessages,
      historyBoxes: mockHistoryBoxes,
      boxResults: {},
      pendingMatches: [],

      initPendingMatches: () => {
        const state = get();
        const now = Date.now();

        state.pendingMatches.forEach((pending) => {
          const box = state.getBoxById(pending.boxId);
          if (!box) return;
          if (box.filledSlots >= box.totalSlots) return;
          if (now - pending.createdAt > 30000) return;

          const remaining = pending.targetCount - (box.filledSlots - 1);
          if (remaining > 0) {
            setTimeout(() => {
              get().autoMatchPlayers(pending.boxId, remaining);
            }, 1500 + Math.random() * 1500);
          }
        });
      },

      joinBox: (boxId, budget = 150) => {
        const state = get();
        const box = state.boxGroups.find(b => b.id === boxId);
        if (!box || box.filledSlots >= box.totalSlots) return false;

        const newMember: BoxMember = {
          userId: currentUser.id,
          user: currentUser,
          budget,
          slotIndex: box.filledSlots,
          status: 'confirmed',
          joinedAt: new Date(),
          isInitiator: false,
          checkedIn: false,
          isProxy: false,
        };

        const updatedBoxes = state.boxGroups.map(b => {
          if (b.id === boxId) {
            return {
              ...b,
              members: [...b.members, newMember],
              filledSlots: b.filledSlots + 1,
              status: (b.filledSlots + 1 >= b.totalSlots ? 'full' : b.status) as BoxStatus,
            };
          }
          return b;
        });

        const systemMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          boxGroupId: boxId,
          userId: 'system',
          user: currentUser,
          content: `${currentUser.nickname} 加入了拼盒`,
          type: 'system',
          timestamp: new Date(),
        };

        set({
          boxGroups: updatedBoxes,
          chatMessages: [...state.chatMessages, systemMessage],
        });

        return true;
      },

      leaveBox: (boxId) => {
        const state = get();
        const box = state.boxGroups.find(b => b.id === boxId);
        if (!box) return false;

        const updatedBoxes = state.boxGroups.map(b => {
          if (b.id === boxId) {
            const newMembers = b.members.filter(m => m.userId !== currentUser.id);
            const reindexedMembers = newMembers.map((m, idx) => ({ ...m, slotIndex: idx }));
            return {
              ...b,
              members: reindexedMembers,
              filledSlots: newMembers.length,
              status: 'recruiting' as BoxStatus,
            };
          }
          return b;
        });

        const systemMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          boxGroupId: boxId,
          userId: 'system',
          user: currentUser,
          content: `${currentUser.nickname} 退出了拼盒`,
          type: 'system',
          timestamp: new Date(),
        };

        set({
          boxGroups: updatedBoxes,
          chatMessages: [...state.chatMessages, systemMessage],
        });

        return true;
      },

      addMessage: (boxId, content) => {
        const state = get();
        const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          boxGroupId: boxId,
          userId: currentUser.id,
          user: currentUser,
          content,
          type: 'text',
          timestamp: new Date(),
        };
        set({ chatMessages: [...state.chatMessages, newMessage] });
      },

      createBox: (boxData) => {
        const state = get();
        const newId = `box-${Date.now()}`;

        const initiatorMember: BoxMember = {
          userId: currentUser.id,
          user: currentUser,
          budget: boxData.members?.[0]?.budget || 200,
          slotIndex: 0,
          status: 'confirmed',
          joinedAt: new Date(),
          isInitiator: true,
          checkedIn: false,
          isProxy: false,
        };

        const meetTime = boxData.meetTime || new Date(Date.now() + 3600000);
        const countdownMs = meetTime.getTime() - Date.now();
        const countdownMinutes = Math.max(1, Math.floor(countdownMs / 60000));

        const cityName = boxData.city || '上海';
        const districtName = boxData.district || '';

        const newBox: BoxGroup = {
          id: newId,
          seriesId: boxData.seriesId || '',
          series: boxData.series || state.boxGroups[0].series,
          city: cityName,
          district: districtName,
          storeName: boxData.storeName || '',
          storeAddress: boxData.storeAddress || '',
          meetTime,
          status: 'recruiting',
          totalSlots: boxData.totalSlots || 4,
          filledSlots: 1,
          members: [initiatorMember],
          rule: boxData.rule || 'hidden_priority',
          pickupMethod: boxData.pickupMethod || 'self_pickup',
          createdAt: new Date(),
          countdownMinutes,
          initiatorId: currentUser.id,
          description: boxData.description || '',
          distance: '0.5km',
        };

        const welcomeMessage: ChatMessage = {
          id: `msg-${Date.now()}-welcome`,
          boxGroupId: newId,
          userId: 'system',
          user: currentUser,
          content: '拼盒已创建！系统正在为您匹配附近同款玩家...',
          type: 'system',
          timestamp: new Date(),
        };

        const matchCount = Math.floor(Math.random() * 2) + 1;
        const newPending: PendingMatch = {
          boxId: newId,
          targetCount: matchCount,
          createdAt: Date.now(),
        };

        set({
          boxGroups: [newBox, ...state.boxGroups],
          chatMessages: [...state.chatMessages, welcomeMessage],
          pendingMatches: [...state.pendingMatches, newPending],
        });

        setTimeout(() => {
          get().autoMatchPlayers(newId, matchCount);
        }, 2000);

        return newBox;
      },

      getBoxById: (id) => {
        return get().boxGroups.find(b => b.id === id);
      },

      getMessagesByBoxId: (boxId) => {
        return get().chatMessages.filter(m => m.boxGroupId === boxId);
      },

      getBoxResult: (boxId) => {
        return get().boxResults[boxId];
      },

      generateBoxResult: (boxId) => {
        const state = get();
        const box = state.getBoxById(boxId);
        if (!box) {
          return {
            boxGroupId: boxId,
            pieces: [],
            distribution: [],
            totalCost: 0,
            perPersonCost: 0,
            completedAt: new Date(),
            feeBreakdown: { baseCost: 0, serviceFee: 0, deliveryFee: 0, totalPerPerson: 0 },
            ruleExplanation: '',
            pickupMethod: 'self_pickup' as PickupMethod,
          };
        }

        const existing = state.boxResults[boxId];
        if (existing) {
          return existing;
        }

        const result = createResultForBox(box);

        set({
          boxResults: {
            ...state.boxResults,
            [boxId]: result,
          },
          boxGroups: state.boxGroups.map(b =>
            b.id === boxId ? { ...b, status: 'completed' as BoxStatus } : b
          ),
        });

        return result;
      },

      autoMatchPlayers: (boxId, count) => {
        const state = get();
        const box = state.boxGroups.find(b => b.id === boxId);
        if (!box || box.filledSlots >= box.totalSlots) return;

        const availableUsers = mockUsers.filter(
          u => u.id !== currentUser.id
            && !box.members.some(m => m.userId === u.id)
            && u.city === box.city
        );

        const shuffledUsers = shuffleArray(availableUsers);
        const playersToAdd = Math.min(count, box.totalSlots - box.filledSlots, shuffledUsers.length);

        if (playersToAdd <= 0) return;

        const newMembers: BoxMember[] = [];
        const newMessages: ChatMessage[] = [];

        for (let i = 0; i < playersToAdd; i++) {
          const user = shuffledUsers[i];
          const member: BoxMember = {
            userId: user.id,
            user,
            budget: Math.floor(Math.random() * 200) + 100,
            slotIndex: box.filledSlots + i,
            status: 'confirmed',
            joinedAt: new Date(),
            isInitiator: false,
            checkedIn: false,
            isProxy: false,
          };
          newMembers.push(member);

          newMessages.push({
            id: `msg-${Date.now()}-${i}-${boxId}`,
            boxGroupId: boxId,
            userId: 'system',
            user: user,
            content: `${user.nickname} 加入了拼盒（${box.city}同城匹配）`,
            type: 'system',
            timestamp: new Date(Date.now() + i * 1000),
          });
        }

        const updatedBoxes = state.boxGroups.map(b => {
          if (b.id === boxId) {
            const allMembers = [...b.members, ...newMembers];
            const newFilledSlots = allMembers.length;
            return {
              ...b,
              members: allMembers,
              filledSlots: newFilledSlots,
              status: (newFilledSlots >= b.totalSlots ? 'full' : 'recruiting') as BoxStatus,
            };
          }
          return b;
        });

        const updatedPending = state.pendingMatches.filter(p => p.boxId !== boxId);

        set({
          boxGroups: updatedBoxes,
          chatMessages: [...state.chatMessages, ...newMessages],
          pendingMatches: updatedPending,
        });
      },

      updateBoxStatus: (boxId, status) => {
        const state = get();
        const updatedBoxes = state.boxGroups.map(b =>
          b.id === boxId ? { ...b, status } : b
        );
        set({ boxGroups: updatedBoxes });
      },

      checkIn: (boxId, userId) => {
        const state = get();
        const box = state.getBoxById(boxId);
        if (!box) return false;

        const member = box.members.find(m => m.userId === userId);
        if (!member || member.checkedIn) return false;

        const updatedBoxes = state.boxGroups.map(b => {
          if (b.id === boxId) {
            return {
              ...b,
              members: b.members.map(m =>
                m.userId === userId
                  ? { ...m, checkedIn: true, checkedInAt: new Date() }
                  : m
              ),
            };
          }
          return b;
        });

        const systemMessage: ChatMessage = {
          id: `msg-${Date.now()}-checkin`,
          boxGroupId: boxId,
          userId: 'system',
          user: member.user,
          content: `✅ ${member.user.nickname} 已到店签到`,
          type: 'action',
          timestamp: new Date(),
        };

        set({
          boxGroups: updatedBoxes,
          chatMessages: [...state.chatMessages, systemMessage],
        });

        return true;
      },

      startUnboxing: (boxId) => {
        const state = get();
        const box = state.getBoxById(boxId);
        if (!box) return false;

        const allCheckedIn = box.members.every(m => m.checkedIn);
        if (!allCheckedIn) return false;
        if (box.initiatorId !== currentUser.id) return false;

        const updatedBoxes = state.boxGroups.map(b =>
          b.id === boxId ? { ...b, status: 'unboxing' as BoxStatus } : b
        );

        const systemMessage: ChatMessage = {
          id: `msg-${Date.now()}-start`,
          boxGroupId: boxId,
          userId: 'system',
          user: currentUser,
          content: `🎉 全员到齐！发起人开始拆盒，分配规则：${getRuleText(box.rule)}`,
          type: 'action',
          timestamp: new Date(),
        };

        set({
          boxGroups: updatedBoxes,
          chatMessages: [...state.chatMessages, systemMessage],
        });

        return true;
      },

      calculateFeeBreakdown: (box) => {
        const fees = calculateFeeBreakdownStatic(box);
        return {
          ...fees,
          totalPerPerson: fees.baseCost + fees.serviceFee + fees.deliveryFee,
        };
      },

      setPickupMethod: (boxId, method) => {
        const state = get();
        const updatedBoxes = state.boxGroups.map(b =>
          b.id === boxId ? { ...b, pickupMethod: method } : b
        );
        set({ boxGroups: updatedBoxes });
      },

      setProxyUser: (boxId, userId) => {
        const state = get();
        const box = state.getBoxById(boxId);
        if (!box) return false;

        const userExists = box.members.some(m => m.userId === userId);
        if (!userExists) return false;

        const updatedBoxes = state.boxGroups.map(b => {
          if (b.id === boxId) {
            return {
              ...b,
              proxyUserId: userId,
              members: b.members.map(m => ({
                ...m,
                isProxy: m.userId === userId,
              })),
            };
          }
          return b;
        });

        const user = box.members.find(m => m.userId === userId)?.user;
        const systemMessage: ChatMessage = {
          id: `msg-${Date.now()}-proxy`,
          boxGroupId: boxId,
          userId: 'system',
          user: currentUser,
          content: `📦 ${user?.nickname} 已被确认为代取人`,
          type: 'action',
          timestamp: new Date(),
        };

        set({
          boxGroups: updatedBoxes,
          chatMessages: [...state.chatMessages, systemMessage],
        });

        return true;
      },

      createVote: (boxId, type, targetValue, targetUserId) => {
        const state = get();
        const box = state.getBoxById(boxId);
        if (!box || box.activeVote?.status === 'active') return null;

        const vote: VoteRecord = {
          id: `vote-${Date.now()}`,
          type,
          proposerId: currentUser.id,
          targetValue,
          targetUserId,
          yesVotes: [],
          noVotes: [],
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          status: 'active',
        };

        const updatedBoxes = state.boxGroups.map(b =>
          b.id === boxId ? { ...b, activeVote: vote } : b
        );

        let content = '';
        if (type === 'change_time' && targetValue) {
          content = `📋 ${currentUser.nickname} 发起投票：将见面时间改为 ${targetValue}`;
        } else if (type === 'confirm_proxy' && targetUserId) {
          const targetUser = box.members.find(m => m.userId === targetUserId)?.user;
          content = `📋 ${currentUser.nickname} 发起投票：确认 ${targetUser?.nickname} 为代取人`;
        } else if (type === 'remind_checkin') {
          content = `📋 ${currentUser.nickname} 发起投票：提醒未签到成员`;
        }

        const systemMessage: ChatMessage = {
          id: `msg-${Date.now()}-vote`,
          boxGroupId: boxId,
          userId: 'system',
          user: currentUser,
          content,
          type: 'action',
          timestamp: new Date(),
        };

        set({
          boxGroups: updatedBoxes,
          chatMessages: [...state.chatMessages, systemMessage],
        });

        return vote;
      },

      castVote: (boxId, voteId, userId, approve) => {
        const state = get();
        const box = state.getBoxById(boxId);
        if (!box || !box.activeVote || box.activeVote.id !== voteId) return;

        const hasVoted = [...box.activeVote.yesVotes, ...box.activeVote.noVotes].includes(userId);
        if (hasVoted) return;

        const updatedVote: VoteRecord = {
          ...box.activeVote,
          yesVotes: approve ? [...box.activeVote.yesVotes, userId] : box.activeVote.yesVotes,
          noVotes: !approve ? [...box.activeVote.noVotes, userId] : box.activeVote.noVotes,
        };

        const totalVotes = updatedVote.yesVotes.length + updatedVote.noVotes.length;
        const majority = Math.ceil(box.members.length / 2);
        let newStatus: VoteRecord['status'] = 'active';

        if (updatedVote.yesVotes.length >= majority) {
          newStatus = 'passed';
        } else if (updatedVote.noVotes.length >= majority) {
          newStatus = 'rejected';
        } else if (totalVotes >= box.members.length) {
          newStatus = updatedVote.yesVotes.length > updatedVote.noVotes.length ? 'passed' : 'rejected';
        }

        updatedVote.status = newStatus;

        const voter = box.members.find(m => m.userId === userId)?.user;
        const actionMessage: ChatMessage = {
          id: `msg-${Date.now()}-cast`,
          boxGroupId: boxId,
          userId: 'system',
          user: currentUser,
          content: `${voter?.nickname} ${approve ? '赞成' : '反对'}，当前 ${updatedVote.yesVotes.length}赞 ${updatedVote.noVotes.length}反`,
          type: 'action',
          timestamp: new Date(),
        };

        const newMessages: ChatMessage[] = [actionMessage];

        if (newStatus !== 'active') {
          const resultContent = newStatus === 'passed'
            ? `✅ 投票通过！${updatedVote.type === 'change_time' ? '时间已更新' : updatedVote.type === 'confirm_proxy' ? '代取人已确认' : '已提醒签到'}`
            : '❌ 投票未通过';

          newMessages.push({
            id: `msg-${Date.now()}-result`,
            boxGroupId: boxId,
            userId: 'system',
            user: currentUser,
            content: resultContent,
            type: 'action',
            timestamp: new Date(),
          });
        }

        const updatedBoxes = state.boxGroups.map(b => {
          if (b.id === boxId) {
            let finalBox = { ...b, activeVote: updatedVote };
            if (newStatus === 'passed') {
              if (updatedVote.type === 'change_time' && updatedVote.targetValue) {
                const [datePart, timePart] = updatedVote.targetValue.split(' ');
                if (datePart && timePart) {
                  finalBox = { ...finalBox, meetTime: new Date(`${datePart}T${timePart}`) };
                }
              } else if (updatedVote.type === 'confirm_proxy' && updatedVote.targetUserId) {
                finalBox = {
                  ...finalBox,
                  proxyUserId: updatedVote.targetUserId,
                  members: finalBox.members.map(m => ({
                    ...m,
                    isProxy: m.userId === updatedVote.targetUserId,
                  })),
                };
              }
            }
            if (newStatus !== 'active') {
              finalBox = { ...finalBox, activeVote: undefined };
            }
            return finalBox;
          }
          return b;
        });

        set({
          boxGroups: updatedBoxes,
          chatMessages: [...state.chatMessages, ...newMessages],
        });
      },

      quickAction: (boxId, action, params) => {
        const state = get();
        const box = state.getBoxById(boxId);
        if (!box) return;

        if (action === 'remind_checkin') {
          const unchecked = box.members.filter(m => !m.checkedIn);
          if (unchecked.length === 0) return;

          const names = unchecked.map(m => m.user.nickname).join('、');
          const systemMessage: ChatMessage = {
            id: `msg-${Date.now()}-remind`,
            boxGroupId: boxId,
            userId: 'system',
            user: currentUser,
            content: `⏰ ${currentUser.nickname} 提醒 ${names} 尽快签到`,
            type: 'action',
            timestamp: new Date(),
          };

          set({ chatMessages: [...state.chatMessages, systemMessage] });
        } else if (action === 'confirm_proxy' && params?.userId) {
          state.setProxyUser(boxId, params.userId);
        } else if (action === 'change_time' && params?.newTime) {
          state.createVote(boxId, 'change_time', params.newTime);
        }
      },
    }),
    {
      name: 'flash-box-storage-v3',
      partialize: (state) => ({
        boxGroups: state.boxGroups,
        chatMessages: state.chatMessages,
        boxResults: state.boxResults,
        pendingMatches: state.pendingMatches,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.boxGroups = reviveDates(state.boxGroups).map((box: BoxGroup) => ({
            ...box,
            members: ensureMemberDefaults(box.members),
          }));
          state.chatMessages = reviveDates(state.chatMessages);
          state.boxResults = reviveDates(state.boxResults);
          state.historyBoxes = reviveDates(state.historyBoxes);
        }
      },
    }
  )
);
