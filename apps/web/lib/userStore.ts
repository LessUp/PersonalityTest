import type { User, MembershipTier } from './types';
import { membershipPlans, getMembershipPlan, canAccessAssessment, canViewDetailedReport } from './membershipPlans';
import { randomUUID } from 'crypto';

import { getSupabaseAdminClient } from './supabaseServer';

// Re-export for backward compatibility
export { membershipPlans, getMembershipPlan, canAccessAssessment, canViewDetailedReport };

type ProfileRow = {
  id: string;
  email: string;
  data: User;
  updated_at: string;
};

export async function readUsers(): Promise<User[]> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase.from('profiles').select('id,email,data,updated_at').order('email');

  if (error) {
    throw error;
  }

  return ((data ?? []) as ProfileRow[]).map((row) => row.data);
}

export async function writeUsers(users: User[]): Promise<void> {
  const supabase = getSupabaseAdminClient();

  const rows = users.map((user) => ({
    id: user.id,
    email: user.email.toLowerCase(),
    data: { ...user, email: user.email.toLowerCase() },
  }));

  const { error } = await supabase.from('profiles').upsert(rows, { onConflict: 'id' });

  if (error) {
    throw error;
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const supabase = getSupabaseAdminClient();
  const normalized = email.toLowerCase();

  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,data,updated_at')
    .eq('email', normalized)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return (data as ProfileRow).data;
}

export async function findUserById(id: string): Promise<User | null> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,data,updated_at')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return (data as ProfileRow).data;
}

export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLoginAt' | 'testHistory' | 'favoriteAssessments'>): Promise<User> {
  const newUser: User = {
    ...userData,
    id: randomUUID(),
    email: userData.email.toLowerCase(),
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    testHistory: [],
    favoriteAssessments: [],
  };

  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from('profiles').insert({
    id: newUser.id,
    email: newUser.email,
    data: newUser,
  });

  if (error) {
    throw error;
  }

  return newUser;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const existing = await findUserById(id);

  if (!existing) {
    return null;
  }

  const next: User = {
    ...existing,
    ...updates,
  };

  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from('profiles').update({
    email: next.email.toLowerCase(),
    data: { ...next, email: next.email.toLowerCase() },
  }).eq('id', id);

  if (error) {
    throw error;
  }

  return next;
}

export async function addTestToHistory(userId: string, submissionId: string): Promise<void> {
  const existing = await findUserById(userId);

  if (!existing) {
    return;
  }

  if (existing.testHistory.includes(submissionId)) {
    return;
  }

  await updateUser(userId, {
    testHistory: [...existing.testHistory, submissionId],
  });
}

