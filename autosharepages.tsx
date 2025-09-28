import {
    ArrowLeftIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyRupeeIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    MapPinIcon,
    PlusIcon,
    TruckIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import {
    CheckCircleIcon as CheckCircleSolidIcon,
    ExclamationTriangleIcon as ExclamationTriangleSolidIcon,
    XCircleIcon as XCircleSolidIcon,
} from '@heroicons/react/24/solid';
import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

/**
 * Front-end only Auto Share implementation.
 * These pages rely on mock data and local component state and can be replaced with live data later.
 */

type RideStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';

type Ride = {
  id: number;
  route: string;
  pickup: string;
  drop: string;
  time: string;
  date?: string;
  fare: number;
  tags?: string[];
  notes?: string;
  seats: {
    total: number;
    available: number;
    reserved?: number;
    confirmed?: number;
  };
  driver?: {
    name: string;
    rating?: number;
    phone?: string;
    photo?: string;
  };
  status?: RideStatus;
};

const availableRides: Ride[] = [
  {
    id: 101,
    route: 'T. Nagar → Chennai Central',
    pickup: 'Panagal Park, T. Nagar',
    drop: 'Central Station Gate 2',
    time: '08:30 AM',
    fare: 50,
    seats: { total: 4, available: 2 },
    tags: ['Morning Rush', 'AC Auto'],
  },
  {
    id: 102,
    route: 'Anna Nagar → Marina Beach',
    pickup: 'Anna Nagar Tower Park',
    drop: 'Marina North Parking',
    time: '05:30 PM',
    fare: 65,
    seats: { total: 3, available: 1 },
    tags: ['Evening', 'Family Friendly'],
  },
  {
    id: 103,
    route: 'Adyar → Guindy Industrial Estate',
    pickup: 'Indira Nagar MRTS',
    drop: 'Guindy Metro',
    time: '09:15 AM',
    fare: 55,
    seats: { total: 4, available: 3 },
    tags: ['Work Commute'],
  },
];

const myOfferedRides: Ride[] = [
  {
    id: 201,
    route: 'Velachery → Taramani',
    pickup: 'Phoenix Mall Entrance',
    drop: 'Tidel Park Gate 1',
    time: '09:00 AM',
    fare: 40,
    seats: { total: 3, available: 1, reserved: 1, confirmed: 1 },
    notes: 'Helmets provided. Please be on time.',
  },
];

const myJoinedRides: Ride[] = [
  {
    id: 301,
    route: 'Chromepet → Tambaram',
    pickup: 'Chromepet Railway Station',
    drop: 'Tambaram Bus Stand',
    time: '06:45 PM',
    fare: 35,
    seats: { total: 3, available: 0, confirmed: 3 },
    driver: { name: 'Praveen', rating: 4.7 },
  },
];

const pastOfferedRides: Ride[] = [
  {
    id: 401,
    route: 'Perambur → Egmore',
    pickup: 'Perambur Bus Depot',
    drop: 'Egmore Museum',
    time: '07:00 AM',
    date: '12 Jan 2024',
    fare: 45,
    seats: { total: 3, available: 0, confirmed: 3 },
    status: 'completed',
  },
  {
    id: 402,
    route: 'Madipakkam → Saidapet',
    pickup: 'Madipakkam Main Road',
    drop: 'Saidapet Court',
    time: '09:30 PM',
    date: '05 Jan 2024',
    fare: 60,
    seats: { total: 3, available: 3 },
    status: 'cancelled',
    notes: 'Cancelled due to rain.',
  },
];

const pastJoinedRides: Ride[] = [
  {
    id: 501,
    route: 'Pallavaram → Guindy',
    pickup: 'Pallavaram Bus Stop',
    drop: 'Guindy Kathipara',
    time: '08:10 AM',
    date: '10 Jan 2024',
    fare: 40,
    seats: { total: 4, available: 0, confirmed: 4 },
    status: 'completed',
  },
  {
    id: 502,
    route: 'Thiruvanmiyur → Koyambedu',
    pickup: 'Thiruvanmiyur RTO',
    drop: 'Koyambedu Omni Bus Stand',
    time: '07:40 AM',
    date: '02 Jan 2024',
    fare: 70,
    seats: { total: 4, available: 1 },
    status: 'no-show',
    notes: 'Host was unavailable at pickup point.',
  },
];

const allKnownRides = [
  ...availableRides,
  ...myOfferedRides,
  ...myJoinedRides,
  ...pastOfferedRides,
  ...pastJoinedRides,
];

type RideCardProps = {
  ride: Ride;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  to?: string;
};

const RideCard: React.FC<RideCardProps> = ({ ride, actions, footer, to }) => {
  const card = (
    <div className="bg-white/90 dark:bg-amber-900/40 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-100/70 dark:border-amber-700/60 transition-transform hover:-translate-y-1 hover:shadow-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-200 text-lg font-semibold">
              <TruckIcon className="h-5 w-5" aria-hidden="true" />
              <span>{ride.route}</span>
            </div>
            <p className="text-sm text-amber-600/80 dark:text-amber-100/70 mt-1">
              ஆட்டோ பகிர்வு பயணம்
            </p>
          </div>
          <div className="flex items-center gap-1 text-green-600 dark:text-green-300 text-base font-semibold">
            <CurrencyRupeeIcon className="h-5 w-5" aria-hidden="true" />
            <span>{ride.fare}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <MapPinIcon className="h-5 w-5 text-amber-500" aria-hidden="true" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100">Pickup / பிக்கப்</p>
              <p className="text-amber-700/90 dark:text-amber-200/80">{ride.pickup}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPinIcon className="h-5 w-5 rotate-180 text-amber-500" aria-hidden="true" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100">Drop / இறங்கும் இடம்</p>
              <p className="text-amber-700/90 dark:text-amber-200/80">{ride.drop}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ClockIcon className="h-5 w-5 text-amber-500" aria-hidden="true" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100">Departure / புறப்படும் நேரம்</p>
              <p className="text-amber-700/90 dark:text-amber-200/80">{ride.time}</p>
              {ride.date && (
                <p className="text-xs text-amber-600/70 dark:text-amber-100/60">{ride.date}</p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <UserGroupIcon className="h-5 w-5 text-amber-500" aria-hidden="true" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100">Seats / இருக்கைகள்</p>
              <p className="text-amber-700/90 dark:text-amber-200/80">
                {ride.seats.available} / {ride.seats.total} available
              </p>
            </div>
          </div>
        </div>

        {ride.tags && ride.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {ride.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-amber-100/80 dark:bg-amber-800/60 text-amber-700 dark:text-amber-200 px-3 py-1 text-xs font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {ride.notes && (
          <div className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-100">
            <InformationCircleIcon className="h-5 w-5 flex-shrink-0 text-amber-500" aria-hidden="true" />
            <p>{ride.notes}</p>
          </div>
        )}

        {footer && <div className="pt-3 border-t border-amber-100 dark:border-amber-800">{footer}</div>}

        {actions && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-dashed border-amber-100 dark:border-amber-700">
            {actions}
          </div>
        )}
      </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded-xl"
      >
        {card}
      </Link>
    );
  }

  return card;
};

const StatusBadge: React.FC<{ status?: RideStatus }> = ({ status }) => {
  if (!status || status === 'scheduled') {
    return null;
  }

  const iconMap: Record<RideStatus, React.ReactNode> = {
    scheduled: null,
    completed: <CheckCircleSolidIcon className="h-4 w-4" aria-hidden="true" />,
    cancelled: <XCircleSolidIcon className="h-4 w-4" aria-hidden="true" />,
    'no-show': <ExclamationTriangleSolidIcon className="h-4 w-4" aria-hidden="true" />,
  };

  const labelMap: Record<RideStatus, string> = {
    scheduled: '',
    completed: 'Completed / நிறைவு பெற்றது',
    cancelled: 'Cancelled / ரத்து',
    'no-show': 'No Show / வரவில்லை',
  };

  const colorMap: Record<RideStatus, string> = {
    scheduled: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-200',
    'no-show': 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-100',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${colorMap[status]}`}
    >
      {iconMap[status]}
      {labelMap[status]}
    </span>
  );
};

const PageHeader: React.FC<{ title: string; subtitle: string; actions?: React.ReactNode }> = ({
  title,
  subtitle,
  actions,
}) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100">{title}</h1>
      <p className="text-amber-700/80 dark:text-amber-200/70 text-sm">{subtitle}</p>
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

const AutoSharePage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <PageHeader
        title="Auto Share Rides"
        subtitle="ஒத்த சயண பயணங்களை பகிர்ந்து கொள்ளுங்கள்"
        actions={
          <div className="flex gap-2">
            <Link
              to="/auto-share/create"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 text-white px-4 py-2 text-sm font-semibold shadow-lg shadow-amber-600/30 hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            >
              <PlusIcon className="h-5 w-5" aria-hidden="true" />
              Offer a Ride
            </Link>
            <Link
              to="/auto-share/my"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-700 bg-white/80 dark:bg-amber-900/40 text-amber-800 dark:text-amber-100 px-4 py-2 text-sm font-semibold shadow-sm hover:border-amber-300 hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            >
              My Rides
            </Link>
          </div>
        }
      />

      {availableRides.length === 0 ? (
        <div className="text-center bg-white/70 dark:bg-amber-900/30 rounded-2xl border border-amber-100 dark:border-amber-800 p-10">
          <TruckIcon className="h-12 w-12 mx-auto text-amber-400" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-amber-800 dark:text-amber-100">
            No rides available right now
          </h2>
          <p className="text-sm text-amber-600 dark:text-amber-200">தற்போது பயணங்கள் இல்லை. விரைவில் மீண்டும் பாருங்கள்.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {availableRides.map((ride) => (
            <RideCard key={ride.id} ride={ride} to={`/auto-share/${ride.id}`} footer={<StatusBadge status={ride.status} />} />
          ))}
        </div>
      )}
    </div>
  );
};

const AutoShareDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ride = useMemo(() => allKnownRides.find((item) => item.id === Number(id)), [id]);
  const [modalOpen, setModalOpen] = useState(false);
  const [joinState, setJoinState] = useState<'idle' | 'reserved' | 'confirmed'>('idle');

  const seatMarkers = useMemo(() => {
    if (!ride) {
      return [];
    }

    const markers: { key: string; label: string; color: string }[] = [];
    const confirmed = joinState === 'confirmed' ? 1 : ride.seats.confirmed ?? 0;
    const reserved = joinState === 'reserved' ? 1 : ride.seats.reserved ?? 0;
    const available = Math.max(ride.seats.total - confirmed - reserved, 0);

    for (let i = 0; i < confirmed; i += 1) {
      markers.push({ key: `confirmed-${i}`, label: 'Confirmed', color: 'bg-green-500' });
    }
    for (let i = 0; i < reserved; i += 1) {
      markers.push({ key: `reserved-${i}`, label: 'Reserved', color: 'bg-amber-500' });
    }
    for (let i = 0; i < available; i += 1) {
      markers.push({ key: `available-${i}`, label: 'Available', color: 'bg-slate-300 dark:bg-slate-600' });
    }

    return markers;
  }, [ride, joinState]);

  if (!ride) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <ArrowLeftIcon className="h-10 w-10 mx-auto text-amber-500" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-100">Ride not found</h2>
        <p className="text-sm text-amber-600 dark:text-amber-200">பயணம் கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-amber-700"
        >
          <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <PageHeader
        title="Ride Details"
        subtitle="பயண விவரங்கள்"
        actions={
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-700 px-4 py-2 text-sm font-semibold text-amber-800 dark:text-amber-100 hover:bg-amber-50/70 dark:hover:bg-amber-900/30"
          >
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
            Back
          </button>
        }
      />

      <RideCard
        ride={ride}
        footer={
          ride.driver ? (
            <div className="flex items-center justify-between flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-3">
                {ride.driver.photo ? (
                  <img src={ride.driver.photo} alt={ride.driver.name} className="h-10 w-10 rounded-full object-cover border border-amber-200" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-semibold">
                    {ride.driver.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-100">{ride.driver.name}</p>
                  {ride.driver.rating && (
                    <p className="text-xs text-amber-600 dark:text-amber-200">
                      Rating: {ride.driver.rating.toFixed(1)} ★
                    </p>
                  )}
                </div>
              </div>
              {ride.driver.phone && (
                <a
                  href={`tel:${ride.driver.phone}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-700 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-100"
                >
                  Call Driver
                </a>
              )}
            </div>
          ) : null
        }
        actions={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-amber-700 disabled:opacity-60"
              disabled={joinState !== 'idle'}
            >
              Join Ride / சேரவும்
            </button>
            {joinState === 'reserved' && (
              <button
                type="button"
                onClick={() => setJoinState('confirmed')}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 dark:border-amber-700 px-4 py-2 text-sm font-semibold text-amber-800 dark:text-amber-100 hover:bg-amber-50/70 dark:hover:bg-amber-900/30"
              >
                Check In / பதிவு செய்யவும்
              </button>
            )}
          </>
        }
      />

      <div className="bg-white/90 dark:bg-amber-900/40 rounded-2xl border border-amber-100 dark:border-amber-800 shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
          Seat Status / இருக்கை நிலை
        </h2>
        <div className="flex flex-wrap gap-3">
          {seatMarkers.map((marker) => (
            <span
              key={marker.key}
              className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-xs font-semibold text-white ${marker.color}`}
            >
              {marker.label.charAt(0)}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-amber-700 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" /> Confirmed / உறுதி செய்யப்பட்டது
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" /> Reserved / முன்பதிவு
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" /> Available / காலி இருக்கைகள்
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
          <div className="max-w-md w-full bg-white dark:bg-amber-950 rounded-2xl shadow-xl border border-amber-100 dark:border-amber-800 p-6 space-y-5">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
              <div>
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">Confirm Your Seat</h3>
                <p className="text-sm text-amber-700 dark:text-amber-200">
                  Are you sure you want to reserve a seat for this ride? / இந்த பயணத்திற்கான இருக்கையை உறுதிப்படுத்தவா?
                </p>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="inline-flex items-center justify-center rounded-xl border border-amber-200 dark:border-amber-700 px-4 py-2 text-sm font-semibold text-amber-800 dark:text-amber-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setJoinState('reserved');
                  setModalOpen(false);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-amber-700"
              >
                Confirm Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AutoShareCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    route: '',
    pickup: '',
    drop: '',
    time: '',
    fare: '',
    seats: 3,
    notes: '',
  });
  const [submitted, setSubmitted] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = <K extends keyof typeof formState>(key: K, value: typeof formState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (!formState.route || !formState.pickup || !formState.drop || !formState.time || !formState.fare) {
      setSubmitted('error');
      return;
    }
    setSubmitted('success');
    setTimeout(() => navigate('/auto-share/my'), 750);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <PageHeader
        title="Offer an Auto Ride"
        subtitle="ஆட்டோ பயணத்தை பகிர்ந்து கொள்ளுங்கள்"
        actions={
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-700 px-4 py-2 text-sm font-semibold text-amber-800 dark:text-amber-100 hover:bg-amber-50/70 dark:hover:bg-amber-900/30"
          >
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
            Back
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6 bg-white/90 dark:bg-amber-900/40 rounded-2xl border border-amber-100 dark:border-amber-800 shadow p-6">
        {submitted !== 'idle' && (
          <div
            className={`rounded-xl p-4 flex items-start gap-3 text-sm ${
              submitted === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {submitted === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5" aria-hidden="true" />
            )}
            <div>
              <p className="font-semibold">
                {submitted === 'success' ? 'Ride posted successfully!' : 'Please fill all required fields.'}
              </p>
              <p>{submitted === 'success' ? 'பயணம் வெற்றிகரமாக சேர்க்கப்பட்டது.' : 'தேவையான அனைத்து விவரங்களையும் நிரப்பவும்.'}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm font-semibold text-amber-800 dark:text-amber-100">
            Route (English)
            <input
              type="text"
              value={formState.route}
              onChange={(event) => handleChange('route', event.target.value)}
              className="rounded-xl border border-amber-200 dark:border-amber-700 bg-white/80 dark:bg-amber-950/60 px-4 py-2 text-sm text-amber-900 dark:text-amber-100 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="Eg: T. Nagar → Central"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-amber-800 dark:text-amber-100">
            பிக்கப் இடம் (Tamil)
            <input
              type="text"
              value={formState.pickup}
              onChange={(event) => handleChange('pickup', event.target.value)}
              className="rounded-xl border border-amber-200 dark:border-amber-700 bg-white/80 dark:bg-amber-950/60 px-4 py-2 text-sm text-amber-900 dark:text-amber-100 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="உதாரணம்: தவுசன்ட் லைட்ஸ்"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-amber-800 dark:text-amber-100">
            Drop Location
            <input
              type="text"
              value={formState.drop}
              onChange={(event) => handleChange('drop', event.target.value)}
              className="rounded-xl border border-amber-200 dark:border-amber-700 bg-white/80 dark:bg-amber-950/60 px-4 py-2 text-sm text-amber-900 dark:text-amber-100 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="Eg: Marina Beach"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-amber-800 dark:text-amber-100">
            Time / நேரம்
            <input
              type="time"
              value={formState.time}
              onChange={(event) => handleChange('time', event.target.value)}
              className="rounded-xl border border-amber-200 dark:border-amber-700 bg-white/80 dark:bg-amber-950/60 px-4 py-2 text-sm text-amber-900 dark:text-amber-100 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex flex-col gap-1 text-sm font-semibold text-amber-800 dark:text-amber-100">
            Fare (₹)
            <input
              type="number"
              min={0}
              value={formState.fare}
              onChange={(event) => handleChange('fare', event.target.value)}
              className="rounded-xl border border-amber-200 dark:border-amber-700 bg-white/80 dark:bg-amber-950/60 px-4 py-2 text-sm text-amber-900 dark:text-amber-100 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="50"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-amber-800 dark:text-amber-100">
            Total Seats
            <input
              type="number"
              min={1}
              max={6}
              value={formState.seats}
              onChange={(event) => handleChange('seats', Number(event.target.value))}
              className="rounded-xl border border-amber-200 dark:border-amber-700 bg-white/80 dark:bg-amber-950/60 px-4 py-2 text-sm text-amber-900 dark:text-amber-100 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => handleChange('seats', Math.min(formState.seats + 1, 6))}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-800/60 dark:text-amber-200 px-4 py-2 text-sm font-semibold"
            >
              <PlusIcon className="h-4 w-4" aria-hidden="true" />
              Add Seat
            </button>
          </div>
        </div>

        <label className="flex flex-col gap-1 text-sm font-semibold text-amber-800 dark:text-amber-100">
          Additional Notes / கூடுதல் குறிப்புகள்
          <textarea
            value={formState.notes}
            onChange={(event) => handleChange('notes', event.target.value)}
            rows={4}
            className="rounded-xl border border-amber-200 dark:border-amber-700 bg-white/80 dark:bg-amber-950/60 px-4 py-2 text-sm text-amber-900 dark:text-amber-100 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            placeholder="Share helpful details about the ride"
          />
        </label>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/auto-share')}
            className="inline-flex items-center justify-center rounded-xl border border-amber-200 dark:border-amber-700 px-4 py-2 text-sm font-semibold text-amber-800 dark:text-amber-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 text-white px-5 py-2 text-sm font-semibold shadow hover:bg-amber-700"
          >
            Submit Ride
          </button>
        </div>
      </form>
    </div>
  );
};

const AutoShareMyRidesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'offered' | 'joined'>('offered');

  const tabs: { key: 'offered' | 'joined'; label: string; subtitle: string }[] = [
    { key: 'offered', label: 'Offered Rides', subtitle: 'நான் வழங்கியவை' },
    { key: 'joined', label: 'Joined Rides', subtitle: 'நான் சேர்ந்தவை' },
  ];

  const ridesForTab = activeTab === 'offered' ? myOfferedRides : myJoinedRides;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <PageHeader
        title="My Auto Share Dashboard"
        subtitle="என் ஆட்டோ பகிர்வு பலகை"
        actions={
          <Link
            to="/auto-share/history"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-700 px-4 py-2 text-sm font-semibold text-amber-800 dark:text-amber-100 hover:bg-amber-50/70 dark:hover:bg-amber-900/30"
          >
            View History
          </Link>
        }
      />

      <div className="bg-white/90 dark:bg-amber-900/40 rounded-2xl border border-amber-100 dark:border-amber-800 shadow">
        <div className="grid grid-cols-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center justify-center px-4 py-4 text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-700 dark:text-amber-200 hover:bg-amber-50/80 dark:hover:bg-amber-900/30'
              }`}
            >
              {tab.label}
              <span className="text-xs font-normal opacity-80">{tab.subtitle}</span>
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {ridesForTab.length === 0 ? (
            <div className="text-center py-10 text-sm text-amber-700 dark:text-amber-200">
              {activeTab === 'offered' ? 'You have not offered any rides yet.' : 'You have not joined any rides yet.'}
            </div>
          ) : (
            ridesForTab.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                footer={<StatusBadge status={ride.status} />}
                actions={
                  <>
                    {activeTab === 'offered' ? (
                      <button
                        type="button"
                        className="flex-1 inline-flex items-center justify-center rounded-xl border border-amber-200 dark:border-amber-700 px-4 py-2 text-sm font-semibold text-amber-800 dark:text-amber-100"
                      >
                        Manage Ride
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="flex-1 inline-flex items-center justify-center rounded-xl border border-red-200 text-red-600 dark:border-red-700 dark:text-red-300 px-4 py-2 text-sm font-semibold"
                      >
                        Leave Ride
                      </button>
                    )}
                  </>
                }
              />
            ))
          )}
        </div>
      </div>

      <Link
        to="/auto-share/create"
        className="fixed bottom-6 right-6 inline-flex items-center justify-center rounded-full bg-amber-600 text-white h-14 w-14 shadow-xl shadow-amber-600/40 hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
      >
        <PlusIcon className="h-6 w-6" aria-hidden="true" />
        <span className="sr-only">Create new ride</span>
      </Link>
    </div>
  );
};

const AutoShareHistoryPage: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<{ offered: boolean; joined: boolean }>({
    offered: true,
    joined: false,
  });

  const toggle = (key: 'offered' | 'joined') => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderHistoryCards = (rides: Ride[]) => (
    <div className="space-y-4 mt-4">
      {rides.map((ride) => (
        <RideCard
          key={ride.id}
          ride={ride}
          footer={
            <div className="flex items-center justify-between flex-wrap gap-2">
              <StatusBadge status={ride.status} />
              {ride.status === 'completed' && (
                <span className="text-xs text-green-600 dark:text-green-300 font-semibold">
                  Verified completion
                </span>
              )}
            </div>
          }
        />
      ))}
    </div>
  );

  const hasNoHistory = pastOfferedRides.length === 0 && pastJoinedRides.length === 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <PageHeader title="Ride History" subtitle="முந்தைய பயணங்கள்" />

      {hasNoHistory ? (
        <div className="text-center bg-white/90 dark:bg-amber-900/40 rounded-2xl border border-amber-100 dark:border-amber-800 p-10">
          <InformationCircleIcon className="h-12 w-12 mx-auto text-amber-500" aria-hidden="true" />
          <h3 className="mt-4 text-lg font-semibold text-amber-800 dark:text-amber-100">No past rides yet</h3>
          <p className="text-sm text-amber-600 dark:text-amber-200">உங்கள் முந்தைய பயணங்கள் இங்கு தோன்றும்.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white/90 dark:bg-amber-900/40 rounded-2xl border border-amber-100 dark:border-amber-800 shadow p-6">
            <button
              type="button"
              onClick={() => toggle('offered')}
              className="flex w-full items-center justify-between text-left"
            >
              <div>
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                  Past Offered Rides
                </h3>
                <p className="text-sm text-amber-600 dark:text-amber-200">முந்தைய வழங்கிய பயணங்கள்</p>
              </div>
              <ArrowLeftIcon
                className={`h-5 w-5 text-amber-600 transition-transform ${expandedSections.offered ? 'rotate-90' : '-rotate-90'}`}
                aria-hidden="true"
              />
            </button>
            {expandedSections.offered && renderHistoryCards(pastOfferedRides)}
          </div>

          <div className="bg-white/90 dark:bg-amber-900/40 rounded-2xl border border-amber-100 dark:border-amber-800 shadow p-6">
            <button
              type="button"
              onClick={() => toggle('joined')}
              className="flex w-full items-center justify-between text-left"
            >
              <div>
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                  Past Joined Rides
                </h3>
                <p className="text-sm text-amber-600 dark:text-amber-200">முந்தைய சேர்ந்த பயணங்கள்</p>
              </div>
              <ArrowLeftIcon
                className={`h-5 w-5 text-amber-600 transition-transform ${expandedSections.joined ? 'rotate-90' : '-rotate-90'}`}
                aria-hidden="true"
              />
            </button>
            {expandedSections.joined && renderHistoryCards(pastJoinedRides)}
          </div>
        </div>
      )}
    </div>
  );
};

export {
    AutoShareCreatePage, AutoShareDetailPage, AutoShareHistoryPage, AutoShareMyRidesPage, AutoSharePage
};

export default AutoSharePage;