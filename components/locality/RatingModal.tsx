import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Star } from 'lucide-react';

interface RatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  localityName: string;
  initialValue?: number;
  onSubmit: (rating: number, comment?: string) => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({ open, onOpenChange, localityName, initialValue = 5, onSubmit }) => {
  const [rating, setRating] = React.useState<number>(initialValue);
  const [comment, setComment] = React.useState<string>('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setRating(initialValue);
      setComment('');
    }
  }, [open, initialValue]);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) return;
    setSubmitting(true);
    try {
      await Promise.resolve();
      onSubmit(rating, comment || undefined);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate {localityName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`p-2 rounded-full ${n <= rating ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-600'}`}
                  aria-label={`Rate ${n}`}
                >
                  <Star className="w-4 h-4" />
                </button>
              ))}
              <div className="ml-3 text-sm text-gray-600">{rating} / 5</div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Comments (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded-md p-2 text-sm"
              rows={3}
              placeholder="Share a short note about your experience"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-amber-500 text-white">{submitting ? 'Saving...' : 'Submit Rating'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;
