import { useEffect } from 'react';
import { SmartToyIcon, CloseIcon, CheckCircleIcon } from '../components/Icons';

export const SuccessScreen = ({ onClose, onContinue }) => {
  // Auto-close after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue?.();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Dimmed Background Page */}
      <div className="absolute inset-0 flex flex-col opacity-40 pointer-events-none grayscale-[20%]">
        <div className="flex items-center bg-white p-4 border-b border-gray-200 justify-between">
          <div className="text-gray-900 flex size-10 items-center">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <h2 className="text-gray-900 text-lg font-bold flex-1 text-center">DECATHLON</h2>
          <div className="flex w-10 items-center justify-end">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex flex-col gap-2">
              <div className="w-full aspect-square bg-gray-200 rounded-xl"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Side Panel */}
      <div className="relative w-full h-full bg-white shadow-2xl flex flex-col border-l border-gray-200 max-w-md">
        {/* Handle for mobile */}
        <div className="flex h-6 w-full items-center justify-center shrink-0">
          <div className="h-1.5 w-12 rounded-full bg-gray-300"></div>
        </div>

        {/* Panel Header */}
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              <SmartToyIcon className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg tracking-tight">AI Concierge</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Success Content */}
        <div className="flex-1 overflow-y-auto px-6 py-10 flex flex-col items-center text-center">
          {/* Large Green Checkmark */}
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <svg className="h-16 w-16 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold mb-4">Payment Successful</h1>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Payment of <span className="font-bold text-gray-900">₹4,900</span> confirmed! Your <span className="font-bold text-gray-900">Trek-500s</span> are on their way.<br />Happy trekking! 🏔️
          </p>

          {/* Order Receipt Card */}
          <div className="w-full bg-gray-50 rounded-xl p-6 border border-gray-100 text-left mb-8">
            <div className="flex justify-between mb-4">
              <span className="text-sm text-gray-500">Order ID</span>
              <span className="text-sm font-mono font-bold">#DEC-987654</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-sm text-gray-500">Transaction Ref</span>
              <span className="text-sm font-mono">PL-TXN-003942</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-4 items-center">
              <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Processed by</span>
              <div className="flex items-center gap-1 opacity-80">
                <div className="h-4 w-12 bg-gray-300 rounded flex items-center justify-center text-[8px] text-white">PINE LABS</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-6 space-y-3 bg-white border-t border-gray-100">
          <button
            onClick={onContinue}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20"
          >
            Continue Browsing
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-xl transition-all"
          >
            Close Panel
          </button>

          {/* AI Status Bar */}
          <div className="flex items-center justify-center pt-4 gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <span className="text-xs text-gray-400 font-medium">Concierge is idle</span>
          </div>
        </div>
      </div>
    </div>
  );
};
