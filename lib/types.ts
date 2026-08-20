export type UserRole = 'VIEWER' | 'ANALYST' | 'ADMIN';

export type User = {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export type LoginResponse = {
  accessToken: string;
  user: User;
};

export type Paginated<T> = {
  data: T[];
  meta: {
    total: number;
    skip: number;
    take: number;
  };
};

/*
 * Mirrors the backend ranking: a higher role satisfies any lower one.
 */
const RANK: Record<UserRole, number> = {
  VIEWER: 0,
  ANALYST: 1,
  ADMIN: 2,
};

export function hasRole(user: User | null, minimum: UserRole): boolean {
  return user ? RANK[user.role] >= RANK[minimum] : false;
}
