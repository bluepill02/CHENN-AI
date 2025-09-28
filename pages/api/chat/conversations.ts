import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const mod = await import('../../../src/services/ChatService');
    const list = await mod.getConversations();
    res.status(200).json(list);
  } catch (e) {
    console.error('API /api/chat/conversations error', e);
    res.status(500).json({ error: 'Failed to load conversations' });
  }
}
