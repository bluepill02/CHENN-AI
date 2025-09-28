import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import type {
    CreateRideInput,
    Ride,
    RideStatus,
    User,
    VehicleType,
} from '../utils/autoShareInterfaces';
import { mockRides, mockUsers } from '../utils/mockRidesChennai';
import { AutoShareApiClient } from './AutoShareApiClient';
import {
    AUTOSHARE_CURRENT_USER_ID,
    AUTOSHARE_FEATURE_FLAGS,
    AUTOSHARE_SIMULATION_STORAGE_KEY,
} from './autoShareConfig';

interface AutoShareFormInput {
  pickup: CreateRideInput['pickup'];
  drop: CreateRideInput['drop'];
  time: string;
  fare: number;
  seatsTotal: number;
  vehicleType?: VehicleType;
  route?: string;
  notes?: string;
}

interface AutoShareContextValue {
  rides: Ride[];
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
  isUsingBackend: boolean;
  currentUser: User;
  refresh: () => Promise<void>;
  getRideById: (rideId: string) => Ride | undefined;
  createRide: (input: AutoShareFormInput) => Promise<Ride>;
  cancelRide: (rideId: string) => Promise<Ride | null>;
  bookSeats: (rideId: string, seats: number, note?: string) => Promise<Ride | null>;
  updateRideStatusLocally: (rideId: string, status: RideStatus) => void;
  leaveRide: (rideId: string) => Promise<Ride | null>;
}

const AutoShareContext = createContext<AutoShareContextValue | undefined>(undefined);

interface AutoShareProviderProps {
  children: ReactNode;
}

export function AutoShareProvider({ children }: AutoShareProviderProps) {
  const apiClientRef = useRef(new AutoShareApiClient());
  const backendConfigured = AUTOSHARE_FEATURE_FLAGS.enableBackend && apiClientRef.current.isEnabled;

  const currentUser = useMemo<User>(() => {
    const fallbackUser: User = {
      id: AUTOSHARE_CURRENT_USER_ID,
      name: 'Chennai Rider / சென்னை பயணி',
      isVerified: true,
      rating: 4.7,
      ridesCompleted: 58,
    };

    return (
      mockUsers.find(user => user.id === AUTOSHARE_CURRENT_USER_ID) || fallbackUser
    );
  }, []);

  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isUsingBackend, setIsUsingBackend] = useState<boolean>(backendConfigured);

  const loadSimulationRides = () => {
    if (typeof window === 'undefined') {
      return cloneRides(mockRides);
    }

    const stored = window.localStorage.getItem(AUTOSHARE_SIMULATION_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Ride[];
        return cloneRides(parsed);
      } catch (storageError) {
        console.warn('Failed to parse auto-share simulation storage', storageError);
      }
    }

    return cloneRides(mockRides);
  };

  const persistSimulationRides = (nextRides: Ride[]) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        AUTOSHARE_SIMULATION_STORAGE_KEY,
        JSON.stringify(nextRides)
      );
    } catch (storageError) {
      console.warn('Failed to persist auto-share simulation rides', storageError);
    }
  };

  const activateSimulation = (message?: string) => {
    const seeded = loadSimulationRides();
    setRides(seeded);
    setIsUsingBackend(false);
    setLoading(false);
    setLastSync(new Date());
    setError(message ?? null);
    return seeded;
  };

  const refresh = async () => {
    setLoading(true);
    setError(null);

    if (backendConfigured) {
      try {
        const fetchedRides = await apiClientRef.current.fetchRides();
        setRides(fetchedRides);
        setIsUsingBackend(true);
        setLastSync(new Date());
        setLoading(false);
        persistSimulationRides(fetchedRides);
        return;
      } catch (apiError) {
        console.warn('AutoShare backend unavailable, falling back to simulation', apiError);
        activateSimulation(
          'Connected to Chennai Auto Share simulation mode. Backend will sync automatically when available.'
        );
        return;
      }
    }

    activateSimulation();
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRideById = (rideId: string) => rides.find(ride => ride.id === rideId);

  const upsertRide = (nextRide: Ride) => {
    setRides(prev => {
      const existingIndex = prev.findIndex(ride => ride.id === nextRide.id);
      const updated = existingIndex >= 0
        ? prev.map(ride => (ride.id === nextRide.id ? nextRide : ride))
        : [nextRide, ...prev];

      if (!isUsingBackend) {
        persistSimulationRides(updated);
      }

      return updated;
    });
  };

  const createRide = async (input: AutoShareFormInput) => {
    const rideInput: CreateRideInput = {
      ...input,
      creator: currentUser,
    };

    if (backendConfigured && isUsingBackend) {
      try {
        const created = await apiClientRef.current.createRide(rideInput);
        upsertRide(created);
        setError(null);
        return created;
      } catch (apiError) {
        console.warn('Falling back to simulation ride creation', apiError);
        setIsUsingBackend(false);
        setError('Operating in offline mode. Ride saved locally.');
      }
    }

    const simulatedRide = createSimulationRide(rideInput);
    upsertRide(simulatedRide);
    return simulatedRide;
  };

  const cancelRide = async (rideId: string) => {
    if (backendConfigured && isUsingBackend) {
      try {
        const cancelled = await apiClientRef.current.updateRideStatus(rideId, { status: 'cancelled' });
        upsertRide(cancelled);
        setError(null);
        return cancelled;
      } catch (apiError) {
        console.warn('Cancelling ride via API failed, using simulation fallback', apiError);
        setIsUsingBackend(false);
        setError('Unable to reach Chennai Auto Share servers. Showing local data.');
      }
    }

    const updatedRide = updateRideLocally(rideId, 'cancelled');
    return updatedRide;
  };

  const updateRideLocally = (rideId: string, status: RideStatus) => {
    let updatedRide: Ride | null = null;

    setRides(prev => {
      const next = prev.map(ride => {
        if (ride.id !== rideId) return ride;
        updatedRide = {
          ...ride,
          status,
        };
        return updatedRide;
      });

      persistSimulationRides(next);
      return next;
    });

    return updatedRide;
  };

  const bookSeats = async (rideId: string, seats: number, note?: string) => {
    if (backendConfigured && isUsingBackend) {
      try {
        const updated = await apiClientRef.current.bookSeats({
          rideId,
          seats,
          passenger: currentUser,
          note,
        });
        upsertRide(updated);
        setError(null);
        return updated;
      } catch (apiError) {
        console.warn('Seat booking via API failed, falling back to simulation', apiError);
        setIsUsingBackend(false);
        setError('Unable to confirm with server. Updated seats locally.');
      }
    }

    const updatedRide = simulateSeatBooking(rideId, seats, currentUser, note);
    return updatedRide;
  };

  const leaveRide = async (rideId: string) => {
    if (backendConfigured && isUsingBackend) {
      const clientWithCancellation = apiClientRef.current as AutoShareApiClient & {
        cancelSeatBooking?: (rideId: string, passengerId: string) => Promise<Ride>;
      };

      if (clientWithCancellation.cancelSeatBooking) {
        try {
          const updated = await clientWithCancellation.cancelSeatBooking(rideId, currentUser.id);
          upsertRide(updated);
          setError(null);
          return updated;
        } catch (apiError) {
          console.warn('Seat cancellation via API failed, falling back to simulation', apiError);
          setIsUsingBackend(false);
          setError('Unable to cancel via server. Updated seats locally.');
        }
      } else {
        console.warn('Seat cancellation API not available; using simulation fallback');
        setIsUsingBackend(false);
        setError('Live cancellation not supported yet. Updated seats locally.');
      }
    }

    const updatedRide = simulateSeatCancellation(rideId, currentUser.id);
    return updatedRide;
  };

  const simulateSeatBooking = (rideId: string, seats: number, passenger: User, note?: string) => {
    if (seats <= 0) return null;

    let updatedRide: Ride | null = null;

    setRides(prev => {
      const next = prev.map(ride => {
        if (ride.id !== rideId) return ride;

        const availableSeats = Math.max(ride.seatsAvailable - seats, 0);
        const totalBookings = ride.seatBookings?.length ?? 0;
        const newBookings = Array.from({ length: Math.min(seats, ride.seatsAvailable) }).map((_, index) => ({
          seatNumber: totalBookings + index + 1,
          passenger,
          status: 'confirmed' as const,
          bookedAt: new Date().toISOString(),
        }));

        updatedRide = {
          ...ride,
          seatsAvailable: availableSeats,
          seatBookings: [...(ride.seatBookings ?? []), ...newBookings],
          notes: note ? `${ride.notes ? `${ride.notes}\n` : ''}${note}` : ride.notes,
        };

        return updatedRide;
      });

      persistSimulationRides(next);
      return next;
    });

    return updatedRide;
  };

  const simulateSeatCancellation = (rideId: string, passengerId: string) => {
    let updatedRide: Ride | null = null;

    const reassignSeatNumbers = (bookings: Ride['seatBookings'] = []) =>
      bookings.map((booking, index) => ({
        ...booking,
        seatNumber: index + 1,
      }));

    setRides(prev => {
      const next = prev.map(ride => {
        if (ride.id !== rideId) return ride;

        const currentBookings = ride.seatBookings ?? [];
        const remaining = currentBookings.filter(booking => booking.passenger.id !== passengerId);
        const seatsFreed = currentBookings.length - remaining.length;

        if (seatsFreed <= 0) {
          updatedRide = ride;
          return ride;
        }

        const resequenced = reassignSeatNumbers(remaining);
        updatedRide = {
          ...ride,
          seatBookings: resequenced.length > 0 ? resequenced : undefined,
          seatsAvailable: Math.min(ride.seatsTotal, ride.seatsAvailable + seatsFreed),
        };
        return updatedRide;
      });

      persistSimulationRides(next);
      return next;
    });

    return updatedRide;
  };

  const value: AutoShareContextValue = {
    rides,
    loading,
    error,
    lastSync,
    isUsingBackend,
    currentUser,
    refresh,
    getRideById,
    createRide,
    cancelRide,
    bookSeats,
    leaveRide,
    updateRideStatusLocally: (rideId: string, status: RideStatus) => {
      updateRideLocally(rideId, status);
    },
  };

  return <AutoShareContext.Provider value={value}>{children}</AutoShareContext.Provider>;
}

export function useAutoShare() {
  const context = useContext(AutoShareContext);
  if (context === undefined) {
    throw new Error('useAutoShare must be used within an AutoShareProvider');
  }
  return context;
}

function cloneRides(source: Ride[]): Ride[] {
  return source.map(ride => ({
    ...ride,
    seatBookings: ride.seatBookings ? ride.seatBookings.map(booking => ({ ...booking })) : undefined,
    creator: { ...ride.creator },
  }));
}

function createSimulationRide(input: CreateRideInput): Ride {
  const timestamp = Date.now();
  return {
    id: `ride_${timestamp}`,
    pickup: input.pickup,
    drop: input.drop,
    time: input.time,
    fare: input.fare,
    seatsTotal: input.seatsTotal,
    seatsAvailable: input.seatsTotal,
    creator: input.creator,
    status: 'upcoming',
    vehicleType: input.vehicleType,
    notes: input.notes,
    route: input.route,
    createdAt: new Date(timestamp).toISOString(),
    seatBookings: [],
  };
}

