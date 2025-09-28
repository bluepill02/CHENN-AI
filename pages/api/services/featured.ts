import type { NextApiRequest, NextApiResponse } from 'next';
import {
    DEFAULT_SERVICES,
    getFeaturedServices,
    type ServiceItem
} from '../../../src/services/ServiceDirectoryService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ServiceItem[] | { error: string }>
) {
  res.setHeader('Cache-Control', 'public, max-age=120');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    const list = await getFeaturedServices();
    return res.status(200).json(list);
  } catch (error) {
    console.error('[services-api] featured fallback', error);
    const fallback = DEFAULT_SERVICES.slice(0, 6);
    return res.status(200).json(fallback);
  }
}
