import type { NextApiRequest, NextApiResponse } from 'next';
import {
    bookService,
    getServiceById
} from '../../../../src/services/ServiceDirectoryService';

interface BookingResponse {
  ok: boolean;
  message: string;
  booking?: unknown;
  errors?: string[];
}

function parseId(queryId: string | string[] | undefined): number | null {
  if (typeof queryId !== 'string') return null;
  const id = Number.parseInt(queryId, 10);
  return Number.isFinite(id) ? id : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BookingResponse>
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

  const { name, phone, time } = req.body ?? {};
  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ ok: false, message: 'Name is required.' });
  }
  if (typeof phone !== 'string' || !/^\d{7,15}$/.test(phone.trim())) {
    return res.status(400).json({ ok: false, message: 'Valid phone number is required.' });
  }

  try {
    const booking = await bookService(id, {
      name: name.trim(),
      phone: phone.trim(),
      time: typeof time === 'string' && time.trim().length > 0 ? time.trim() : undefined
    });

    return res.status(200).json({
      ok: true,
      message: `Booking confirmed with ${service.name}`,
      booking
    });
  } catch (error) {
    console.error('[services-api] booking failed', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to book service.',
      errors: [error instanceof Error ? error.message : 'Unknown error']
    });
  }
}
