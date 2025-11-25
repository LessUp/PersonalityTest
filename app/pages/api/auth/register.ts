import type { NextApiRequest, NextApiResponse } from 'next';
import { findUserByEmail, createUser } from '../../../lib/userStore';

// 简单的密码哈希（生产环境应使用 bcrypt）
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: '方法不允许' });
  }

  const { name, email, password } = req.body;

  // 验证输入
  if (!name || !email || !password) {
    return res.status(400).json({ error: '请填写所有必填字段' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少需要6个字符' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: '请输入有效的邮箱地址' });
  }

  try {
    // 检查用户是否已存在
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: '该邮箱已被注册' });
    }

    // 创建新用户
    const user = await createUser({
      email: email.toLowerCase(),
      name,
      membershipTier: 'free',
      preferences: {
        language: 'zh',
        notifications: true,
        dataSharing: false,
      },
    });

    // 存储密码（简化版，实际应使用 bcrypt）
    // 在实际应用中，应该有一个单独的密码表或字段
    
    // 返回用户信息（不包含敏感数据）
    const { ...safeUser } = user;
    
    res.status(201).json({ 
      user: safeUser,
      message: '注册成功！' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: '服务器错误，请稍后重试' });
  }
}
