import { useState } from 'react';
import { LandingScreen } from './screens/LandingScreen';
import { ChatScreen } from './screens/ChatScreen';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { PaymentScreen } from './screens/PaymentScreen';
import { SuccessScreen } from './screens/SuccessScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [showChat, setShowChat] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const handleOpenChat = () => {
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
  };

  const handleNavigate = (screen) => {
    if (screen === 'chat') {
      setShowChat(true);
    } else if (screen === 'home') {
      setCurrentScreen('landing');
      setShowChat(false);
      setShowSuccess(false);
    } else if (screen === 'handoff') {
      setShowChat(true);
    }
  };

  const handleProceedToCheckout = (data) => {
    setOrderData(data);
    setShowChat(false);
    setCurrentScreen('checkout');
  };

  const handleGoToPayment = (completeOrderData) => {
    setOrderData(completeOrderData);
    setCurrentScreen('payment');
  };

  const handlePaymentComplete = (paymentResult) => {
    setOrderData(prev => ({ ...prev, ...paymentResult }));
    setShowSuccess(true);
  };

  const handleContinueBrowsing = () => {
    setShowSuccess(false);
    setCurrentScreen('landing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 md:p-8">
      {/* Phone Frame */}
      <div className="relative">
        {/* Phone Outer Shell */}
        <div className="w-[375px] h-[812px] bg-gray-900 rounded-[50px] p-3 shadow-2xl">
          {/* Power Button */}
          <div className="absolute right-[-3px] top-[120px] w-[6px] h-[80px] bg-gray-700 rounded-r-md"></div>
          {/* Volume Buttons */}
          <div className="absolute left-[-3px] top-[100px] w-[6px] h-[30px] bg-gray-700 rounded-l-md"></div>
          <div className="absolute left-[-3px] top-[150px] w-[6px] h-[60px] bg-gray-700 rounded-l-md"></div>

          {/* Phone Inner Frame */}
          <div className="w-full h-full bg-black rounded-[40px] overflow-hidden relative">
            {/* Screen Content */}
            <div className="w-full h-full bg-white overflow-y-auto">
              {currentScreen === 'landing' && (
                <LandingScreen
                  onOpenChat={handleOpenChat}
                  onNavigate={handleNavigate}
                />
              )}

              {currentScreen === 'checkout' && (
                <CheckoutScreen
                  orderData={orderData}
                  onBack={() => setCurrentScreen('landing')}
                  onProceedToPayment={handleGoToPayment}
                />
              )}

              {currentScreen === 'payment' && (
                <PaymentScreen
                  orderData={orderData}
                  onBack={() => setCurrentScreen('checkout')}
                  onPaymentComplete={handlePaymentComplete}
                />
              )}

              {/* Chat Overlay */}
              {showChat && (
                <ChatScreen
                  onClose={handleCloseChat}
                  onNavigate={handleNavigate}
                  onProceedToCheckout={handleProceedToCheckout}
                />
              )}

              {/* Success Overlay */}
              {showSuccess && (
                <SuccessScreen
                  orderData={orderData}
                  onClose={() => setShowSuccess(false)}
                  onContinue={handleContinueBrowsing}
                />
              )}
            </div>
          </div>
        </div>

        {/* Phone Shadow */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-[300px] h-[20px] bg-black/30 rounded-full blur-xl"></div>
      </div>
    </div>
  );
}

export default App;
