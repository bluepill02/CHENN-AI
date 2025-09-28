import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const mod = await import('../../../src/services/LocalityService');
    const list = await mod.default.getLocalities?.() ?? (await mod.getLocalities());
    res.status(200).json(list);
  } catch (e) {
    console.error('API /api/localities error', e);
    res.status(500).json({ error: 'Failed to load localities' });
  }
}
