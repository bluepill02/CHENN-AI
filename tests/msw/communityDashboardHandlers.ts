import { http, HttpResponse } from 'msw';
import type {
    ApiEnvelope,
    DataSource,
    PublicServiceApiPayload,
    TrafficApiPayload,
    WeatherApiPayload,
} from '../../types/externalData';
import {
    buildBusByPincodePayload,
    buildPublicServiceApiPayload,
    buildTimetablePayload,
    buildTrafficApiPayload,
    buildWeatherApiPayload,
    type BusByPincodePayload,
    type TimetablePayload,
} from '../fixtures/communityDashboardFixtures';

const normalizeBaseUrl = (baseUrl?: string) => (baseUrl ?? '').replace(/\/$/, '');

const createEnvelope = <T,>(data: T, source: DataSource = 'live'): ApiEnvelope<T> => ({
  success: true,
  data,
  source,
  timestamp: new Date('2024-05-01T05:00:00Z').toISOString(),
});

const buildWeatherUrl = (baseUrl?: string) => `${normalizeBaseUrl(baseUrl)}/api/weather`;
const buildTrafficUrl = (baseUrl?: string) => `${normalizeBaseUrl(baseUrl)}/api/traffic`;
const buildPublicServicesUrl = (baseUrl?: string) => `${normalizeBaseUrl(baseUrl)}/api/public-services`;
const buildBusUrl = (baseUrl?: string) => `${normalizeBaseUrl(baseUrl)}/api/busByPincode`;
const buildTimetableUrl = (baseUrl?: string) => `${normalizeBaseUrl(baseUrl)}/api/timetable`;

export interface CommunityDashboardHandlerOptions {
  baseUrl?: string;
  source?: DataSource;
  weather?: WeatherApiPayload;
  traffic?: TrafficApiPayload[];
  publicServices?: PublicServiceApiPayload[];
  bus?: BusByPincodePayload;
  timetable?: TimetablePayload;
  onWeatherRequest?: (url: URL) => void;
  onTrafficRequest?: (url: URL) => void;
  onServicesRequest?: (url: URL) => void;
  onBusRequest?: (url: URL) => void;
  onTimetableRequest?: (url: URL) => void;
}

export interface CommunityDashboardErrorOptions extends Omit<CommunityDashboardHandlerOptions, 'source'> {
  status?: number;
  message?: string;
  code?: string;
}

const successResponse = <T,>(data: T, source?: DataSource) =>
  HttpResponse.json(createEnvelope(data, source));

export const communityDashboardSuccessHandlers = ({
  baseUrl,
  source,
  weather = buildWeatherApiPayload(),
  traffic = buildTrafficApiPayload(),
  publicServices = buildPublicServiceApiPayload(),
  bus = buildBusByPincodePayload(),
  timetable = buildTimetablePayload(),
  onWeatherRequest,
  onTrafficRequest,
  onServicesRequest,
  onBusRequest,
  onTimetableRequest,
}: CommunityDashboardHandlerOptions = {}) => [
  http.get(buildWeatherUrl(baseUrl), ({ request }) => {
    const url = new URL(request.url);
    onWeatherRequest?.(url);
    return successResponse(weather, source);
  }),
  http.get(buildTrafficUrl(baseUrl), ({ request }) => {
    const url = new URL(request.url);
    onTrafficRequest?.(url);
    return successResponse(traffic, source);
  }),
  http.get(buildPublicServicesUrl(baseUrl), ({ request }) => {
    const url = new URL(request.url);
    onServicesRequest?.(url);
    return successResponse(publicServices, source);
  }),
  http.get(buildBusUrl(baseUrl), ({ request }) => {
    const url = new URL(request.url);
    onBusRequest?.(url);
    const requestedPincode = url.searchParams.get('pincode');
    const payload = requestedPincode && requestedPincode !== bus.pincode
      ? { ...bus, pincode: requestedPincode }
      : bus;
    return HttpResponse.json(payload);
  }),
  http.get(buildTimetableUrl(baseUrl), ({ request }) => {
    const url = new URL(request.url);
    onTimetableRequest?.(url);
    return HttpResponse.json(timetable);
  }),
];

export const communityDashboardErrorHandlers = ({
  baseUrl,
  status = 503,
  message = 'Community dashboard data unavailable',
  code = 'SERVICE_UNAVAILABLE',
}: CommunityDashboardErrorOptions = {}) => {
  const errorPayload = { success: false, message, code };
  return [
    http.get(buildWeatherUrl(baseUrl), () => HttpResponse.json(errorPayload, { status })),
    http.get(buildTrafficUrl(baseUrl), () => HttpResponse.json(errorPayload, { status })),
    http.get(buildPublicServicesUrl(baseUrl), () => HttpResponse.json(errorPayload, { status })),
    http.get(buildBusUrl(baseUrl), () => HttpResponse.json({ message, code }, { status })),
    http.get(buildTimetableUrl(baseUrl), () => HttpResponse.json({ message, code }, { status })),
  ];
};
