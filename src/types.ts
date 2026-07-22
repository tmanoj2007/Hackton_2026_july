export type UserRole = "student" | "merchant" | "admin" | "parent" | string;

export interface CampusUser {
  uid: string;
  name: string;
  email: string;
  wallet: number;
  role: UserRole;
  displayName?: string;
  balance?: number;
  studentId?: string; // For students
  merchantName?: string; // For merchants
  parentPhone?: string; // For parents
  createdAt?: number;
  latestAiTip?: string;
  latestAiTipMerchant?: string;
  latestNotification?: {
    title: string;
    message: string;
    amount: number;
    timestamp: number;
  };
}

export type TransactionType = "peer_transfer" | "merchant_payment" | "add_money" | "admin_grant" | "parent_recharge" | "debit" | "credit" | string;

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  merchant: string;
  type: TransactionType;
  date: any; // timestamp or string or number
  senderId?: string;
  senderName?: string;
  receiverId?: string;
  receiverName?: string;
  category?: string;
  description?: string;
  timestamp?: number; // UTC timestamp
}

export interface SpendingTip {
  title: string;
  tip: string;
  category: string;
  impact: "low" | "medium" | "high";
}

export interface CampusMerchant {
  id: string;
  name: string;
  category: string;
  location: string;
  isActive: boolean;
}

export type NotificationType = "payment_success" | "money_added" | "low_balance" | "parent_recharge" | string;

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  amount?: number;
  read: boolean;
  timestamp: number;
}
