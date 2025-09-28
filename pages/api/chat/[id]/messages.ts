import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const conversationId = Array.isArray(id) ? id[0] : id;

  if (!conversationId) {
    return res.status(400).json({ error: 'Conversation id is required' });
  }

  try {
    const mod = await import('../../../../src/services/ChatService');
    if (req.method === 'GET') {
      const msgs = await mod.getMessages(Number(conversationId));
      return res.status(200).json(msgs);
    }
    if (req.method === 'POST') {
      const body = req.body || {};
      const msg = await mod.sendMessage(Number(conversationId), { sender: body.sender ?? 'Me', message: body.message ?? '' });
      return res.status(200).json({ ok: true, message: msg });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('API /api/chat/[id]/messages error', e);
    res.status(500).json({ error: 'Failed to handle messages' });
  }
}
