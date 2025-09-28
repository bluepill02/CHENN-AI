import { Vendor } from '../../types/foodhunt';
import { priceLevelToSymbols } from '../../utils/foodFormatters';
import PillBadge from './PillBadge';
import RatingStars from './RatingStars';

interface VendorHeaderProps {
  vendor: Vendor;
}

export function VendorHeader({ vendor }: VendorHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-3">
          <div className="text-maroon font-semibold text-lg">{vendor.nameEn}</div>
          <div className="text-sm text-turmeric">{vendor.nameTa}</div>
          <PillBadge className="bg-ivory text-maroon border border-turmeric">{vendor.areaEn} • {vendor.areaTa}</PillBadge>
        </div>
        <div className="text-xs text-slate-600 mt-1">{vendor.cuisines.join(' • ')}</div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <RatingStars value={vendor.rating} />
        </div>
        <div className="flex items-center gap-2">
          <PillBadge className={` ${vendor.openNow ? 'bg-green-600 text-white' : 'bg-gray-200 text-slate-700'}`}>{vendor.openNow ? 'Open' : 'Closed'}</PillBadge>
          <PillBadge className="bg-ivory text-maroon border border-turmeric">{priceLevelToSymbols(vendor.priceLevel)}</PillBadge>
        </div>
      </div>
    </div>
  );
}

export default VendorHeader;
