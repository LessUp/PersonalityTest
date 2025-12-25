import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User, MembershipTier } from '../lib/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  canAccessPremium: boolean;
  canViewDetailedReports: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 从 localStorage 恢复用户状态
  useEffect(() => {
    let isCancelled = false;

    const timer = setTimeout(() => {
      if (isCancelled) {
        return;
      }

      const storedUser = localStorage.getItem('currentUser');

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser) as User);
        } catch {
          localStorage.removeItem('currentUser');
        }
      }

      setIsLoading(false);
    }, 0);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // 登录
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        setUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return { success: true };
      }

      return { success: false, error: data.error || '登录失败' };
    } catch {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }, []);

  // 注册
  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        setUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return { success: true };
      }

      return { success: false, error: data.error || '注册失败' };
    } catch {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }, []);

  // 登出
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('currentUser');
  }, []);

  // 更新用户信息
  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
      }
    } catch {
      console.error('Failed to update user');
    }
  }, [user]);

  // 计算权限
  const canAccessPremium = user?.membershipTier === 'premium' || user?.membershipTier === 'professional';
  const canViewDetailedReports = user?.membershipTier !== 'free';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        canAccessPremium,
        canViewDetailedReports,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
