import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

if (!globalThis.TextEncoder) {
	globalThis.TextEncoder = TextEncoder as unknown as typeof globalThis.TextEncoder;
}

if (!globalThis.TextDecoder) {
	globalThis.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder;
}

const { ReadableStream, WritableStream, TransformStream } = require('stream/web');

if (!globalThis.ReadableStream) {
	globalThis.ReadableStream = ReadableStream as unknown as typeof globalThis.ReadableStream;
}

if (!globalThis.WritableStream) {
	globalThis.WritableStream = WritableStream as unknown as typeof globalThis.WritableStream;
}

if (!globalThis.TransformStream) {
	globalThis.TransformStream = TransformStream as unknown as typeof globalThis.TransformStream;
}

if (!globalThis.BroadcastChannel) {
	class MockBroadcastChannel {
		name: string;
		onmessage: ((event: MessageEvent) => void) | null = null;
		constructor(name: string) {
			this.name = name;
		}
		postMessage() {
			// no-op for tests
		}
		close() {
			// no-op
		}
		addEventListener() {
			// no-op
		}
		removeEventListener() {
			// no-op
		}
	}
	globalThis.BroadcastChannel = MockBroadcastChannel as unknown as typeof globalThis.BroadcastChannel;
}

const { fetch, Headers, Request, Response } = require('undici') as typeof import('undici');

if (!globalThis.fetch) {
	globalThis.fetch = fetch as unknown as typeof globalThis.fetch;
}

if (!globalThis.Headers) {
	globalThis.Headers = Headers as unknown as typeof globalThis.Headers;
}

if (!globalThis.Request) {
	globalThis.Request = Request as unknown as typeof globalThis.Request;
}

if (!globalThis.Response) {
	globalThis.Response = Response as unknown as typeof globalThis.Response;
}
