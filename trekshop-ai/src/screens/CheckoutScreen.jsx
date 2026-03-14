import { useState } from 'react';
import { ArrowBackIcon, ShoppingCartCheckoutIcon } from '../components/Icons';

export const CheckoutScreen = ({ orderData, onBack, onProceedToPayment }) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});

  const product = orderData?.product;
  const finalPrice = orderData?.finalPrice || product?.price || 0;
  const originalPrice = orderData?.originalPrice || product?.price || 0;
  const savings = orderData?.savings || (originalPrice > finalPrice ? originalPrice - finalPrice : 0);
  const dealName = orderData?.dealName || null;

  const validate = () => {
    const newErrors = {};
    if (!customerInfo.name.trim()) newErrors.name = 'Name is required';
    if (!customerInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(customerInfo.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceed = () => {
    if (!validate()) return;

    onProceedToPayment({
      ...orderData,
      customer: customerInfo,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-white">
        <button onClick={onBack} className="flex size-10 items-center justify-center">
          <ArrowBackIcon className="h-6 w-6" />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Checkout</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Order Summary */}
        <div className="bg-white m-4 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Summary</h3>
          </div>

          {product ? (
            <div className="px-5 pb-5">
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  {product.category && (
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{product.category}</p>
                  )}
                  <h4 className="font-bold text-gray-900 text-sm leading-tight mt-0.5">{product.name}</h4>
                  {product.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Item Price</span>
                  <span className="text-gray-900">
                    {originalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                  </span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 flex items-center gap-1.5">
                      {dealName && (
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {dealName}
                        </span>
                      )}
                      Discount
                    </span>
                    <span className="text-green-600 font-medium">
                      -{savings.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>

                <div className="flex justify-between pt-3 border-t border-dashed border-gray-200">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-xl text-gray-900">
                    {finalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-5 pb-5 text-sm text-gray-500">
              No product selected. Please go back and select a product.
            </div>
          )}
        </div>

        {/* Customer Details */}
        <div className="bg-white m-4 mt-0 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Details</h3>
          </div>

          <div className="px-5 pb-5 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => {
                  setCustomerInfo(prev => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                }}
                placeholder="John Doe"
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${
                  errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => {
                  setCustomerInfo(prev => ({ ...prev, email: e.target.value }));
                  if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                }}
                placeholder="john@example.com"
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-100 text-sm text-gray-500">
                  +91
                </span>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setCustomerInfo(prev => ({ ...prev, phone: val }));
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
                  }}
                  placeholder="9876543210"
                  className={`flex-1 px-4 py-3 rounded-r-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${
                    errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>

        {/* Secured By */}
        <div className="flex items-center justify-center gap-2 py-3 opacity-60">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-[10px] font-bold text-gray-500 uppercase">Secured by</span>
          <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
            <span className="text-[10px] font-extrabold text-blue-900 tracking-tighter">PINE LABS</span>
            <span className="text-[10px] font-light text-gray-600">plural</span>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500">Total Payable</p>
            <p className="text-2xl font-bold text-gray-900">
              {finalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
            </p>
          </div>
          {savings > 0 && (
            <div className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg">
              You save {savings.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
            </div>
          )}
        </div>
        <button
          onClick={handleProceed}
          disabled={!product}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCartCheckoutIcon className="h-5 w-5" />
          Proceed to Pay
        </button>
        <p className="text-xs text-center text-gray-400 mt-2">
          You'll be redirected to Pine Labs secure payment gateway
        </p>
      </div>
    </div>
  );
};
