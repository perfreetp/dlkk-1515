export interface User {
  id: string;
  nickname: string;
  avatar: string;
  city: string;
  totalBoxes: number;
  hiddenCount: number;
  level: number;
}

export interface Series {
  id: string;
  name: string;
  brand: string;
  coverImage: string;
  price: number;
  totalPieces: number;
  hiddenName: string;
  hiddenImage: string;
  popularity: number;
  category: string;
}

export type DistributionRule = 'hidden_priority' | 'average' | 'rotation';
export type PickupMethod = 'self_pickup' | 'proxy' | 'delivery';
export type BoxStatus = 'recruiting' | 'full' | 'ongoing' | 'completed';

export interface BoxMember {
  userId: string;
  user: User;
  budget: number;
  slotIndex: number;
  status: 'confirmed' | 'pending' | 'exited';
  joinedAt: Date;
  isInitiator: boolean;
}

export interface BoxGroup {
  id: string;
  seriesId: string;
  series: Series;
  city: string;
  district: string;
  storeName: string;
  storeAddress: string;
  meetTime: Date;
  status: BoxStatus;
  totalSlots: number;
  filledSlots: number;
  members: BoxMember[];
  rule: DistributionRule;
  pickupMethod: PickupMethod;
  createdAt: Date;
  countdownMinutes: number;
  initiatorId: string;
  description: string;
  distance?: string;
}

export interface BoxPiece {
  id: string;
  name: string;
  image: string;
  isHidden: boolean;
  rarity: 'common' | 'rare' | 'hidden';
}

export interface PieceDistribution {
  pieceId: string;
  userId: string;
  userName: string;
}

export interface BoxResult {
  boxGroupId: string;
  pieces: BoxPiece[];
  distribution: PieceDistribution[];
  totalCost: number;
  perPersonCost: number;
  completedAt: Date;
}

export interface ChatMessage {
  id: string;
  boxGroupId: string;
  userId: string;
  user: User;
  content: string;
  type: 'text' | 'system' | 'action';
  timestamp: Date;
}

export interface City {
  id: string;
  name: string;
  districts: District[];
}

export interface District {
  id: string;
  name: string;
  popularity: number;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  district: string;
  city: string;
}
