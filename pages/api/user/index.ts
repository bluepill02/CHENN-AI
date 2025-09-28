import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const mod = await import('../../../src/services/UserService');
    if (req.method === 'GET') {
      const user = await mod.getUser();
      return res.status(200).json(user);
    }
    if (req.method === 'POST') {
      const body = req.body || {};
      const updated = await mod.updateUser(body);
      return res.status(200).json({ ok: true, user: updated });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('API /api/user error', e);
    res.status(500).json({ error: 'Failed to handle user' });
  }
}
