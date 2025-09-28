import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const localityId = Array.isArray(id) ? id[0] : id;

  if (!localityId) {
    return res.status(400).json({ error: 'Locality id is required' });
  }

  try {
    const mod = await import('../../../../src/services/LocalityService');
    const list = await mod.default.getLocalities?.() ?? (await mod.getLocalities());
    const item = list.find(l => l.id === localityId);
    if (!item) return res.status(404).json({ error: 'Locality not found' });
    res.status(200).json(item);
  } catch (e) {
    console.error('API /api/localities/[id] error', e);
    res.status(500).json({ error: 'Failed to load locality' });
  }
}
