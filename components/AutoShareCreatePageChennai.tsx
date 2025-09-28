import {
    ArrowLeftIcon,
    CalculatorIcon,
    ChatBubbleLeftIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyRupeeIcon,
    ExclamationTriangleIcon,
    MapPinIcon,
    TruckIcon,
    UserGroupIcon
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ride, VehicleType } from "../utils/autoShareInterfaces";
import { chennaiLocations, mockRides } from "../utils/mockRidesChennai";

const AutoShareCreatePageChennai: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pickup: "",
    drop: "",
    time: "",
    fare: "",
    seats: "",
    vehicleType: "auto" as VehicleType,
    route: "",
    notes: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);
  const [suggestedFare, setSuggestedFare] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // Auto-calculate suggested fare when pickup/drop changes
    if ((name === 'pickup' || name === 'drop' || name === 'vehicleType') && formData.pickup && formData.drop) {
      calculateSuggestedFare();
    }
  };

  const calculateSuggestedFare = () => {
    // Simple fare calculation based on vehicle type and rough distance
    const baseFare: Record<VehicleType, number> = {
      'auto': 80,
      'car': 150,
      'share-auto': 40
    };
    
    const multiplier = Math.random() * 0.5 + 0.8; // Random multiplier for variety
    const suggested = Math.round(baseFare[formData.vehicleType] * multiplier);
    setSuggestedFare(suggested);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.pickup) newErrors.pickup = "Pickup location is required / பிக்கப் இடம் அவசியம்";
    if (!formData.drop) newErrors.drop = "Drop location is required / டிராப் இடம் அவசியம்";
    if (!formData.time) newErrors.time = "Time is required / நேரம் அவசியம்";
    if (!formData.fare) newErrors.fare = "Fare is required / கட்டணம் அவசியம்";
    else if (isNaN(Number(formData.fare)) || Number(formData.fare) <= 0) 
      newErrors.fare = "Please enter a valid fare / சரியான கட்டணம் போடுங்க";
    if (!formData.seats) newErrors.seats = "Number of seats is required / இருக்கை எண்ணிக்கை அவசியம்";
    else if (isNaN(Number(formData.seats)) || Number(formData.seats) <= 0 || Number(formData.seats) > 8) 
      newErrors.seats = "Please enter valid seats (1-8) / 1-8 இருக்கைகள் மட்டும்";
    
    // Check if pickup and drop are the same
    if (formData.pickup && formData.drop && formData.pickup.toLowerCase() === formData.drop.toLowerCase()) {
      newErrors.drop = "Pickup and drop cannot be the same / பிக்கப் மற்றும் டிராப் ஒன்றாக இருக்க முடியாது";
    }
    
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
      id: `r${Date.now()}`,
      pickup: formData.pickup,
      drop: formData.drop,
      time: formData.time,
      fare: parseFloat(formData.fare),
      seatsTotal: parseInt(formData.seats, 10),
      seatsAvailable: parseInt(formData.seats, 10),
      creator: { 
        id: "u1", 
        name: "Arun Kumar / அருண் குமார்",
        rating: 4.8,
        ridesCompleted: 127,
        isVerified: true
      },
      status: "upcoming",
      vehicleType: formData.vehicleType,
      route: formData.route,
      notes: formData.notes,
      createdAt: new Date().toISOString()
    };

    // In a real app, this would make an API call
    mockRides.push(newRide);
    setSuccess(true);
    setTimeout(() => navigate("/auto-share"), 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Chennai-themed Back Button */}
        <button
          className="flex items-center text-amber-700 hover:text-amber-900 mb-6 font-medium bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
          onClick={() => navigate("/auto-share")}
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Rides / மீண்டும் பார்க்க
        </button>

        {/* Chennai-themed Header */}
        <header className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="text-4xl mr-3">🏛️</div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                Offer a Ride
              </h1>
              <h2 className="text-2xl font-bold text-amber-800">
                பயணம் பகிர்வு
              </h2>
            </div>
            <div className="text-4xl ml-3">🛺</div>
          </div>
          <p className="text-amber-700 font-medium">Share your journey with fellow Chennaiites</p>
          <p className="text-amber-600 text-sm">சென்னைவாசிகளுடன் உங்கள் பயணத்தைப் பகிர்ந்து கொள்ளுங்கள்</p>
        </header>

        {/* Success Banner */}
        {success && (
          <div className="bg-green-50 border-2 border-green-200 text-green-800 px-6 py-4 rounded-xl mb-6 shadow-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="w-8 h-8 mr-3 text-green-600" />
              <div>
                <div className="font-bold text-lg">Ride created successfully!</div>
                <div className="text-green-700">சவாரி வெற்றிகரமாக உருவாக்கப்பட்டது! Redirecting to rides...</div>
              </div>
            </div>
          </div>
        )}

        {/* Chennai-themed Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl p-8 space-y-6 border-l-4 border-amber-400">
          {/* Vehicle Type Selection - Chennai specific */}
          <div>
            <label className="block text-lg font-bold text-amber-800 mb-3">
              <TruckIcon className="w-5 h-5 inline mr-2" />
              Vehicle Type / வாகன வகை
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'auto', label: 'Auto Rickshaw', tamil: 'ஆட்டோ ரிக்ஷா', emoji: '🛺', seats: '3' },
                { value: 'car', label: 'Car', tamil: 'கார்', emoji: '🚗', seats: '4-5' },
                { value: 'share-auto', label: 'Share Auto', tamil: 'பகிர்வு ஆட்டோ', emoji: '🚌', seats: '6-8' }
              ].map(vehicle => (
                <label key={vehicle.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="vehicleType"
                    value={vehicle.value}
                    checked={formData.vehicleType === vehicle.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-lg border-2 text-center transition-all duration-200 transform hover:scale-105 ${
                    formData.vehicleType === vehicle.value
                      ? 'border-amber-500 bg-amber-50 shadow-md'
                      : 'border-gray-200 bg-gray-50 hover:border-amber-300'
                  }`}>
                    <div className="text-3xl mb-2">{vehicle.emoji}</div>
                    <div className="font-bold text-gray-800">{vehicle.label}</div>
                    <div className="text-sm text-amber-600">{vehicle.tamil}</div>
                    <div className="text-xs text-gray-500 mt-1">{vehicle.seats} seats</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Chennai Locations Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pickup Location */}
            <div>
              <label className="block text-sm font-bold text-amber-800 mb-2">
                <MapPinIcon className="w-4 h-4 inline mr-2" />
                Pickup Location / பிக்கப் இடம்
              </label>
              <select
                name="pickup"
                value={formData.pickup}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${
                  errors.pickup ? "border-red-300 bg-red-50" : "border-amber-200"
                }`}
              >
                <option value="">Select pickup location / தொடக்க இடத்தை தேர்ந்தெடுங்கள்</option>
                {chennaiLocations.map((location, index) => (
                  <option key={index} value={`${location.english} / ${location.tamil}`}>
                    {location.english} / {location.tamil}
                    {location.landmark && ` (${location.landmark})`}
                  </option>
                ))}
              </select>
              {errors.pickup && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                  {errors.pickup}
                </p>
              )}
            </div>

            {/* Drop Location */}
            <div>
              <label className="block text-sm font-bold text-amber-800 mb-2">
                <MapPinIcon className="w-4 h-4 inline mr-2" />
                Drop Location / டிராப் இடம்
              </label>
              <select
                name="drop"
                value={formData.drop}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${
                  errors.drop ? "border-red-300 bg-red-50" : "border-amber-200"
                }`}
              >
                <option value="">Select drop location / இறுதி இடத்தை தேர்ந்தெடுங்கள்</option>
                {chennaiLocations.map((location, index) => (
                  <option key={index} value={`${location.english} / ${location.tamil}`}>
                    {location.english} / {location.tamil}
                    {location.landmark && ` (${location.landmark})`}
                  </option>
                ))}
              </select>
              {errors.drop && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                  {errors.drop}
                </p>
              )}
            </div>
          </div>

          {/* Route Information */}
          <div>
            <label className="block text-sm font-bold text-amber-800 mb-2">
              Route Information / வழி தகவல் (Optional)
            </label>
            <input
              type="text"
              name="route"
              value={formData.route}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              placeholder="e.g., via Anna Salai / அண்ணா சாலை வழியே"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-bold text-amber-800 mb-2">
              <ClockIcon className="w-4 h-4 inline mr-2" />
              Departure Time / புறப்படும் நேரம்
            </label>
            <input
              type="datetime-local"
              name="time"
              value={formData.time}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${
                errors.time ? "border-red-300 bg-red-50" : "border-amber-200"
              }`}
            />
            {errors.time && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                {errors.time}
              </p>
            )}
          </div>

          {/* Fare and Seats Row with fare calculator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-amber-800 mb-2">
                <CurrencyRupeeIcon className="w-4 h-4 inline mr-2" />
                Fare per Person / ஒரு நபருக்கு கட்டணம்
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="fare"
                  value={formData.fare}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 pr-16 ${
                    errors.fare ? "border-red-300 bg-red-50" : "border-amber-200"
                  }`}
                  placeholder="₹50"
                  min="10"
                  max="1000"
                />
                <span className="absolute right-3 top-3 text-gray-500">₹</span>
              </div>
              {suggestedFare && (
                <button
                  type="button"
                  onClick={() => setFormData({...formData, fare: suggestedFare.toString()})}
                  className="mt-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-md hover:bg-amber-200 transition-colors"
                >
                  <CalculatorIcon className="w-3 h-3 inline mr-1" />
                  Suggested: ₹{suggestedFare}
                </button>
              )}
              {errors.fare && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                  {errors.fare}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-800 mb-2">
                <UserGroupIcon className="w-4 h-4 inline mr-2" />
                Available Seats / கிடைக்கும் இருக்கைகள்
              </label>
              <select
                name="seats"
                value={formData.seats}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${
                  errors.seats ? "border-red-300 bg-red-50" : "border-amber-200"
                }`}
              >
                <option value="">Select seats / இருக்கைகளை தேர்ந்தெடுங்கள்</option>
                {Array.from({ length: 8 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>
                    {num} seat{num > 1 ? 's' : ''} / {num} இருக்கை{num > 1 ? 'கள்' : ''}
                  </option>
                ))}
              </select>
              {errors.seats && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                  {errors.seats}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-amber-800 mb-2">
              <ChatBubbleLeftIcon className="w-4 h-4 inline mr-2" />
              Additional Notes / கூடுதல் குறிப்புகள் (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              placeholder="e.g., AC car, music allowed / ஏசி கார், இசை அனுமதி"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Create Ride / சவாரி உருவாக்க
          </button>

          {/* Tamil Instructions */}
          <div className="bg-amber-50 p-4 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-2">🏛️ Chennai Auto Share Guidelines:</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Be punctual and respectful to fellow passengers / சரியான நேரத்தில் வந்து பயணிகளிடம் மரியாதையாக இருங்கள்</li>
              <li>• Follow traffic rules and safety guidelines / போக்குவரத்து விதிகளை பின்பற்றவும்</li>
              <li>• Keep the vehicle clean / வாகனத்தை சுத்தமாக வைக்கவும்</li>
            </ul>
          </div>
        </form>

        {/* Chennai Cultural Footer */}
        <div className="text-center mt-8 text-amber-600 text-sm">
          <p>🏛️ Chennai Auto Share - Connecting Chennai, One Ride at a Time 🛺</p>
          <p className="text-xs text-amber-500 mt-1">சென்னை ஆட்டோ பகிர்வு - ஒரு சவாரியில் சென்னையை இணைத்தல்</p>
        </div>
      </div>
    </div>
  );
};

export default AutoShareCreatePageChennai;