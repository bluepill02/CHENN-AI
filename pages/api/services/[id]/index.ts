import type { NextApiRequest, NextApiResponse } from 'next';
import {
    getServiceById,
    type ServiceItem
} from '../../../../src/services/ServiceDirectoryService';

function parseId(queryId: string | string[] | undefined): number | null {
  if (typeof queryId !== 'string') return null;
  const id = Number.parseInt(queryId, 10);
  return Number.isFinite(id) ? id : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ServiceItem | { error: string }>
) {
  res.setHeader('Cache-Control', 'public, max-age=30');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const id = parseId(req.query.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid service id.' });
  }

  try {
    const service = await getServiceById(id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    return res.status(200).json(service);
  } catch (error) {
    console.error('[services-api] get service failed', error);
    return res.status(500).json({ error: 'Failed to load service.' });
  }
}
