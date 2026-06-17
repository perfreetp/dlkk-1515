import { create } from 'zustand';
import type { BoxGroup, BoxMember, ChatMessage, DistributionRule, PickupMethod, BoxStatus } from '@/types';
import { mockBoxGroups, mockChatMessages, currentUser, mockBoxResult, mockHistoryBoxes, mockBoxPieces } from '@/data/mockDataIndex';

interface BoxStore {
  boxGroups: BoxGroup[];
  currentBox: BoxGroup | null;
  chatMessages: ChatMessage[];
  historyBoxes: BoxGroup[];
  setCurrentBox: (box: BoxGroup | null) => void;
  joinBox: (boxId: string, budget?: number) => boolean;
  leaveBox: (boxId: string) => boolean;
  addMessage: (boxId: string, content: string) => void;
  createBox: (boxData: Partial<BoxGroup>) => BoxGroup;
  getBoxById: (id: string) => BoxGroup | undefined;
  getMessagesByBoxId: (boxId: string) => ChatMessage[];
}

export const useBoxStore = create<BoxStore>((set, get) => ({
  boxGroups: mockBoxGroups,
  currentBox: null,
  chatMessages: mockChatMessages,
  historyBoxes: mockHistoryBoxes,

  setCurrentBox: (box) => set({ currentBox: box }),

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
        return {
          ...b,
          members: newMembers,
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

    const newBox: BoxGroup = {
      id: newId,
      seriesId: boxData.seriesId || '',
      series: boxData.series || state.boxGroups[0].series,
      city: boxData.city || '上海',
      district: boxData.district || '',
      storeName: boxData.storeName || '',
      storeAddress: boxData.storeAddress || '',
      meetTime: boxData.meetTime || new Date(Date.now() + 3600000),
      status: 'recruiting',
      totalSlots: boxData.totalSlots || 4,
      filledSlots: 1,
      members: [initiatorMember],
      rule: boxData.rule || 'hidden_priority',
      pickupMethod: boxData.pickupMethod || 'self_pickup',
      createdAt: new Date(),
      countdownMinutes: boxData.countdownMinutes || 60,
      initiatorId: currentUser.id,
      description: boxData.description || '',
    };

    set({ boxGroups: [newBox, ...state.boxGroups] });
    return newBox;
  },

  getBoxById: (id) => {
    return get().boxGroups.find(b => b.id === id);
  },

  getMessagesByBoxId: (boxId) => {
    return get().chatMessages.filter(m => m.boxGroupId === boxId);
  },
}));
