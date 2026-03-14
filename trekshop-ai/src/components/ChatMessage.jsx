import { SmartToyIcon } from './Icons';

export const ChatMessage = ({ message, isUser, timestamp, children }) => {
  return (
    <div className={`flex flex-col ${isUser ? 'items-end max-w-[85%] ml-auto' : 'items-start max-w-[85%]'}`}>
      <div className={`p-4 rounded-2xl shadow-sm ${
        isUser
          ? 'bg-decathlonBlue text-white rounded-tr-none'
          : 'bg-gray-100 text-gray-800 rounded-tl-none'
      }`}>
        {children || <p className="text-base leading-relaxed">{message}</p>}
      </div>
      <span className="text-[11px] text-gray-400 mt-2 ml-1">
        {isUser ? 'You' : 'AI Concierge'} • {timestamp || 'Just now'}
      </span>
    </div>
  );
};

export const ProductRecommendationCard = ({ product, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-md flex items-center cursor-pointer active:scale-[0.98] transition-transform"
  >
    <img src={product.image} alt={product.name} className="w-24 h-24 object-cover" />
    <div className="p-3 flex-1">
      <h3 className="font-bold text-sm text-gray-900 leading-tight">{product.name}</h3>
      <p className="text-decathlonBlue font-bold text-sm mt-0.5">{product.priceDisplay || `$${product.price}`}</p>
      {product.description && (
        <p className="text-[10px] text-gray-500 mt-1 italic leading-tight">"{product.description}"</p>
      )}
    </div>
  </div>
);

export const AgentTip = ({ children }) => (
  <div className="bg-blue-50 border border-blue-100 text-blue-800 p-3 rounded-2xl text-[12px] leading-relaxed">
    {children}
  </div>
);

export const UserReplyButton = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="bg-decathlonBlue text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg active:scale-95 transition-transform"
  >
    {children}
  </button>
);

export const ChatInput = ({ value, onChange, onSend, placeholder = "Message your guide..." }) => (
  <div className="relative flex items-center">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && onSend()}
      className="w-full bg-gray-100 border-none rounded-full py-4 px-6 text-base focus:ring-2 focus:ring-decathlonBlue pr-14 placeholder-gray-400"
      placeholder={placeholder}
    />
    <button
      onClick={onSend}
      className="absolute right-2 p-3 bg-decathlonBlue text-white rounded-full shadow-lg active:scale-95 transition-transform"
    >
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
      </svg>
    </button>
  </div>
);
