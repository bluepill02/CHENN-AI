import type { Page, Route } from '@playwright/test';
import type { ServiceItem } from '../../src/services/ServiceDirectoryService';
import { buildServiceApiPayload } from '../fixtures/serviceDirectoryFixtures';

export interface ServiceDirectoryMockOptions {
  services?: ServiceItem[];
  listStatus?: number;
  listDelayMs?: number;
  contact?: {
    status?: number;
    ok?: boolean;
    message?: string;
    delayMs?: number;
  };
  booking?: {
    status?: number;
    ok?: boolean;
    message?: string;
    delayMs?: number;
  };
}

function defaultServices(): ServiceItem[] {
  return [
    buildServiceApiPayload({
      id: 901,
      name: 'Anna Nagar Electricians',
      category: 'Home Repairs',
      location: 'Anna Nagar',
      distance: '0.8 km',
      rating: 4.7,
      speciality: 'Emergency electrical fixes within 30 minutes',
    }),
    buildServiceApiPayload({
      id: 902,
      name: 'T Nagar Home Chefs',
      category: 'Food & Beverages',
      location: 'T Nagar',
      distance: '1.2 km',
      rating: 4.9,
      speciality: 'Traditional Chettinad lunch delivered fresh',
      language: 'Tamil + English',
    }),
  ];
}

async function fulfillWithDelay(route: Route, body: unknown, status = 200, delayMs = 0) {
  if (delayMs && delayMs > 0) {
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

function extractServiceId(route: Route): number | null {
  try {
    const url = new URL(route.request().url());
    const segments = url.pathname.split('/').filter(Boolean);
    const idSegment = segments[segments.length - 2];
    const id = Number.parseInt(idSegment ?? '', 10);
    return Number.isFinite(id) ? id : null;
  } catch (error) {
    console.warn('Failed to parse service id from route', error);
    return null;
  }
}

export async function setupServiceDirectoryMocks(
  page: Page,
  options: ServiceDirectoryMockOptions = {}
): Promise<ServiceItem[]> {
  const services = options.services ?? defaultServices();
  const listStatus = options.listStatus ?? 200;

  await page.route('**/api/services/all*', async route => {
    if (listStatus >= 400) {
      await fulfillWithDelay(route, { error: 'Service directory unavailable' }, listStatus, options.listDelayMs);
      return;
    }

    await fulfillWithDelay(route, services, listStatus, options.listDelayMs);
  });

  await page.route('**/api/services/*/contact', async route => {
    const { status = 200, ok, message = 'Team will call you shortly', delayMs = 0 } = options.contact ?? {};
    const resolvedOk = ok ?? status < 400;
    const id = extractServiceId(route);

    await fulfillWithDelay(
      route,
      {
        ok: resolvedOk,
        message,
        serviceId: id,
      },
      status,
      delayMs
    );
  });

  await page.route('**/api/services/*/book', async route => {
    const { status = 200, ok, message = 'Booking confirmed', delayMs = 0 } = options.booking ?? {};
    const resolvedOk = ok ?? status < 400;
    const id = extractServiceId(route);

    let booking: Record<string, unknown> | undefined;
    try {
      const payload = await route.request().postDataJSON();
      booking = {
        id,
        ...payload,
        reference: `BOOK-${Date.now()}`,
      };
    } catch (error) {
      booking = undefined;
    }

    await fulfillWithDelay(
      route,
      {
        ok: resolvedOk,
        message,
        booking,
      },
      status,
      delayMs
    );
  });

  return services;
}

export async function resetServiceDirectoryMocks(page: Page) {
  await page.unroute('**/api/services/all*');
  await page.unroute('**/api/services/*/contact');
  await page.unroute('**/api/services/*/book');
}
