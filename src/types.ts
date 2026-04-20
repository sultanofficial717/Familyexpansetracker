export type UserRole = 'admin' | 'member';

export interface Family {
  id: string;
  adminUid: string;
  familyName: string;
  monthlyIncome: number;
  createdAt: any;
}

export interface FamilyMember {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  monthlyPocketMoney: number;
  avatarUrl?: string;
  createdAt: any;
}

export interface Expense {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  category: string;
  customCategory?: string;
  description?: string;
  date: any;
  receiptImageUrl?: string;
  receiptData?: {
    itemName?: string;
    price?: number;
    date?: string;
  };
  month: string; // YYYY-MM
  createdAt: any;
}

export interface Budget {
  id: string;
  month: string;
  totalIncome: number;
  totalBudget: number;
  memberAllocations: Record<string, number>;
}
