import { useState } from 'react';
import { ArrowBackIcon, MoreVertIcon, WalletIcon, ShoppingCartCheckoutIcon, CloseIcon, SmartToyIcon } from '../components/Icons';

export const PaymentScreen = ({ onBack, onPaymentComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentComplete?.();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-white justify-between">
        <button onClick={onBack} className="flex size-10 items-center justify-center">
          <ArrowBackIcon className="h-6 w-6" />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Checkout</h2>
        <div className="flex size-10 items-center justify-end">
          <MoreVertIcon className="h-6 w-6" />
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Side: Ghosted Product Page (40%) */}
        <div className="w-2/5 p-4 flex flex-col gap-4 blur-ghost pointer-events-none bg-white/50">
          <div className="w-full aspect-square rounded-xl bg-gray-200 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop"
              alt="Trek-500 Boots"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
            <div className="h-8 w-1/3 bg-gray-200 rounded mt-4"></div>
          </div>
        </div>

        {/* Right Side: AI Payment Chat Panel (60%) */}
        <div className="w-3/5 flex flex-col bg-white shadow-2xl relative z-10">
          {/* Header with Pulse Dot */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Payment Agent Active</span>
            </div>
            <button onClick={onBack} className="text-gray-400">
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* AI Message */}
            <div className="flex flex-col gap-2 max-w-[90%]">
              <div className="bg-primary/10 p-4 rounded-2xl rounded-tl-none border border-primary/20">
                <p className="text-sm leading-relaxed">
                  I've prepared the payment for your <b>Forclaz Trek-500 Boots</b>. Everything is pre-filled. You can pay instantly using UPI or scan the code below.
                </p>
              </div>
            </div>

            {/* Payment Action Block */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-tight">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">₹4,900.00</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingCartCheckoutIcon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="p-5 space-y-5">
                {/* QR Code Section */}
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <div className="bg-white p-3 rounded-lg mb-2 shadow-sm">
                    {/* QR Code SVG */}
                    <svg className="w-32 h-32" viewBox="0 0 100 100">
                      <rect fill="white" width="100" height="100"/>
                      <rect fill="black" x="10" y="10" width="25" height="25"/>
                      <rect fill="white" x="15" y="15" width="15" height="15"/>
                      <rect fill="black" x="18" y="18" width="9" height="9"/>
                      <rect fill="black" x="65" y="10" width="25" height="25"/>
                      <rect fill="white" x="70" y="15" width="15" height="15"/>
                      <rect fill="black" x="73" y="18" width="9" height="9"/>
                      <rect fill="black" x="10" y="65" width="25" height="25"/>
                      <rect fill="white" x="15" y="70" width="15" height="15"/>
                      <rect fill="black" x="18" y="73" width="9" height="9"/>
                      <rect fill="black" x="40" y="10" width="5" height="5"/>
                      <rect fill="black" x="50" y="10" width="5" height="5"/>
                      <rect fill="black" x="40" y="20" width="5" height="5"/>
                      <rect fill="black" x="45" y="25" width="5" height="5"/>
                      <rect fill="black" x="55" y="20" width="5" height="5"/>
                      <rect fill="black" x="10" y="40" width="5" height="5"/>
                      <rect fill="black" x="20" y="45" width="5" height="5"/>
                      <rect fill="black" x="25" y="40" width="5" height="5"/>
                      <rect fill="black" x="35" y="40" width="5" height="5"/>
                      <rect fill="black" x="40" y="45" width="5" height="5"/>
                      <rect fill="black" x="45" y="50" width="5" height="5"/>
                      <rect fill="black" x="50" y="45" width="5" height="5"/>
                      <rect fill="black" x="55" y="50" width="5" height="5"/>
                      <rect fill="black" x="65" y="40" width="5" height="5"/>
                      <rect fill="black" x="70" y="45" width="5" height="5"/>
                      <rect fill="black" x="80" y="40" width="5" height="5"/>
                      <rect fill="black" x="85" y="50" width="5" height="5"/>
                      <rect fill="black" x="40" y="65" width="5" height="5"/>
                      <rect fill="black" x="50" y="70" width="5" height="5"/>
                      <rect fill="black" x="60" y="65" width="5" height="5"/>
                      <rect fill="black" x="45" y="75" width="5" height="5"/>
                      <rect fill="black" x="55" y="80" width="5" height="5"/>
                      <rect fill="black" x="65" y="75" width="5" height="5"/>
                      <rect fill="black" x="70" y="85" width="5" height="5"/>
                      <rect fill="black" x="80" y="80" width="5" height="5"/>
                      <rect fill="black" x="85" y="70" width="5" height="5"/>
                    </svg>
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Scan to pay with any UPI App</p>
                </div>

                {/* Main Action Button */}
                <button
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <WalletIcon className="h-5 w-5" />
                      Pay via UPI
                    </>
                  )}
                </button>

                {/* Secondary Info */}
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs text-primary font-semibold flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    No-cost EMI also available from ₹816/mo
                  </p>
                  <div className="flex items-center gap-1 opacity-60 py-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Secured by</span>
                    <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                      <span className="text-[10px] font-extrabold text-blue-900 tracking-tighter">PINE LABS</span>
                      <span className="text-[10px] font-light text-gray-600">plural</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggestion pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              <button className="whitespace-nowrap px-4 py-2 rounded-full border border-gray-200 text-xs font-medium text-gray-600 bg-white">
                Change Payment Mode
              </button>
              <button className="whitespace-nowrap px-4 py-2 rounded-full border border-gray-200 text-xs font-medium text-gray-600 bg-white">
                Apply Coupon
              </button>
            </div>
          </div>

          {/* Bottom Input Bar */}
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask AI anything..."
                className="w-full bg-white border border-gray-200 rounded-full py-3 px-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button className="absolute right-2 p-2 bg-primary text-white rounded-full">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
