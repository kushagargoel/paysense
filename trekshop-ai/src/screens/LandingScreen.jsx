import { useState, useEffect } from 'react';
import { MenuIcon, SearchIcon, CartIcon, FilterIcon, ChevronRightIcon } from '../components/Icons';
import { BottomNav, AIConciergeButton } from '../components/BottomNav';
import dummyData from '../../dummy_data.json';

export const LandingScreen = ({ onOpenChat, onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [products, setProducts] = useState([]);

  // Load products from dummy data
  useEffect(() => {
    // Transform dummy data products to match the expected format
    const transformedProducts = dummyData.products.map(p => ({
      id: p.id,
      brand: p.name.split(' ')[0], // Extract brand from name
      name: p.name,
      price: p.price,
      originalPrice: null,
      rating: p.rating,
      reviews: p.reviews,
      badge: p.promo_eligible ? 'SALE' : null,
      image: p.image,
      category: p.category,
      description: p.description,
      priceDisplay: `₹${p.price.toLocaleString()}`,
    }));
    setProducts(transformedProducts);
  }, []);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'Footwear', label: 'Shoes' },
    { id: 'Backpacks', label: 'Backpacks' },
    { id: 'Clothing', label: 'Clothing' },
    { id: 'Accessories', label: 'Accessories' },
  ];

  const filteredProducts = activeFilter === 'all'
    ? products.slice(0, 4)
    : products.filter(p => p.category === activeFilter).slice(0, 4);

  return (
    <div className="min-h-screen pb-20 bg-lightGray">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-4">
            <button className="p-1">
              <MenuIcon className="h-6 w-6 text-decathlonBlue" />
            </button>
            <div className="text-2xl font-black italic text-decathlonBlue tracking-tighter">
              DECATHLON
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-1">
              <SearchIcon className="h-6 w-6 text-gray-600" />
            </button>
            <button className="p-1 relative">
              <CartIcon className="h-6 w-6 text-gray-600" />
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">0</span>
            </button>
          </div>
        </div>
        {/* Search Bar Sub-header */}
        <div className="px-4 pb-3">
          <div className="bg-gray-100 flex items-center px-3 py-2 rounded-md">
            <span className="text-sm text-gray-500">Search for gear, brands...</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        {/* Category Header */}
        <div className="mb-6">
          <nav className="flex text-xs text-gray-500 mb-2">
            <ol className="flex list-none p-0">
              <li className="flex items-center">
                <a href="#" className="hover:text-decathlonBlue">Home</a>
                <ChevronRightIcon className="h-3 w-3 mx-1" />
              </li>
              <li className="flex items-center">
                <a href="#" className="hover:text-decathlonBlue">Outdoor</a>
                <ChevronRightIcon className="h-3 w-3 mx-1" />
              </li>
              <li className="text-gray-800 font-semibold">Trekking Gear</li>
            </ol>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Mountain Trekking</h1>
          <p className="text-sm text-gray-600 mt-1">Equip yourself for the great outdoors</p>
        </div>

        {/* Filter/Sort Bar */}
        <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar">
          <button className="whitespace-nowrap px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium flex items-center gap-1">
            <FilterIcon className="h-4 w-4" />
            Filters
          </button>
          {filters.slice(1).map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === filter.id
                  ? 'bg-decathlonBlue text-white'
                  : 'bg-white border border-gray-300'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onNavigate?.('chat')}
            />
          ))}
        </div>
      </main>

      {/* AI Concierge Floating Button */}
      <AIConciergeButton onClick={onOpenChat} />

      {/* Bottom Navigation */}
      <BottomNav activeTab="home" onTabChange={onNavigate} />
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, onClick }) => {
  const { brand, name, price, rating, reviews, badge, image, priceDisplay } = product;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col cursor-pointer active:scale-[0.98] transition-transform"
    >
      <div className="relative h-28 bg-gray-50">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        {badge && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
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
                <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-[10px] text-gray-500">{rating} ({reviews})</span>
            </div>
          )}
          <p className="text-lg font-bold text-gray-900">{priceDisplay || `₹${price.toLocaleString()}`}</p>
        </div>
      </div>
    </div>
  );
};
