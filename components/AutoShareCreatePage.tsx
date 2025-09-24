import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ride } from "../utils/autoShareInterfaces";
import { mockRides } from "../utils/mockRides";

const AutoShareCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pickup: "",
    drop: "",
    time: "",
    fare: "",
    seats: "",
    notes: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.pickup) newErrors.pickup = "Pickup is required.";
    if (!formData.drop) newErrors.drop = "Drop is required.";
    if (!formData.time) newErrors.time = "Time is required.";
    if (!formData.fare) newErrors.fare = "Fare is required.";
    if (!formData.seats) newErrors.seats = "Seats are required.";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newRide: Ride = {
      id: `r${mockRides.length + 1}`,
      pickup: formData.pickup,
      drop: formData.drop,
      time: formData.time,
      fare: parseFloat(formData.fare),
      seatsTotal: parseInt(formData.seats, 10),
      seatsAvailable: parseInt(formData.seats, 10),
      creator: { id: "u1", name: "Arun Kumar" }, // Mock creator
      status: "upcoming",
    };

    mockRides.push(newRide);
    setSuccess(true);
    setTimeout(() => navigate("/auto-share"), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold">
          Offer a Ride / <span className="text-gray-500">பயணம் பகிர்வு</span>
        </h1>
      </header>

      {success && (
        <div className="bg-green-100 text-green-800 p-4 rounded mb-4">
          Ride created successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Pickup</label>
          <input
            type="text"
            name="pickup"
            value={formData.pickup}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.pickup && <p className="text-red-500 text-sm">{errors.pickup}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Drop</label>
          <input
            type="text"
            name="drop"
            value={formData.drop}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.drop && <p className="text-red-500 text-sm">{errors.drop}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Time</label>
          <input
            type="datetime-local"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.time && <p className="text-red-500 text-sm">{errors.time}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fare</label>
          <input
            type="number"
            name="fare"
            value={formData.fare}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.fare && <p className="text-red-500 text-sm">{errors.fare}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Seats</label>
          <input
            type="number"
            name="seats"
            value={formData.seats}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.seats && <p className="text-red-500 text-sm">{errors.seats}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes (optional)</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Submit
          </button>
          <button
            type="button"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            onClick={() => navigate("/auto-share")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AutoShareCreatePage;
