import { Dish } from '../../types/foodhunt';
import { formatRupees, spicyToEmoji } from '../../utils/foodFormatters';
import PillBadge from './PillBadge';

interface DishCardProps {
  dish: Dish;
}

export function DishCard({ dish, onClick }: DishCardProps & { onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left p-0">
      <div className="p-3 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow flex items-center gap-3">
        <div className="w-20 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
          {dish.imageUrl ? <img src={dish.imageUrl} alt={dish.nameEn} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm text-slate-500">No image</div>}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="font-medium text-maroon">{dish.nameEn}</div>
            <div className="text-sm text-turmeric">{dish.nameTa}</div>
            {dish.isSignature && <PillBadge className="bg-maroon text-white">Signature</PillBadge>}
          </div>
          <div className="text-xs text-slate-600 mt-1 flex items-center gap-2">
            <div>{formatRupees(dish.price)}</div>
            <div>{'•'}</div>
            <div>{spicyToEmoji(dish.spicyLevel)}</div>
          </div>
        </div>
      </div>
    </button>
  );
}

export default DishCard;
