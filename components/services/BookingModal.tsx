import React from 'react';
import { bookServiceApi } from '../../services/ServiceDirectoryApiClient';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: number | null;
  serviceName?: string;
  onBooked?: (booking: any) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ open, onOpenChange, serviceId, serviceName, onBooked }) => {
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [time, setTime] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setName(''); setPhone(''); setTime(''); setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    setError(null);
    if (!serviceId) return;
    if (!name.trim()) { setError('Please enter your name'); return; }
    if (!/^\d{7,15}$/.test(phone.trim())) { setError('Please enter a valid phone number'); return; }
    setSubmitting(true);
    try {
      const result = await bookServiceApi(serviceId, {
        name: name.trim(),
        phone: phone.trim(),
        time: time || undefined
      });
      if (result.ok) {
        const bookingInfo = {
          ...(result.booking && typeof result.booking === 'object' ? result.booking as Record<string, unknown> : {}),
          ok: result.ok,
          message: result.message,
        };
        onBooked?.(bookingInfo);
        onOpenChange(false);
      } else {
        setError(result.message || 'Failed to book service');
      }
    } catch (e) {
      setError('Failed to book service');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book {serviceName ?? 'service'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-700 block mb-1">Your name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-700 block mb-1">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., 9840012345" />
          </div>
          <div>
            <label className="text-sm text-gray-700 block mb-1">Preferred time (optional)</label>
            <Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g., Tomorrow 10:00 AM" />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 text-white">{submitting ? 'Booking...' : 'Book'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
