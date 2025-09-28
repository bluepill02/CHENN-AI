import { http, HttpResponse } from 'msw';
import type { ServiceItem } from '../../src/services/ServiceDirectoryService';
import { buildServiceApiPayload } from '../fixtures/serviceDirectoryFixtures';

export interface ServiceDirectoryHandlerOptions {
  services?: ServiceItem[];
  onListRequest?: (url: URL) => void;
  onContactRequest?: (url: URL) => void;
  onBookingRequest?: (url: URL, body: Record<string, unknown>) => void;
}

export interface ServiceDirectoryErrorOptions extends ServiceDirectoryHandlerOptions {
  status?: number;
  message?: string;
}

const LIST_ENDPOINT = '*/api/services/all';
const CONTACT_ENDPOINT = '*/api/services/:id/contact';
const BOOK_ENDPOINT = '*/api/services/:id/book';

export const serviceDirectorySuccessHandlers = ({
  services = [buildServiceApiPayload()],
  onListRequest,
  onContactRequest,
  onBookingRequest,
}: ServiceDirectoryHandlerOptions = {}) => [
  http.get(LIST_ENDPOINT, ({ request }) => {
    const url = new URL(request.url);
    onListRequest?.(url);
    return HttpResponse.json(services);
  }),
  http.post(CONTACT_ENDPOINT, ({ request, params }) => {
    const url = new URL(request.url);
    onContactRequest?.(url);
    const id = params.id ?? 'unknown';
    return HttpResponse.json({ ok: true, message: `Dialing service ${id} now` });
  }),
  http.post(BOOK_ENDPOINT, async ({ request, params }) => {
    const url = new URL(request.url);
    const body = (await request.json()) as Record<string, unknown>;
    onBookingRequest?.(url, body);
    const id = params.id ?? 'unknown';
    return HttpResponse.json({
      ok: true,
      message: 'Booking confirmed',
      booking: {
        id: `${id}-booking`,
        serviceId: Number(id),
        ...body,
      },
    });
  }),
];

export const serviceDirectoryErrorHandlers = ({
  status = 503,
  message = 'Service directory unavailable',
  services,
  onListRequest,
  onContactRequest,
  onBookingRequest,
}: ServiceDirectoryErrorOptions = {}) => [
  http.get(LIST_ENDPOINT, ({ request }) => {
    const url = new URL(request.url);
    onListRequest?.(url);
    return HttpResponse.json({ message }, { status });
  }),
  ...serviceDirectorySuccessHandlers({ services, onContactRequest, onBookingRequest }).slice(1),
];
