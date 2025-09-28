import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFoodHunt } from '../../services/FoodHuntService';
import { Button } from '../ui/button';

export default function FoodHuntCreate() {
  const navigate = useNavigate();
  const { submitSuggestion, pendingSubmissions, isUsingBackend } = useFoodHunt();
  const [vendorNameEn, setVendorNameEn] = useState('');
  const [vendorNameTa, setVendorNameTa] = useState('');
  const [areaEn, setAreaEn] = useState('');
  const [areaTa, setAreaTa] = useState('');
  const [vegType, setVegType] = useState<'veg' | 'non-veg' | 'mixed'>('veg');
  const [priceLevel, setPriceLevel] = useState<1 | 2 | 3>(1);
  const [cuisinesText, setCuisinesText] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [dishNameEn, setDishNameEn] = useState('');
  const [dishNameTa, setDishNameTa] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishSpice, setDishSpice] = useState(1);
  const [notes, setNotes] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [submittedByContact, setSubmittedByContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cuisines = useMemo(
    () => cuisinesText.split(',').map(item => item.trim()).filter(Boolean),
    [cuisinesText]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!vendorNameEn || !areaEn) {
      setError('Vendor name and area are required to submit a spot.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitSuggestion({
        vendorNameEn,
        vendorNameTa: vendorNameTa || undefined,
        areaEn,
        areaTa: areaTa || undefined,
        cuisines: cuisines.length > 0 ? cuisines : ['Chennai favourite'],
        vegType,
        priceLevel,
        contactNumber: contactNumber || undefined,
        instagramHandle: instagramHandle || undefined,
        whatsappNumber: whatsappNumber || undefined,
        signatureDish: dishNameEn
          ? {
              nameEn: dishNameEn,
              nameTa: dishNameTa || undefined,
              price: dishPrice ? Number(dishPrice) : undefined,
              spicyLevel: dishSpice,
              isSignature: true,
            }
          : undefined,
        notes: notes || undefined,
        submittedBy: submittedBy || undefined,
        submittedByContact: submittedByContact || undefined,
      });

      setMessage(
        result.status === 'synced'
          ? 'Submitted to Chennai Food Hunt backend. Thanks for sharing!'
          : 'Saved locally and will sync once internet or backend is available.'
      );

      setVendorNameEn('');
      setVendorNameTa('');
      setAreaEn('');
      setAreaTa('');
      setVegType('veg');
      setPriceLevel(1);
      setCuisinesText('');
      setContactNumber('');
      setInstagramHandle('');
      setWhatsappNumber('');
      setDishNameEn('');
      setDishNameTa('');
      setDishPrice('');
      setDishSpice(1);
      setNotes('');
      setSubmittedBy('');
      setSubmittedByContact('');
    } catch (submissionError) {
      console.error('Unable to submit food hunt suggestion', submissionError);
      setError('Something went wrong while saving your suggestion. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-ivory">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-maroon">Share a Food Hunt spot</h1>
            <p className="text-sm text-slate-600">
              {isUsingBackend
                ? 'Your submission goes straight to the Chennai curation squad.'
                : 'Offline mode active — we will queue and sync once backend is reachable.'}
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl shadow-md space-y-4">
          {message && <div className="p-3 rounded bg-emerald-50 text-emerald-700 text-sm">{message}</div>}
          {error && <div className="p-3 rounded bg-rose-50 text-rose-700 text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col text-sm text-slate-700">
              Vendor name (English)
              <input
                value={vendorNameEn}
                onChange={event => setVendorNameEn(event.target.value)}
                required
                className="mt-1 border rounded px-3 py-2"
                placeholder="Eg. Amma's Kitchen"
              />
            </label>
            <label className="flex flex-col text-sm text-slate-700">
              Vendor name (Tamil)
              <input
                value={vendorNameTa}
                onChange={event => setVendorNameTa(event.target.value)}
                className="mt-1 border rounded px-3 py-2"
                placeholder="எ.கா. அம்மாவின் சமையல்"
              />
            </label>
            <label className="flex flex-col text-sm text-slate-700">
              Area (English)
              <input
                value={areaEn}
                onChange={event => setAreaEn(event.target.value)}
                required
                className="mt-1 border rounded px-3 py-2"
                placeholder="Eg. T. Nagar"
              />
            </label>
            <label className="flex flex-col text-sm text-slate-700">
              Area (Tamil)
              <input
                value={areaTa}
                onChange={event => setAreaTa(event.target.value)}
                className="mt-1 border rounded px-3 py-2"
                placeholder="தி. நகர்"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex flex-col text-sm text-slate-700">
              Veg preference
              <select
                value={vegType}
                onChange={event => setVegType(event.target.value as typeof vegType)}
                className="mt-1 border rounded px-3 py-2"
              >
                <option value="veg">Pure veg</option>
                <option value="non-veg">Non-veg</option>
                <option value="mixed">Mixed</option>
              </select>
            </label>
            <label className="flex flex-col text-sm text-slate-700">
              Price level
              <select
                value={priceLevel}
                onChange={event => setPriceLevel(Number(event.target.value) as typeof priceLevel)}
                className="mt-1 border rounded px-3 py-2"
              >
                <option value={1}>₹ - Budget</option>
                <option value={2}>₹₹ - Moderate</option>
                <option value={3}>₹₹₹ - Premium</option>
              </select>
            </label>
            <label className="flex flex-col text-sm text-slate-700">
              Signature dish spice level
              <input
                type="number"
                min={0}
                max={3}
                value={dishSpice}
                onChange={event => setDishSpice(Number(event.target.value) || 0)}
                className="mt-1 border rounded px-3 py-2"
              />
            </label>
          </div>

          <label className="flex flex-col text-sm text-slate-700">
            Cuisines (comma separated)
            <input
              value={cuisinesText}
              onChange={event => setCuisinesText(event.target.value)}
              className="mt-1 border rounded px-3 py-2"
              placeholder="Eg. South Indian, Filter Coffee"
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex flex-col text-sm text-slate-700">
              Contact number
              <input
                value={contactNumber}
                onChange={event => setContactNumber(event.target.value)}
                className="mt-1 border rounded px-3 py-2"
                placeholder="98765 43210"
              />
            </label>
            <label className="flex flex-col text-sm text-slate-700">
              Instagram handle
              <input
                value={instagramHandle}
                onChange={event => setInstagramHandle(event.target.value)}
                className="mt-1 border rounded px-3 py-2"
                placeholder="@chennai_delish"
              />
            </label>
            <label className="flex flex-col text-sm text-slate-700">
              WhatsApp number
              <input
                value={whatsappNumber}
                onChange={event => setWhatsappNumber(event.target.value)}
                className="mt-1 border rounded px-3 py-2"
                placeholder="for pre-orders"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col text-sm text-slate-700">
              Signature dish (English)
              <input
                value={dishNameEn}
                onChange={event => setDishNameEn(event.target.value)}
                className="mt-1 border rounded px-3 py-2"
                placeholder="Eg. Soft Cloud Idli"
              />
            </label>
            <label className="flex flex-col text-sm text-slate-700">
              Signature dish (Tamil)
              <input
                value={dishNameTa}
                onChange={event => setDishNameTa(event.target.value)}
                className="mt-1 border rounded px-3 py-2"
                placeholder="மென்மையான இட்லி"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col text-sm text-slate-700">
              Signature dish price (₹)
              <input
                value={dishPrice}
                onChange={event => setDishPrice(event.target.value)}
                className="mt-1 border rounded px-3 py-2"
                placeholder="Eg. 80"
              />
            </label>
            <label className="flex flex-col text-sm text-slate-700">
              Your name
              <input
                value={submittedBy}
                onChange={event => setSubmittedBy(event.target.value)}
                className="mt-1 border rounded px-3 py-2"
                placeholder="Optional"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col text-sm text-slate-700">
              Your contact (email / phone)
              <input
                value={submittedByContact}
                onChange={event => setSubmittedByContact(event.target.value)}
                className="mt-1 border rounded px-3 py-2"
                placeholder="Optional"
              />
            </label>
            <label className="flex flex-col text-sm text-slate-700">
              Notes or must-try highlights
              <textarea
                value={notes}
                onChange={event => setNotes(event.target.value)}
                className="mt-1 border rounded px-3 py-2"
                rows={3}
                placeholder="Tell Chennai what makes this special!"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-maroon text-white hover:opacity-95" disabled={submitting}>
              {submitting ? 'Saving…' : 'Submit spot'}
            </Button>
          </div>
        </form>

        {pendingSubmissions.length > 0 && (
          <div className="mt-6 p-6 bg-white rounded-xl shadow-sm border border-turmeric/30">
            <h2 className="text-lg font-semibold text-maroon mb-2">Pending sync</h2>
            <p className="text-xs text-slate-600 mb-3">
              These community submissions will automatically sync when the Food Hunt backend is ready.
            </p>
            <ul className="space-y-2">
              {pendingSubmissions.map(submission => (
                <li key={submission.id} className="text-sm text-slate-700 flex items-center justify-between">
                  <span>
                    {submission.vendorNameEn} • {submission.areaEn}
                    <span className="ml-2 text-xs text-amber-600">({submission.status})</span>
                  </span>
                  <span className="text-xs text-slate-500">
                    Added {new Date(submission.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
