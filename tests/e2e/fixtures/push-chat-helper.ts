import type { Page } from '@playwright/test';

export interface PushChatMessagePayload {
  threadId: string | number;
  message: string;
  authorId: string;
  pincode?: string;
  channel?: string;
  metadata?: Record<string, unknown>;
}

export interface PushChatResult {
  ok: boolean;
  via: 'dev-endpoint' | 'client-hook' | 'custom-event';
  status?: number;
  detail?: string;
}

const DEFAULT_BASE_URL = 'http://localhost:3000';

function resolveBaseURL(): string {
  return process.env.PLAYWRIGHT_BASE_URL ?? DEFAULT_BASE_URL;
}

function buildDevEndpoint(baseURL: string): string {
  const url = new URL('/test/push-chat-message', baseURL);
  return url.toString();
}

export async function pushChatMessage(page: Page, payload: PushChatMessagePayload): Promise<PushChatResult> {
  const baseURL = resolveBaseURL();
  const endpoint = buildDevEndpoint(baseURL);

  try {
    const response = await page.request.post(endpoint, {
      data: payload,
      timeout: 7_500,
      failOnStatusCode: false,
    });

    if (response.ok()) {
      return {
        ok: true,
        via: 'dev-endpoint',
        status: response.status(),
      };
    }

    if (response.status() !== 404) {
      return {
        ok: false,
        via: 'dev-endpoint',
        status: response.status(),
        detail: await safeResponseText(response),
      };
    }
  } catch (error) {
    if (process.env.LIVE_CHAT === 'true') {
      return {
        ok: false,
        via: 'dev-endpoint',
        detail: `Dev push endpoint failed: ${String(error)}`,
      };
    }
  }

  const clientHookResult = await page.evaluate(async incoming => {
    const globalScope = window as unknown as {
      __CHAT_TEST__?: {
        emitIncomingMessage?: (payload: PushChatMessagePayload) => Promise<boolean> | boolean;
      };
    };

    const hook = globalScope.__CHAT_TEST__?.emitIncomingMessage;
    if (typeof hook === 'function') {
      const result = await hook(incoming);
      return { handled: Boolean(result), via: 'client-hook' as const };
    }

    const detail = { ...incoming };
    window.dispatchEvent(new CustomEvent('chat:test-message', { detail }));
    return { handled: false, via: 'custom-event' as const };
  }, payload);

  return {
    ok: clientHookResult.handled,
    via: clientHookResult.via,
    detail:
      clientHookResult.handled
        ? 'Delivered via injected client hook'
        : 'Dispatched fallback CustomEvent("chat:test-message")',
  };
}

async function safeResponseText(response: Awaited<ReturnType<Page['request']['post']>>): Promise<string> {
  try {
    return await response.text();
  } catch (error) {
    return `Failed to read response body: ${String(error)}`;
  }
}
