import { useState } from 'react';
import { MenuIcon, SearchIcon, CartIcon, FilterIcon, ChevronRightIcon } from '../components/Icons';
import { ProductCard } from '../components/ProductCard';
import { BottomNav, AIConciergeButton } from '../components/BottomNav';
import { products } from '../data/products';

export const LandingScreen = ({ onOpenChat, onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'Shoes', label: 'Shoes' },
    { id: 'Backpacks', label: 'Backpacks' },
    { id: 'Clothing', label: 'Clothing' },
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
