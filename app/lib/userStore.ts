import { promises as fs } from 'fs';
import path from 'path';
import type { User, MembershipPlan, MembershipTier } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');

// 会员计划配置
export const membershipPlans: MembershipPlan[] = [
  {
    id: 'free',
    name: 'Free',
    nameZh: '免费版',
    price: 0,
    period: 'lifetime',
    features: ['Access to basic assessments', 'Simple result summary', 'Limited test history'],
    featuresZh: ['基础量表访问', '简单结果摘要', '有限测试记录'],
    maxTestsPerMonth: 3,
    hasDetailedReports: false,
    hasPremiumAssessments: false,
    hasExportFeature: false,
    hasComparisonFeature: false,
  },
  {
    id: 'basic',
    name: 'Basic',
    nameZh: '基础版',
    price: 19,
    period: 'monthly',
    features: ['All free features', 'Detailed result analysis', 'Unlimited basic tests', 'Result history'],
    featuresZh: ['所有免费功能', '详细结果分析', '无限基础测试', '结果历史记录'],
    maxTestsPerMonth: 'unlimited',
    hasDetailedReports: true,
    hasPremiumAssessments: false,
    hasExportFeature: false,
    hasComparisonFeature: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    nameZh: '高级版',
    price: 49,
    period: 'monthly',
    features: ['All basic features', 'Premium assessments', 'PDF export', 'Priority support'],
    featuresZh: ['所有基础功能', '专业量表', 'PDF导出', '优先支持'],
    maxTestsPerMonth: 'unlimited',
    hasDetailedReports: true,
    hasPremiumAssessments: true,
    hasExportFeature: true,
    hasComparisonFeature: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    nameZh: '专业版',
    price: 99,
    period: 'monthly',
    features: ['All premium features', 'API access', 'Team management', 'Custom branding'],
    featuresZh: ['所有高级功能', 'API访问', '团队管理', '自定义品牌'],
    maxTestsPerMonth: 'unlimited',
    hasDetailedReports: true,
    hasPremiumAssessments: true,
    hasExportFeature: true,
    hasComparisonFeature: true,
  },
];

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  return DATA_DIR;
}

export async function readUsers(): Promise<User[]> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'users.json');
  
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as User[];
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.writeFile(filePath, JSON.stringify([], null, 2));
      return [];
    }
    throw error;
  }
}

export async function writeUsers(users: User[]): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'users.json');
  await fs.writeFile(filePath, JSON.stringify(users, null, 2));
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await readUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const users = await readUsers();
  return users.find(u => u.id === id) || null;
}

export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLoginAt' | 'testHistory' | 'favoriteAssessments'>): Promise<User> {
  const users = await readUsers();
  
  const newUser: User = {
    ...userData,
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    testHistory: [],
    favoriteAssessments: [],
  };
  
  users.push(newUser);
  await writeUsers(users);
  
  return newUser;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const users = await readUsers();
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) return null;
  
  users[index] = { ...users[index], ...updates };
  await writeUsers(users);
  
  return users[index];
}

export async function addTestToHistory(userId: string, submissionId: string): Promise<void> {
  const users = await readUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index !== -1) {
    if (!users[index].testHistory.includes(submissionId)) {
      users[index].testHistory.push(submissionId);
      await writeUsers(users);
    }
  }
}

export function getMembershipPlan(tier: MembershipTier): MembershipPlan {
  return membershipPlans.find(p => p.id === tier) || membershipPlans[0];
}

export function canAccessAssessment(user: User | null, isPremium: boolean): boolean {
  if (!isPremium) return true;
  if (!user) return false;
  
  const plan = getMembershipPlan(user.membershipTier);
  return plan.hasPremiumAssessments;
}

export function canViewDetailedReport(user: User | null): boolean {
  if (!user) return false;
  
  const plan = getMembershipPlan(user.membershipTier);
  return plan.hasDetailedReports;
}
