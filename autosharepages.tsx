/*
GitHub Copilot, implement the complete Auto Share feature in this file using the commented page descriptions below as guidance.

Requirements:

1. Pages to Implement:
   - AutoSharePage (main listing of rides)
   - AutoShareDetailPage (ride details + join/check-in flow)
   - AutoShareCreatePage (form to offer a ride)
   - AutoShareMyRidesPage (dashboard of offered/joined rides)
   - AutoShareHistoryPage (past rides, offered and joined)

2. General UI:
   - Use React + TailwindCSS for layout and styling.
   - Ensure all pages are responsive (mobile-first, max-w-3xl centered on desktop).
   - Add bilingual headers (English + Tamil).
   - Use consistent card UI for rides (rounded-lg, shadow, padding).
   - Include fallback/empty states with bilingual messages.

3. Icons:
   - Use Heroicons (outline/solid) for clarity:
     - Ride card: <CarIcon> or <TruckIcon> for auto
     - Time: <ClockIcon>
     - Fare: <CurrencyRupeeIcon>
     - Seats: <UserGroupIcon>
     - Status (history): <CheckCircleIcon> for completed, <XCircleIcon> for cancelled, <ExclamationTriangleIcon> for no-show
     - Floating action button (FAB): <PlusIcon>
   - Place icons inline with text labels for better readability.

4. Page-specific Notes:
   - AutoSharePage: list of rides with route, fare, time, seats; link each card to AutoShareDetailPage.
   - AutoShareDetailPage: show ride summary, optional driver info, join ride button with confirmation modal, seat status visualization (confirmed/reserved/available).
   - AutoShareCreatePage: form with pickup, drop, time, fare, seats, notes; success/error banners; cancel button.
   - AutoShareMyRidesPage: tabbed layout (Offered / Joined), ride cards with Manage or Leave buttons, floating “+” button to create ride.
   - AutoShareHistoryPage: collapsible sections (Offered Past / Joined Past), ride cards with status badges (completed/cancelled/no-show).

5. Extensibility:
   - Export each page as a separate functional component.
   - Use mock data arrays for rides (no backend wiring yet).
   - Keep state local to each page for now.
   - Document in comments that this is a front-end only implementation.

6. Navigation:
   - Assume React Router is available.
   - Add routes for each page: /auto-share, /auto-share/:id, /auto-share/create, /auto-share/my, /auto-share/history.
   - Add navigation buttons/links where appropriate (e.g., Back to Auto Share, My Rides, History).

Please implement all five pages below, replacing the commented descriptions with full React + Tailwind code, and add icons where required.
*/


//Pages for a Complete Auto Share Frontend//
//1.AutoSharePage (Main Listing)

//Central hub showing available auto share rides for the user’s pincode.

//Displays a list of ride cards (route, pickup, fare, time, seats).

//Includes empty/fallback state if no rides are available.

import React, { useState } from 'react';

const AutoShareDetailPage = () => {
  // Mock ride data
  const ride = {
    id: 1,
    route: "T. Nagar → Central Station",
    pickup: "Near T. Nagar Bus Stop",
    fare: 50,
    time: "8:30 AM",
    seats: 2,
    driver: {
      name: "Raj Kumar",
      photo: "https://placehold.co/40x40/4F46E5/FFFFFF?text=RK"
    },
    totalSeats: 4
  };

  // Seat status states
  const [seatStatus, setSeatStatus] = useState('available'); // 'available', 'reserved', 'confirmed'
  const [showModal, setShowModal] = useState(false);

  // Handle join ride action
  const handleJoinRide = () => {
    if (ride.seats > 0) {
      setShowModal(true);
    }
  };

  // Confirm seat reservation
  const confirmReservation = () => {
    setSeatStatus('reserved');
    setShowModal(false);
  };

  // Handle check-in
  const handleCheckIn = () => {
    setSeatStatus('confirmed');
  };

  // Render seat status badges
  const renderSeatBadge = () => {
    switch (seatStatus) {
      case 'reserved':
        return (
          <span className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-3 py-1 rounded-full text-sm font-medium">
            Reserved (pending check-in)
          </span>
        );
      case 'confirmed':
        return (
          <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
            Confirmed
          </span>
        );
      default:
        return (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            ride.seats > 2 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : ride.seats > 0 
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {ride.seats > 0 ? `${ride.seats} seats available` : 'No seats available'}
          </span>
        );
    }
  };

  // Render seat visualization
  const renderSeatVisualization = () => {
    const seats = [];
    const reservedCount = seatStatus === 'reserved' ? 1 : 0;
    const confirmedCount = seatStatus === 'confirmed' ? 1 : 0;
    const availableCount = ride.totalSeats - reservedCount - confirmedCount;

    // Add confirmed seats
    for (let i = 0; i < confirmedCount; i++) {
      seats.push(
        <div key={`confirmed-${i}`} className="w-6 h-6 rounded-full bg-green-500 border-2 border-green-600" title="Confirmed">

      );
    }

    // Add reserved seats
    for (let i = 0; i < reservedCount; i++) {
      seats.push(
        
`} className="w-6 h-6 rounded-full bg-amber-500 border-2 border-amber-600" title="Reserved"></div>
      );
    }

    // Add available seats
    for (let i = 0; i < availableCount; i++) {
      seats.push(
        <div key={`available-${i}`} className="w-6 h-6 rounded-full bg-red-500 border-2 border-red-600" title="Available">

      );
    }

    return seats;
  };

  if (!ride) {
    return (
      

        

          

            Ride not available

            பயணம் இல்லை
          

        

      

    );
  }

  return (
    
{/* Header */}
Ride Details பயண விவரங்கள்
Review and confirm your seat

{/* Ride Summary Card */}
{ride.route}
₹{ride.fare}
{ride.pickup}
{ride.time}
{renderSeatBadge()}
{ride.driver && (
{ride.driver.name}
Driver

{ride.driver.name}

)}
{/* Seat Visualization */}
Seat Status
{renderSeatVisualization()}
Confirmed
Reserved
Available
{/* Footer Actions */}
`} 
> Join Ride </button> {seatStatus === 'reserved' && ( <button onClick={handleCheckIn} className="rounded-md px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium" > Check In </button> )} <button className="rounded-md px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium"> Back to Auto Share </button> </div> </div> {/* Confirmation Modal */} {showModal && ( <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"> <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full"> <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2"> Confirm Ride </h3> <p className="text-gray-600 dark:text-gray-400 mb-6"> Are you sure you want to join this ride? Seats are limited. Please confirm only if you intend to travel. </p> <div className="flex flex-col sm:flex-row gap-3"> <button onClick={confirmReservation} className="rounded-md px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex-1" > Confirm </button> <button onClick={() => setShowModal(false)} className="rounded-md px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium flex-1" > Cancel </button> </div> </div> </div> )} </div> ); }; export default AutoShareDetailPage;








//2.AutoShareDetailPage

//Opens when a user clicks on a ride card.

//Shows full details: pickup/drop points, fare breakdown, driver info, seats left, and ride notes.

//Provides a “Join Ride” or “Contact” button (UI only).



import React, { useState } from 'react';

const AutoShareDetailPage = () => {
  // Mock ride data with Baasha theme
  const ride = {
    id: 1,
    route: "T. Nagar → Central Station",
    pickup: "Near T. Nagar Bus Stop",
    fare: 50,
    time: "8:30 AM",
    seats: 2,
    driver: {
      name: "Baasha",
      photo: "https://placehold.co/40x40/8B0000/FFD700?text=B"
    },
    totalSeats: 4
  };

  // Seat status states
  const [seatStatus, setSeatStatus] = useState('available'); // 'available', 'reserved', 'confirmed'
  const [showModal, setShowModal] = useState(false);

  // Handle join ride action
  const handleJoinRide = () => {
    if (ride.seats > 0) {
      setShowModal(true);
    }
  };

  // Confirm seat reservation
  const confirmReservation = () => {
    setSeatStatus('reserved');
    setShowModal(false);
  };

  // Handle check-in
  const handleCheckIn = () => {
    setSeatStatus('confirmed');
  };

  // Render seat status badges
  const renderSeatBadge = () => {
    switch (seatStatus) {
      case 'reserved':
        return (
          <span className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-3 py-1 rounded-full text-sm font-medium">
            Reserved (pending check-in)
          </span>
        );
      case 'confirmed':
        return (
          <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
            Confirmed
          </span>
        );
      default:
        return (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            ride.seats > 2 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : ride.seats > 0 
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {ride.seats > 0 ? `${ride.seats} seats available` : 'No seats available'}
          </span>
        );
    }
  };

  // Render seat visualization
  const renderSeatVisualization = () => {
    const seats = [];
    const reservedCount = seatStatus === 'reserved' ? 1 : 0;
    const confirmedCount = seatStatus === 'confirmed' ? 1 : 0;
    const availableCount = ride.totalSeats - reservedCount - confirmedCount;

    // Add confirmed seats
    for (let i = 0; i < confirmedCount; i++) {
      seats.push(
        <div key={`confirmed-${i}`} className="w-8 h-8 rounded-full bg-green-500 border-2 border-green-600 flex items-center justify-center" title="Confirmed">
          
        

      );
    }

    // Add reserved seats
    for (let i = 0; i < reservedCount; i++) {
      seats.push(
        
`} className="w-8 h-8 rounded-full bg-amber-500 border-2 border-amber-600 flex items-center justify-center" title="Reserved">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      );
    }

    // Add available seats
    for (let i = 0; i < availableCount; i++) {
      seats.push(
        <div key={`available-${i}`} className="w-8 h-8 rounded-full bg-red-500 border-2 border-red-600 flex items-center justify-center" title="Available">
          
        

      );
    }

    return seats;
  };

  // Baasha-themed auto rickshaw silhouette
  const BaashaAutoSilhouette = () => (
    

      
    

  );

  if (!ride) {
    return (
      

        

          

            

              
            

            

              Ride not available

              பயணம் இல்லை
            


          

        

      

    );
  }

  return (
    
{/* Header with Baasha theme */}
Ride Details பயண விவரங்கள்
Review and confirm your seat

{/* Ride Summary Card with Baasha theme */}
{ride.route}
₹{ride.fare}
{ride.pickup}
{ride.time}
{renderSeatBadge()}
{ride.driver && (
{ride.driver.name}
Driver

{ride.driver.name}

)}
{/* Seat Visualization with Baasha theme */}
Seat Status
{renderSeatVisualization()}
Confirmed
Reserved
Available
{/* Footer Actions with Baasha theme */}
`} > Join Ride </button> {seatStatus === 'reserved' && ( <button onClick={handleCheckIn} className="rounded-xl px-5 py-3 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-amber-100 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300" > Check In </button> )} <button className="rounded-xl px-5 py-3 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-gray-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"> Back to Auto Share </button> </div> {/* Baasha-themed auto rickshaw silhouette */} <div className="mt-8 flex justify-center"> <BaashaAutoSilhouette /> </div> {/* Baasha quote footer */} <div className="mt-6 text-center"> <p className="text-amber-300 italic text-lg">"ஓடாதே உன்னால முடியுமாற பார்த்து ஓடு..."</p> <p className="text-amber-400 mt-1">- பாஷா</p> </div> </div> {/* Confirmation Modal with Baasha theme */} {showModal && ( <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"> <div className="bg-gradient-to-br from-amber-900 to-red-900 rounded-2xl shadow-2xl p-6 max-w-md w-full border-4 border-amber-500"> <div className="flex justify-center mb-4"> <div className="w-16 h-16 rounded-full bg-amber-800 flex items-center justify-center"> <svg className="w-8 h-8 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path> </svg> </div> </div> <h3 className="text-xl font-bold text-center text-amber-200 mb-3"> Confirm Ride </h3> <p className="text-amber-300 text-center mb-6"> Are you sure you want to join this ride? Seats are limited. Please confirm only if you intend to travel. </p> <div className="flex flex-col sm:flex-row gap-3"> <button onClick={confirmReservation} className="rounded-xl px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-amber-100 font-bold flex-1 shadow-lg hover:shadow-xl transition-all duration-300" > Confirm </button> <button onClick={() => setShowModal(false)} className="rounded-xl px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-gray-200 font-bold flex-1 shadow-lg hover:shadow-xl transition-all duration-300" > Cancel </button> </div> </div> </div> )} </div> ); }; export default AutoShareDetailPage;

//3.AutoShareCreatePage

//Form for users to offer a ride.

//Fields: pickup location, drop location, time, fare, available seats.

//Bilingual labels and validation messages.


import React, { useState } from 'react';

const AutoShareCreatePage = () => {
  // Form state
  const [formData, setFormData] = useState({
    pickup: '',
    drop: '',
    time: '',
    fare: '',
    seats: '1',
    notes: ''
  });

  // UI states
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.pickup.trim()) {
      newErrors.pickup = 'Pickup location is required';
    }
    
    if (!formData.drop.trim()) {
      newErrors.drop = 'Drop location is required';
    }
    
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }
    
    if (!formData.fare || isNaN(formData.fare) || Number(formData.fare) <= 0) {
      newErrors.fare = 'Valid fare is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Mock success
      setSubmitStatus('success');
      // Reset form after successful submission
      setFormData({
        pickup: '',
        drop: '',
        time: '',
        fare: '',
        seats: '1',
        notes: ''
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);
    } else {
      setSubmitStatus('error');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    // Reset form and states
    setFormData({
      pickup: '',
      drop: '',
      time: '',
      fare: '',
      seats: '1',
      notes: ''
    });
    setErrors({});
    setSubmitStatus(null);
  };

  // Baasha silhouette-themed auto rickshaw animation
  const BaashaAutoSilhouette = () => (
    <div className="relative w-48 h-48 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full">
        {/* Background gradient */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B0000" />
            <stop offset="50%" stopColor="#A52A2A" />
            <stop offset="100%" stopColor="#8B0000" />
          </linearGradient>
          <linearGradient id="autoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2F4F4F" />
            <stop offset="50%" stopColor="#3B3B3B" />
            <stop offset="100%" stopColor="#2F4F4F" />
          </linearGradient>
        </defs>
        
        {/* Background */}
        <rect width="120" height="120" fill="url(#bgGradient)" />
        
        {/* Baasha silhouette */}
        <g transform="translate(60, 40)">
          <path 
            d="M-15 0 Q-10 -15 0 -20 Q10 -15 15 0 Q10 10 0 15 Q-10 10 -15 0 Z" 
            fill="#1a1a1a" 
            className="animate-pulse"
          />
          {/* Eyes */}
          <circle cx="-5" cy="-5" r="2" fill="#FFD700" />
          <circle cx="5" cy="-5" r="2" fill="#FFD700" />
          {/* Mouth */}
          <path d="M-5 5 Q0 10 5 5" stroke="#FFD700" strokeWidth="1" fill="none" />
        </g>
        
        {/* Auto rickshaw silhouette */}
        <g transform="translate(15, 60)">
          {/* Auto body */}
          <rect x="0" y="10" width="90" height="25" rx="6" fill="url(#autoGradient)" className="animate-pulse" />
          
          {/* Passenger compartment */}
          <rect x="10" y="0" width="70" height="15" rx="4" fill="#1a1a1a" />
          
          {/* Windows */}
          <rect x="15" y="2" width="15" height="10" rx="2" fill="#4A90E2" />
          <rect x="35" y="2" width="15" height="10" rx="2" fill="#4A90E2" />
          <rect x="55" y="2" width="15" height="10" rx="2" fill="#4A90E2" />
          
          {/* Wheels */}
          <circle cx="15" cy="40" r="10" fill="#000" className="animate-spin" style={{ animationDuration: '3s' }} />
          <circle cx="75" cy="40" r="10" fill="#000" className="animate-spin" style={{ animationDuration: '3s' }} />
          
          {/* Handlebar */}
          <rect x="-5" y="15" width="8" height="3" rx="1" fill="#000" />
          
          {/* Headlights */}
          <circle cx="88" cy="18" r="3" fill="#FFD700" className="animate-pulse" />
          <circle cx="88" cy="28" r="3" fill="#FFD700" className="animate-pulse" />
        </g>
        
        {/* Decorative elements */}
        <path d="M10,10 Q30,5 50,10 T90,10" stroke="#FFD700" strokeWidth="1" fill="none" className="animate-pulse" />
        <path d="M10,110 Q30,115 50,110 T90,110" stroke="#FFD700" strokeWidth="1" fill="none" className="animate-pulse" />
      </svg>
    </div>
  );

  // Success Animation with Baasha silhouette theme
  const SuccessAnimation = () => (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#006400" />
            <stop offset="100%" stopColor="#228B22" />
          </linearGradient>
        </defs>
        
        {/* Checkmark circle with Baasha colors */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="url(#successGradient)" strokeWidth="4" className="animate-ping" style={{ animationDuration: '1.5s' }} />
        <circle cx="50" cy="50" r="40" fill="none" stroke="url(#successGradient)" strokeWidth="2" />
        
        {/* Baasha-style decorative elements */}
        <path d="M20,30 Q50,15 80,30" stroke="url(#successGradient)" strokeWidth="1" fill="none" />
        <path d="M20,70 Q50,85 80,70" stroke="url(#successGradient)" strokeWidth="1" fill="none" />
        
        {/* Checkmark */}
        <path 
          d="M30 50 L45 65 L70 35" 
          stroke="url(#successGradient)" 
          strokeWidth="5" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="animate-draw"
          style={{ 
            strokeDasharray: 100, 
            strokeDashoffset: 100,
            animation: 'dash 1s ease-in-out forwards'
          }}
        />
      </svg>
    </div>
  );

  // Error Animation with Baasha silhouette theme
  const ErrorAnimation = () => (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="errorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B0000" />
            <stop offset="100%" stopColor="#A52A2A" />
          </linearGradient>
        </defs>
        
        {/* Error circle with Baasha colors */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="url(#errorGradient)" strokeWidth="4" className="animate-pulse" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="url(#errorGradient)" strokeWidth="2" />
        
        {/* Baasha-style decorative elements */}
        <path d="M20,30 Q50,15 80,30" stroke="url(#errorGradient)" strokeWidth="1" fill="none" />
        <path d="M20,70 Q50,85 80,70" stroke="url(#errorGradient)" strokeWidth="1" fill="none" />
        
        {/* Exclamation */}
        <rect x="45" y="25" width="10" height="35" rx="5" fill="url(#errorGradient)" />
        <circle cx="50" cy="70" r="5" fill="url(#errorGradient)" />
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-amber-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with Baasha silhouette theme */}
        <header className="mb-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mr-4 shadow-2xl border-2 border-amber-500">
              <svg className="w-9 h-9 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-amber-200 drop-shadow-lg">
              Offer a Ride <span className="text-xl text-amber-300">பயணம் பகிர்வு</span>
            </h1>
          </div>
          <p className="text-amber-200 text-lg font-medium">
            Fill in the details to share your auto ride
          </p>
          <div className="mt-3 flex justify-center">
            <div className="w-32 h-1 bg-amber-500 rounded-full shadow-lg"></div>
          </div>
        </header>

        {/* Status banners with Baasha silhouette theme */}
        {submitStatus === 'success' && (
          <div className="bg-gradient-to-r from-green-900 to-green-800 border-2 border-amber-500 text-amber-100 px-5 py-4 rounded-xl mb-6 flex items-center shadow-2xl">
            <div className="mr-4">
              <SuccessAnimation />
            </div>
            <div>
              <span className="font-bold text-xl">
                Ride created successfully!
              </span>
              <span className="block font-medium text-lg mt-1">
                பயணம் வெற்றிகரமாக உருவாக்கப்பட்டது!
              </span>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="bg-gradient-to-r from-red-900 to-red-800 border-2 border-amber-500 text-amber-100 px-5 py-4 rounded-xl mb-6 flex items-center shadow-2xl">
            <div className="mr-4">
              <ErrorAnimation />
            </div>
            <div>
              <span className="font-bold text-xl">
                Something went wrong. Please try again.
              </span>
              <span className="block font-medium text-lg mt-1">
                ஏதோ தவறு ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.
              </span>
            </div>
          </div>
        )}

        {/* Ride Creation Form with Baasha silhouette theme */}
        <div className="bg-black/80 rounded-xl shadow-2xl p-7 space-y-6 border-4 border-amber-600">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Pickup Location */}
            <div>
              <label className="block text-lg font-bold text-amber-300 mb-2">
                Pickup Location <span className="text-amber-500 font-medium">பிக்-அப் இடம்</span>
              </label>
              <input
                type="text"
                name="pickup"
                value={formData.pickup}
                onChange={handleChange}
                placeholder="Enter pickup location / பிக்-அப் இடத்தை உள்ளிடவும்"
                className={`w-full rounded-xl border-2 px-4 py-3 text-lg font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
                  errors.pickup 
                    ? 'border-red-500 bg-red-900/50' 
                    : 'border-amber-600 bg-gray-900'
                } text-amber-100 placeholder-amber-700`}
              />
              {errors.pickup && (
                

                  
                  {errors.pickup}
                


              )}
            


            {/* Drop Location */}
            

              
                Drop Location இறங்கும் இடம்
              
              
{formData.drop}
`}
              />
              {errors.drop && (
                <p className="mt-1 text-red-400 font-medium text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {errors.drop}
                </p>
              )}
            </div>

            {/* Time */}
            <div>
              <label className="block text-lg font-bold text-amber-300 mb-2">
                Time <span className="text-amber-500 font-medium">நேரம்</span>
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`w-full rounded-xl border-2 px-4 py-3 text-lg font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
                  errors.time 
                    ? 'border-red-500 bg-red-900/50' 
                    : 'border-amber-600 bg-gray-900'
                } text-amber-100`}
              />
              {errors.time && (
                

                  
                  {errors.time}
                


              )}
            


            {/* Fare */}
            
Fare கட்டணம்
₹
Enter fare amount / கட்டணத்தை உள்ளிடவும்
`} /> </div> {errors.fare && ( <p className="mt-1 text-red-400 font-medium text-sm flex items-center"> <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> {errors.fare} </p> )} </div> {/* Available Seats */} <div> <label className="block text-lg font-bold text-amber-300 mb-2"> Available Seats <span className="text-amber-500 font-medium">கிடைக்கும் இடங்கள்</span> </label> <select name="seats" value={formData.seats} onChange={handleChange} className="w-full rounded-xl border-2 border-amber-600 bg-gray-900 px-4 py-3 text-lg font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-amber-100" > <option value="1" className="bg-gray-800">1 seat</option> <option value="2" className="bg-gray-800">2 seats</option> <option value="3" className="bg-gray-800">3 seats</option> <option value="4" className="bg-gray-800">4 seats</option> </select> </div> {/* Notes */} <div> <label className="block text-lg font-bold text-amber-300 mb-2"> Notes (Optional) <span className="text-amber-500 font-medium">குறிப்புகள்</span> </label> <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Landmark, preferences, etc. / லேண்ட்மார்க், விருப்பத்தேர்வுகள் போன்றவை" rows="3" className="w-full rounded-xl border-2 border-amber-600 bg-gray-900 px-4 py-3 text-lg font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-amber-100 placeholder-amber-700" ></textarea> </div> {/* Action Buttons with Baasha silhouette theme */} <div className="flex flex-col sm:flex-row gap-4 pt-4"> <button type="submit" className="rounded-xl px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-amber-100 font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 flex-1 flex items-center justify-center border-2 border-amber-400" > <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path> </svg> Create Ride <span className="ml-2">பயணம் உருவாக்கு</span> </button> <button type="button" onClick={handleCancel} className="rounded-xl px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-gray-200 font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 flex-1 flex items-center justify-center border-2 border-gray-500" > <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path> </svg> Cancel </button> </div> </form> </div> {/* Baasha silhouette-themed auto rickshaw animation */} <div className="mt-8 flex justify-center"> <BaashaAutoSilhouette /> </div> {/* Baasha quote footer */} <div className="mt-6 text-center"> <p className="text-amber-300 italic text-xl font-medium">"ஓடாதே உன்னால முடியுமாற பார்த்து ஓடு..."</p> <p className="text-amber-400 mt-2 text-lg">- பாஷா</p> </div> {/* Animation styles */} <style jsx>{` @keyframes dash { to { stroke-dashoffset: 0; } } .animate-draw { animation: dash 1s ease-in-out forwards; } `}</style> </div> </div> ); }; export default AutoShareCreatePage;

//4.AutoShareMyRidesPage

//Dashboard for rides the user has created or joined.

//Split into “My Offered Rides” and “My Joined Rides.”

//Each entry links to the detail page.


import React, { useState } from 'react';

const AutoShareMyRidesPage = () => {
  const [activeTab, setActiveTab] = useState('offered');

  // Mock data for offered rides
  const offeredRides = [
    {
      id: 1,
      route: "T. Nagar → Central Station",
      time: "8:30 AM",
      fare: 50,
      seats: {
        total: 4,
        confirmed: 2,
        reserved: 1,
        available: 1
      },
      status: "active"
    },
    {
      id: 2,
      route: "Anna Nagar → Egmore",
      time: "9:15 AM",
      fare: 70,
      seats: {
        total: 4,
        confirmed: 3,
        reserved: 0,
        available: 1
      },
      status: "completed"
    }
  ];

  // Mock data for joined rides
  const joinedRides = [
    {
      id: 3,
      route: "Velachery → Tambaram",
      time: "7:45 AM",
      fare: 40,
      seats: {
        total: 4,
        confirmed: 1,
        reserved: 1,
        available: 2
      },
      status: "active"
    },
    {
      id: 4,
      route: "Adyar → Chromepet",
      time: "10:00 AM",
      fare: 60,
      seats: {
        total: 4,
        confirmed: 0,
        reserved: 0,
        available: 4
      },
      status: "cancelled"
    }
  ];

  // Get current rides based on active tab
  const currentRides = activeTab === 'offered' ? offeredRides : joinedRides;

  // Render seat status
  const renderSeatStatus = (seats) => {
    return (
      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        <span>{seats.confirmed + seats.reserved}/{seats.total} booked</span>
      </div>
    );
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    const statusStyles = {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    };

    const statusText = {
      active: "Active",
      completed: "Completed",
      cancelled: "Cancelled"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {statusText[status]}
      
    );
  };

  // Tamil culture themed decoration
  const TamilCultureDecoration = () => (
    

      

        
      

      

        
      

    

  );

  // Tamil kolam pattern
  const KolamPattern = () => (
    

      
    

  );

  return (
    
{/* Background patterns */}
{/* Header with Tamil culture theme */}
My Rides என் பயணங்கள்
View rides you have created or joined

{/* Tabbed Layout with Tamil colors */}
setActiveTab('offered')} className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${ activeTab === 'offered' ? 'text-amber-700 dark:text-amber-200 border-b-2 border-amber-600' : 'text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300' }`} > Offered Rides <span className="block text-sm">நான் வழங்கியவை</span> </button> <button onClick={() => setActiveTab('joined')} className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${ activeTab === 'joined' ? 'text-amber-700 dark:text-amber-200 border-b-2 border-amber-600' : 'text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300' }`} > Joined Rides <span className="block text-sm">நான் சேர்ந்தவை</span> </button> </div> </div> {/* Ride List Section */} <div className="space-y-4"> {currentRides.length > 0 ? ( currentRides.map((ride) => ( <div key={ride.id} className="bg-white/90 dark:bg-amber-800/90 backdrop-blur-sm rounded-xl shadow-lg p-5 border border-amber-100 dark:border-amber-700 hover:shadow-xl transition-shadow" > <div className="flex justify-between items-start mb-3"> <div> <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-1"> {ride.route} </h3> <div className="flex items-center text-amber-700 dark:text-amber-300"> <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> <span className="font-medium">{ride.time}</span> </div> </div> <div className="flex flex-col items-end space-y-2"> <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm"> ₹{ride.fare} </span> {renderStatusBadge(ride.status)} </div> </div> <div className="flex justify-between items-center"> {renderSeatStatus(ride.seats)} <div className="flex space-x-2"> {activeTab === 'offered' ? ( <button className="rounded-md px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all"> Manage </button> ) : ( <button className="rounded-md px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all"> Leave Ride </button> )} </div> </div> </div> )) ) : ( <div className="bg-white/80 dark:bg-amber-800/80 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-amber-200 dark:border-amber-700"> <div className="flex justify-center mb-4"> <svg className="w-16 h-16 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> </div> <p className="text-amber-700 dark:text-amber-300 italic text-lg"> No rides found<br /> <span className="block mt-2 text-base">பயணங்கள் இல்லை</span> </p> </div> )} </div> {/* Floating Action Button with Tamil culture theme */} <button className="fixed bottom-6 right-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 z-20"> <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path> </svg> </button> {/* Tamil cultural elements at bottom */} <div className="mt-8 flex justify-center"> <div className="flex space-x-4 opacity-20"> <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path> </svg> <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 6h16M4 12h16M4 18h16"></path> </svg> <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path> </svg> </div> </div> </div> </div> ); }; export default AutoShareMyRidesPage;





//5.AutoShareHistoryPage

//Past rides (completed or expired).

//Useful for transparency and trust.

import React, { useState } from 'react';

const AutoShareHistoryPage = () => {
  const [expandedSections, setExpandedSections] = useState({
    offered: true,
    joined: true
  });

  // Mock data for past offered rides
  const pastOfferedRides = [
    {
      id: 1,
      route: "T. Nagar → Central Station",
      date: "2024-01-15",
      time: "8:30 AM",
      fare: 50,
      seats: {
        total: 4,
        filled: 3
      },
      status: "completed",
      notes: "Great ride, passengers were punctual",
      createdBy: {
        name: "Raj Kumar",
        avatar: "https://placehold.co/32x32/4F46E5/FFFFFF?text=RK"
      }
    },
    {
      id: 2,
      route: "Anna Nagar → Egmore",
      date: "2024-01-12",
      time: "9:15 AM",
      fare: 70,
      seats: {
        total: 4,
        filled: 0
      },
      status: "cancelled",
      notes: "Cancelled due to rain",
      createdBy: {
        name: "Priya S",
        avatar: "https://placehold.co/32x32/EF4444/FFFFFF?text=PS"
      }
    }
  ];

  // Mock data for past joined rides
  const pastJoinedRides = [
    {
      id: 3,
      route: "Velachery → Tambaram",
      date: "2024-01-10",
      time: "7:45 AM",
      fare: 40,
      seats: {
        total: 4,
        filled: 2
      },
      status: "completed",
      notes: "Smooth journey, good driver",
      createdBy: {
        name: "Karthik M",
        avatar: "https://placehold.co/32x32/10B981/FFFFFF?text=KM"
      }
    },
    {
      id: 4,
      route: "Adyar → Chromepet",
      date: "2024-01-08",
      time: "10:00 AM",
      fare: 60,
      seats: {
        total: 4,
        filled: 1
      },
      status: "no-show",
      notes: "Driver didn't show up",
      createdBy: {
        name: "Senthil R",
        avatar: "https://placehold.co/32x32/F59E0B/FFFFFF?text=SR"
      }
    }
  ];

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Render status badge with icons
  const renderStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        text: "Completed",
        className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        icon: (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        )
      },
      cancelled: {
        text: "Cancelled",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        icon: (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        )
      },
      "no-show": {
        text: "No-show",
        className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
        icon: (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        )
      }
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${config.className}`}>
        {config.icon}
        {config.text}
      
    );
  };

  // Render ride history card
  const renderRideCard = (ride) => (
    

      

        

          

            {ride.route}
          

          

            
            {ride.date} at {ride.time}
          

        

        

          
            
            ₹{ride.fare}
          
          {renderStatusBadge(ride.status)}
        

      

      
      

        

          
          {ride.seats.filled}/{ride.seats.total} seats filled
        

      

      
      {/* Created by section */}
      

        
        Created by: {ride.createdBy.name}
      

      
      {ride.notes && (
        

          

            Notes: {ride.notes}
          


        

      )}
    

  );

  // Tamil culture themed decoration
  const TamilCultureDecoration = () => (
    

      

        
      

      

        
      

    

  );

  // Tamil kolam pattern
  const KolamPattern = () => (
    

      
    

  );

  return (
    
{/* Background patterns */}
{/* Header with Tamil culture theme */}
Ride History பயண வரலாறு
View your past auto share rides

{/* History Sections with Tamil theme */}
{/* Offered Rides Section */}
toggleSection('offered')} className="w-full p-4 text-left flex justify-between items-center rounded-t-xl hover:bg-amber-50/50 dark:hover:bg-amber-900/50 transition-colors" >
Offered Rides (Past)
நான் வழங்கியவை (முந்தையவை)

`} fill="none" stroke="currentColor" viewBox="0 0 24 24" > <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path> </svg> </button> {expandedSections.offered && ( <div className="p-4 pt-0"> {pastOfferedRides.length > 0 ? ( pastOfferedRides.map(renderRideCard) ) : ( <div className="text-center py-8"> <p className="text-amber-700 dark:text-amber-300 italic"> No past offered rides found<br /> <span className="block mt-1">முந்தைய வழங்கப்பட்ட பயணங்கள் இல்லை</span> </p> </div> )} </div> )} </div> {/* Joined Rides Section */} <div className="bg-white/80 dark:bg-amber-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200 dark:border-amber-700"> <button onClick={() => toggleSection('joined')} className="w-full p-4 text-left flex justify-between items-center rounded-t-xl hover:bg-amber-50/50 dark:hover:bg-amber-900/50 transition-colors" > <div> <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100"> Joined Rides (Past) </h2> <p className="text-amber-700 dark:text-amber-300 text-sm"> நான் சேர்ந்தவை (முந்தையவை) </p> </div> <svg className={`w-5 h-5 text-amber-600 dark:text-amber-400 transform transition-transform ${ expandedSections.joined ? 'rotate-180' : '' }`} fill="none" stroke="currentColor" viewBox="0 0 24 24" > <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path> </svg> </button> {expandedSections.joined && ( <div className="p-4 pt-0"> {pastJoinedRides.length > 0 ? ( pastJoinedRides.map(renderRideCard) ) : ( <div className="text-center py-8"> <p className="text-amber-700 dark:text-amber-300 italic"> No past joined rides found<br /> <span className="block mt-1">முந்தைய சேரப்பட்ட பயணங்கள் இல்லை</span> </p> </div> )} </div> )} </div> </div> {/* Empty/Fallback State */} {pastOfferedRides.length === 0 && pastJoinedRides.length === 0 && ( <div className="bg-white/80 dark:bg-amber-800/80 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-amber-200 dark:border-amber-700 mt-6"> <div className="flex justify-center mb-4"> <svg className="w-16 h-16 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> </div> <p className="text-amber-700 dark:text-amber-300 italic text-lg"> No past rides found<br /> <span className="block mt-2 text-base">முந்தைய பயணங்கள் இல்லை</span> </p> </div> )} {/* Footer Actions with Tamil theme */} <div className="mt-8 flex justify-center"> <button className="rounded-xl px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center"> <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path> </svg> Back to My Rides </button> </div> {/* Tamil cultural elements at bottom */} <div className="mt-8 flex justify-center"> <div className="flex space-x-4 opacity-20"> <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path> </svg> <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 6h16M4 12h16M4 18h16"></path> </svg> <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path> </svg> </div> </div> </div> </div> ); }; export default AutoShareHistoryPage;