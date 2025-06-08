export type User = {
  id: number;
  telegramId: string;
  username: string;
  firstName: string;
  lastName?: string;
  email?: string;
  profilePhoto?: string;
  isAdmin?: boolean;
  createdAt: Date;
};

export type Sponsorship = {
  id: number;
  title: string;
  description: string;
  bannerImage?: string;
  budgetMin: number;
  budgetMax: number;
  minFollowers: number;
  category: string;
  deadline: Date;
  isActive?: boolean;
  createdAt: Date;
};

export type Platform = {
  id: number;
  userId: number;
  platformType: string;
  username: string;
  followerCount: number;
  verificationCode: string;
  isVerified?: boolean;
  createdAt: Date;
};

export type Application = {
  id: number;
  userId: number;
  sponsorshipId: number;
  platformType: string;
  platformUsername: string;
  followerCount: number;
  category: string;
  message?: string;
  status: string;
  createdAt: Date;
};

export type PaymentMethod = {
  id: number;
  userId: number;
  type: string;
  accountNumber?: string;
  ifscCode?: string;
  upiNumber?: string;
  upiId?: string;
  isActive?: boolean;
  createdAt: Date;
};
