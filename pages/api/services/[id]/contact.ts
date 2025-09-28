import type { NextApiRequest, NextApiResponse } from 'next';
import {
    contactService,
    getServiceById
} from '../../../../src/services/ServiceDirectoryService';

interface ContactResponse {
  ok: boolean;
  message: string;
  errors?: string[];
}

function parseId(queryId: string | string[] | undefined): number | null {
  if (typeof queryId !== 'string') return null;
  const id = Number.parseInt(queryId, 10);
  return Number.isFinite(id) ? id : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContactResponse>
) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, message: 'Method not allowed. Use POST.' });
  }

  const id = parseId(req.query.id);
  if (!id) {
    return res.status(400).json({ ok: false, message: 'Invalid service id.' });
  }

  const service = await getServiceById(id);
  if (!service) {
    return res.status(404).json({ ok: false, message: 'Service not found.' });
  }

  try {
    const response = await contactService(id);
    return res.status(200).json({
      ok: response.ok,
      message: response.message
    });
  } catch (error) {
    console.error('[services-api] contact failed', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to contact service.',
      errors: [error instanceof Error ? error.message : 'Unknown error']
    });
  }
}
