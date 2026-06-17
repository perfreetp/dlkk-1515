import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BoxGroup, BoxMember, ChatMessage, DistributionRule, PickupMethod, BoxStatus, BoxResult, BoxPiece, PieceDistribution } from '@/types';
import { mockBoxGroups, mockChatMessages, currentUser, mockUsers, mockHistoryBoxes } from '@/data/mockDataIndex';
import { generateId } from '@/utils/format';

interface BoxResultMap {
  [boxId: string]: BoxResult;
}

interface BoxStore {
  boxGroups: BoxGroup[];
  chatMessages: ChatMessage[];
  historyBoxes: BoxGroup[];
  boxResults: BoxResultMap;
  
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

const createResultForBox = (box: BoxGroup): BoxResult => {
  const pieces = generateBoxPieces(box.series.name, box.series.totalPieces);
  const shuffledPieces = shuffleArray(pieces);
  
  const distribution: PieceDistribution[] = shuffledPieces.map((piece, index) => {
    const memberIndex = index % box.members.length;
    const member = box.members[memberIndex];
    return {
      pieceId: piece.id,
      userId: member.userId,
      userName: member.user.nickname,
    };
  });
  
  const totalCost = box.series.price * box.series.totalPieces;
  const perPersonCost = Math.round(totalCost / box.filledSlots);
  
  return {
    boxGroupId: box.id,
    pieces: shuffledPieces,
    distribution,
    totalCost,
    perPersonCost,
    completedAt: new Date(),
  };
};

export const useBoxStore = create<BoxStore>()(
  persist(
    (set, get) => ({
      boxGroups: mockBoxGroups,
      chatMessages: mockChatMessages,
      historyBoxes: mockHistoryBoxes,
      boxResults: {},

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
        };

        const meetTime = boxData.meetTime || new Date(Date.now() + 3600000);
        const countdownMs = meetTime.getTime() - Date.now();
        const countdownMinutes = Math.max(1, Math.floor(countdownMs / 60000));

        const newBox: BoxGroup = {
          id: newId,
          seriesId: boxData.seriesId || '',
          series: boxData.series || state.boxGroups[0].series,
          city: boxData.city || '上海',
          district: boxData.district || '',
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

        set({ 
          boxGroups: [newBox, ...state.boxGroups],
          chatMessages: [...state.chatMessages, welcomeMessage],
        });

        setTimeout(() => {
          get().autoMatchPlayers(newId, Math.floor(Math.random() * 2) + 1);
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
          };
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
          u => u.id !== currentUser.id && !box.members.some(m => m.userId === u.id)
        );
        
        const shuffledUsers = shuffleArray(availableUsers);
        const playersToAdd = Math.min(count, box.totalSlots - box.filledSlots, shuffledUsers.length);
        
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
          };
          newMembers.push(member);
          
          newMessages.push({
            id: `msg-${Date.now()}-${i}`,
            boxGroupId: boxId,
            userId: 'system',
            user: user,
            content: `${user.nickname} 加入了拼盒（系统匹配）`,
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

        set({
          boxGroups: updatedBoxes,
          chatMessages: [...state.chatMessages, ...newMessages],
        });
      },

      updateBoxStatus: (boxId, status) => {
        const state = get();
        const updatedBoxes = state.boxGroups.map(b =>
          b.id === boxId ? { ...b, status } : b
        );
        set({ boxGroups: updatedBoxes });
      },
    }),
    {
      name: 'flash-box-storage',
      partialize: (state) => ({
        boxGroups: state.boxGroups,
        chatMessages: state.chatMessages,
        boxResults: state.boxResults,
      }),
    }
  )
);
