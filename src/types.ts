export type UserRole = 'student' | 'parent' | 'merchant' | 'admin';

export interface CampusUser {
  uid: string;
  name: string;
  displayName?: string;
  email: string;
  wallet: number;
  balance: number;
  role: UserRole;
  createdAt: number;
  studentId?: string;
  merchantName?: string;
  parentEmail?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  type: 'debit' | 'credit';
  category: 'canteen' | 'stationery' | 'printing' | 'tuition' | 'topup';
  description: string;
  timestamp: number;
  status: 'success' | 'pending' | 'failed';
  merchantId?: string;
}

export interface AITip {
  id: string;
  title: string;
  content: string;
  category: 'budget' | 'saving' | 'canteen' | 'general';
  timestamp: number;
}
