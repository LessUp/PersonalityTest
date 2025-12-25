import type { NextApiRequest, NextApiResponse } from 'next';
import { findUserById, updateUser } from '../../../lib/userStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: '无效的用户ID' });
  }

  if (req.method === 'GET') {
    try {
      const user = await findUserById(id);
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }
      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({ error: '服务器错误' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const updates = req.body;
      const user = await updateUser(id, updates);
      
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }
      
      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({ error: '服务器错误' });
    }
  }

  res.setHeader('Allow', 'GET,PATCH');
  res.status(405).json({ error: '方法不允许' });
}
