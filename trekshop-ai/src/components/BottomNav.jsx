import { HomeIcon, CatalogIcon, HeartIcon, UserIcon, ChatIcon } from './Icons';

export const BottomNav = ({ activeTab = 'home', onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', Icon: HomeIcon },
    { id: 'catalog', label: 'Catalog', Icon: CatalogIcon },
    { id: 'favorites', label: 'Favorites', Icon: HeartIcon },
    { id: 'account', label: 'Account', Icon: UserIcon },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex items-center justify-around z-40">
      {tabs.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange?.(id)}
            className={`flex flex-col items-center gap-0.5 ${isActive ? 'text-decathlonBlue' : 'text-gray-400'}`}
          >
            <Icon className="h-6 w-6" filled={isActive} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export const AIConciergeButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute bottom-24 right-4 z-50 bg-white text-gray-700 flex items-center justify-center gap-2 px-4 py-3 rounded-full shadow-xl border border-gray-200 animate-subtle-pulse transition-all active:scale-95"
  >
    <div className="w-6 h-6 bg-decathlonBlue rounded-full flex items-center justify-center">
      <ChatIcon className="h-4 w-4 text-white" />
    </div>
    <span className="font-bold text-sm tracking-tight">AI Concierge</span>
  </button>
);
