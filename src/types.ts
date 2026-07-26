export type UserRole = "student" | "parent" | "merchant" | "admin";

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
}
