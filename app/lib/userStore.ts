import { promises as fs } from 'fs';
import path from 'path';
import type { User, MembershipTier } from './types';
import { membershipPlans, getMembershipPlan, canAccessAssessment, canViewDetailedReport } from './membershipPlans';

// Re-export for backward compatibility
export { membershipPlans, getMembershipPlan, canAccessAssessment, canViewDetailedReport };

const DATA_DIR = path.join(process.cwd(), 'data');

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

