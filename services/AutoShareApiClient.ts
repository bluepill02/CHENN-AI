import type {
    AutoShareBookingPayload,
    AutoShareCreateRidePayload,
    AutoShareRidePayload,
    AutoShareSeatRequestPayload,
    BookSeatsInput,
    CreateRideInput,
    Ride,
    SeatBooking,
    UpdateRideStatusInput,
} from '../utils/autoShareInterfaces';
import {
    AUTOSHARE_API_BASE_URL,
    AUTOSHARE_API_KEY,
    type AutoShareApiErrorShape,
} from './autoShareConfig';

export class AutoShareApiClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(baseUrl: string = AUTOSHARE_API_BASE_URL, apiKey: string = AUTOSHARE_API_KEY) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey || undefined;
  }

  get isEnabled(): boolean {
    return Boolean(this.baseUrl);
  }

  private buildHeaders(extra?: Record<string, string>): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey;
    }

    return {
      ...headers,
      ...extra,
    };
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!this.isEnabled) {
      throw new Error('AutoShare API client is not enabled. Provide VITE_AUTOSHARE_API_BASE_URL.');
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: this.buildHeaders(init?.headers as Record<string, string> | undefined),
    });

    if (!response.ok) {
      let errorBody: AutoShareApiErrorShape | undefined;
      try {
        errorBody = await response.json();
      } catch (error) {
        // no-op: response might not contain json
      }

      const message = errorBody?.message || `AutoShare API request failed with status ${response.status}`;
      const error = new Error(message);
      (error as Error & AutoShareApiErrorShape).code = errorBody?.code;
      (error as Error & AutoShareApiErrorShape).status = response.status;
      throw error;
    }

    if (response.status === 204) {
      return undefined as unknown as T;
    }

    return (await response.json()) as T;
  }

  async fetchRides(): Promise<Ride[]> {
    const data = await this.request<AutoShareRidePayload[]>('/auto-share/rides');
    return data.map(deserializeRide);
  }

  async fetchRide(rideId: string): Promise<Ride> {
    const payload = await this.request<AutoShareRidePayload>(`/auto-share/rides/${rideId}`);
    return deserializeRide(payload);
  }

  async createRide(input: CreateRideInput): Promise<Ride> {
    const payload = serializeCreateRide(input);
    const created = await this.request<AutoShareRidePayload>('/auto-share/rides', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return deserializeRide(created);
  }

  async updateRideStatus(rideId: string, input: UpdateRideStatusInput): Promise<Ride> {
    const payload = { status: input.status };
    const updated = await this.request<AutoShareRidePayload>(`/auto-share/rides/${rideId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return deserializeRide(updated);
  }

  async bookSeats({ rideId, passenger, seats, note }: BookSeatsInput): Promise<Ride> {
    const payload: AutoShareSeatRequestPayload = {
      passenger_id: passenger.id,
      seats,
      note,
    };

    const updated = await this.request<AutoShareRidePayload>(`/auto-share/rides/${rideId}/bookings`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return deserializeRide(updated);
  }
}

function toBilingual(english: string, tamil?: string) {
  return tamil ? `${english} / ${tamil}` : english;
}

function deserializeRide(payload: AutoShareRidePayload): Ride {
  return {
    id: payload.id,
    pickup: toBilingual(payload.pickup, payload.pickup_ta),
    drop: toBilingual(payload.drop, payload.drop_ta),
    time: payload.time,
    fare: payload.fare,
    seatsTotal: payload.seats_total,
    seatsAvailable: payload.seats_available,
    creator: {
      id: payload.creator.id,
      name: payload.creator.name_ta
        ? `${payload.creator.name} / ${payload.creator.name_ta}`
        : payload.creator.name,
      avatarUrl: payload.creator.avatar_url,
      phoneNumber: payload.creator.phone_number,
      rating: payload.creator.rating,
      ridesCompleted: payload.creator.rides_completed,
      isVerified: payload.creator.verified,
    },
    status: payload.status,
    vehicleType: payload.vehicle_type,
    notes: payload.notes,
    route: payload.route,
    createdAt: payload.created_at,
    seatBookings: payload.bookings?.map(deserializeBooking),
  };
}

function deserializeBooking(payload: AutoShareBookingPayload, index: number): SeatBooking {
  return {
    seatNumber: payload.seats ? index + 1 : index + 1,
    passenger: {
      id: payload.passenger.id,
      name: payload.passenger.name_ta
        ? `${payload.passenger.name} / ${payload.passenger.name_ta}`
        : payload.passenger.name,
    },
    status: payload.status,
    bookedAt: payload.booked_at,
  };
}

function extractBilingualParts(location: CreateRideInput['pickup']): { english: string; tamil?: string } {
  if (typeof location === 'string') {
    const [english, tamil] = location.split('/').map(part => part.trim());
    return {
      english,
      tamil: tamil || undefined,
    };
  }

  return {
    english: location.english,
    tamil: location.tamil,
  };
}

function serializeCreateRide(input: CreateRideInput): AutoShareCreateRidePayload {
  const pickup = extractBilingualParts(input.pickup);
  const drop = extractBilingualParts(input.drop);

  return {
    pickup: pickup.english,
    pickup_ta: pickup.tamil,
    drop: drop.english,
    drop_ta: drop.tamil,
    time: input.time,
    fare: input.fare,
    seats_total: input.seatsTotal,
    vehicle_type: input.vehicleType,
    route: input.route,
    notes: input.notes,
    creator_id: input.creator.id,
    metadata: {
      creator: input.creator,
    },
  };
}
