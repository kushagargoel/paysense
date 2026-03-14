import { StarIcon } from './Icons';

export const ProductCard = ({ product, onClick }) => {
  const { brand, name, price, originalPrice, rating, reviews, badge, image, priceDisplay, originalPriceDisplay } = product;

  const displayPrice = priceDisplay || `$${price.toFixed(2)}`;
  const displayOriginalPrice = originalPriceDisplay || (originalPrice ? `$${originalPrice.toFixed(2)}` : null);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col cursor-pointer active:scale-[0.98] transition-transform"
    >
      <div className="relative aspect-square bg-gray-50">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        {badge && (
          <span className={`absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded ${
            badge.includes('-') || badge === 'SALE' ? 'bg-red-600' : 'bg-decathlonBlue'
          }`}>
            {badge}
          </span>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{brand}</p>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{name}</h3>
        </div>
        <div className="mt-2">
          {rating && (
            <div className="flex items-center gap-1 mb-1">
              <div className="flex text-yellow-400">
                <StarIcon className="h-3 w-3" />
              </div>
              <span className="text-[10px] text-gray-500">{rating} ({reviews})</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <p className={`text-lg font-bold ${originalPrice ? 'text-red-600' : 'text-gray-900'}`}>
              {displayPrice}
            </p>
            {displayOriginalPrice && (
              <p className="text-xs text-gray-400 line-through">{displayOriginalPrice}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
