import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const localityId = Array.isArray(id) ? id[0] : id;

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!localityId) return res.status(400).json({ error: 'Locality id is required' });
  try {
    const body = req.body || {};
    const rating = typeof body.rating === 'number' ? body.rating : Number(body.rating);
    if (Number.isNaN(rating)) {
      return res.status(400).json({ error: 'Rating must be a number' });
    }
    const mod = await import('../../../../src/services/LocalityService');
    const updated = await mod.default.rateLocality?.(localityId, rating) ?? (await mod.rateLocality(localityId, rating));
    if (!updated) return res.status(404).json({ error: 'Locality not found' });
    res.status(200).json(updated);
  } catch (e) {
    console.error('API /api/localities/[id]/rate error', e);
    res.status(500).json({ error: 'Failed to rate locality' });
  }
}
