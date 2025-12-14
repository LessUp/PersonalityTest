import type { NextApiRequest, NextApiResponse } from 'next';
import { findUserByEmail, updateUser } from '../../../lib/userStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: '方法不允许' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: '请输入邮箱和密码' });
  }

  try {
    const user = await findUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 简化版验证（实际应使用 bcrypt 比较）
    // 在这个演示版本中，我们只检查用户是否存在
    
    // 更新最后登录时间
    const updatedUser = await updateUser(user.id, {
      lastLoginAt: new Date().toISOString(),
    });

    res.status(200).json({ 
      user: updatedUser,
      message: '登录成功！' 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '服务器错误，请稍后重试' });
  }
}
