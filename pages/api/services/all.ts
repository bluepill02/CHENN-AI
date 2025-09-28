import type { NextApiRequest, NextApiResponse } from 'next';
import {
    DEFAULT_SERVICES,
    getAllServices,
    type ServiceItem
} from '../../../src/services/ServiceDirectoryService';

function filterServices(services: ServiceItem[], req: NextApiRequest): ServiceItem[] {
  const { category, query, open, minRating } = req.query;
  let result = services.slice();

  if (typeof category === 'string' && category !== 'all') {
    result = result.filter(item => item.category.toLowerCase() === category.toLowerCase());
  }

  if (typeof query === 'string' && query.trim().length > 0) {
    const needle = query.trim().toLowerCase();
    result = result.filter(item => {
      const haystack = [
        item.name,
        item.category,
        item.location,
        item.speciality,
        item.language
      ]
        .filter((value): value is string => Boolean(value))
        .map(value => value.toLowerCase());
      return haystack.some(text => text.includes(needle));
    });
  }

  if (typeof open === 'string') {
    const desired = open === 'true';
    result = result.filter(item => item.isOpen === desired);
  }

  if (typeof minRating === 'string') {
    const ratingThreshold = Number.parseFloat(minRating);
    if (!Number.isNaN(ratingThreshold)) {
      result = result.filter(item => item.rating >= ratingThreshold);
    }
  }

  return result;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ServiceItem[] | { error: string }>
) {
  res.setHeader('Cache-Control', 'public, max-age=60');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    const services = await getAllServices();
    const filtered = filterServices(services, req);
    return res.status(200).json(filtered);
  } catch (error) {
    console.warn('[services-api] Using fallback service directory:', error);
    const filtered = filterServices(DEFAULT_SERVICES, req);
    return res.status(200).json(filtered);
  }
}
