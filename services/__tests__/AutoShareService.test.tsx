import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import {
    AutoShareProvider,
    useAutoShare,
} from "../AutoShareService";

jest.mock("../autoShareConfig", () => ({
  AUTOSHARE_API_BASE_URL: "",
  AUTOSHARE_API_KEY: "",
  AUTOSHARE_FEATURE_FLAGS: { enableBackend: false },
  AUTOSHARE_SIMULATION_STORAGE_KEY: "test-chennai-auto-share",
  AUTOSHARE_CURRENT_USER_ID: "u1",
}));

describe("AutoShareService end-to-end flow", () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AutoShareProvider>{children}</AutoShareProvider>
  );

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("creates a ride, books seats, and updates status", async () => {
    const { result } = renderHook(() => useAutoShare(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    const initialCount = result.current.rides.length;
    let rideId: string;

    await act(async () => {
      const created = await result.current.createRide({
        pickup: "Central Station / சென்ட்ரல் ஸ்டேஷன்",
        drop: "Velachery / வேளச்சேரி",
        time: new Date(Date.now() + 60_000).toISOString(),
        fare: 95,
        seatsTotal: 3,
        vehicleType: "auto",
        route: "via Anna Salai",
        notes: "Test ride",
      });
      rideId = created.id;
    });

    expect(result.current.rides.length).toBe(initialCount + 1);
    const createdRide = result.current.getRideById(rideId!);
    expect(createdRide).toBeDefined();
    expect(createdRide?.creator.id).toBe(result.current.currentUser.id);
    expect(createdRide?.seatsAvailable).toBe(3);

    await act(async () => {
      await result.current.bookSeats(rideId!, 2, "Window seat, please");
    });

    const bookedRide = result.current.getRideById(rideId!);
    expect(bookedRide?.seatsAvailable).toBe(1);
    expect(bookedRide?.seatBookings).toHaveLength(2);
    expect(
      bookedRide?.seatBookings?.every(
        booking => booking.passenger.id === result.current.currentUser.id
      )
    ).toBe(true);

    await act(async () => {
      await result.current.leaveRide(rideId!);
    });

    const afterLeaveRide = result.current.getRideById(rideId!);
    expect(afterLeaveRide?.seatsAvailable).toBe(afterLeaveRide?.seatsTotal);
    expect(afterLeaveRide?.seatBookings ?? []).toHaveLength(0);

    act(() => {
      result.current.updateRideStatusLocally(rideId!, "completed");
    });

    const completedRide = result.current.getRideById(rideId!);
    expect(completedRide?.status).toBe("completed");
  });
});
