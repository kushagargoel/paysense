import { useState } from 'react';
import { LandingScreen } from './screens/LandingScreen';
import { ChatScreen } from './screens/ChatScreen';
import { PaymentScreen } from './screens/PaymentScreen';
import { SuccessScreen } from './screens/SuccessScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [showChat, setShowChat] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleProceedToCheckout = () => {
    setShowChat(false);
    setCurrentScreen('payment');
  };

  const handlePaymentComplete = () => {
    setShowSuccess(true);
  };

  const handleContinueBrowsing = () => {
    setShowSuccess(false);
    setCurrentScreen('landing');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="relative">
        {currentScreen === 'landing' && (
          <LandingScreen
            onOpenChat={handleOpenChat}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'payment' && (
          <PaymentScreen
            onBack={() => setCurrentScreen('landing')}
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
            onClose={() => setShowSuccess(false)}
            onContinue={handleContinueBrowsing}
          />
        )}
      </div>

      {/* Demo Navigation Helper */}
      <div className="fixed top-4 right-4 z-[60] bg-white rounded-lg shadow-lg p-3 text-xs space-y-2 hidden md:block">
        <p className="font-bold text-gray-700">Demo Navigation:</p>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setCurrentScreen('landing')}
            className={`px-3 py-1 rounded text-left ${currentScreen === 'landing' ? 'bg-decathlonBlue text-white' : 'bg-gray-100'}`}
          >
            1. Landing Page
          </button>
          <button
            onClick={() => setShowChat(true)}
            className={`px-3 py-1 rounded text-left ${showChat ? 'bg-decathlonBlue text-white' : 'bg-gray-100'}`}
          >
            2. AI Chat
          </button>
          <button
            onClick={() => { setShowChat(false); setCurrentScreen('payment'); }}
            className={`px-3 py-1 rounded text-left ${currentScreen === 'payment' && !showSuccess ? 'bg-decathlonBlue text-white' : 'bg-gray-100'}`}
          >
            3. Payment
          </button>
          <button
            onClick={() => setShowSuccess(true)}
            className={`px-3 py-1 rounded text-left ${showSuccess ? 'bg-decathlonBlue text-white' : 'bg-gray-100'}`}
          >
            4. Success
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
