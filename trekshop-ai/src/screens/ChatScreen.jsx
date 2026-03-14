import { useState, useEffect, useRef } from 'react';
import { CloseIcon, ChatIcon, HomeIcon, UserIcon } from '../components/Icons';
import { ChatMessage, ChatInput } from '../components/ChatMessage';
import { llmService } from '../services/llmService';

export const ChatScreen = ({ onClose, onNavigate, onProceedToCheckout }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversation, setConversation] = useState({
    stage: 'greeting',
    preferences: {}
  });
  const [recommendations, setRecommendations] = useState([]);
  const [upsellProducts, setUpsellProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountInfo, setDiscountInfo] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, suggestions, recommendations]);

  // Initial greeting
  useEffect(() => {
    const initChat = async () => {
      setIsTyping(true);
      const response = await llmService.getGreeting();
      setIsTyping(false);
      setMessages([{ id: 1, type: 'agent', text: response.message }]);
      setConversation(prev => ({ ...prev, stage: response.stage }));
      setSuggestions(response.suggestions || []);
    };
    initChat();
  }, []);

  const handleSend = async (overrideMessage = null) => {
    const messageToSend = overrideMessage || inputValue;
    if (!messageToSend.trim()) return;

    if (!overrideMessage) {
      const userMessage = { id: Date.now(), type: 'user', text: inputValue };
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
    }
    setIsTyping(true);
    setSuggestions([]); // Clear suggestions while processing

    // Get LLM response
    const response = await llmService.processMessage(messageToSend, conversation);

    setIsTyping(false);
    setConversation({
      stage: response.stage,
      preferences: response.preferences
    });

    // Add agent message
    const agentMessage = { id: Date.now() + 1, type: 'agent', text: response.message };
    setMessages(prev => [...prev, agentMessage]);

    // Update suggestions if provided
    if (response.suggestions) {
      setSuggestions(response.suggestions);
    } else {
      setSuggestions([]);
    }

    // If we have product recommendations, show them
    if (response.products) {
      setRecommendations(response.products);
      setUpsellProducts([]);
    }

    // If we have upsell products (when no budget match)
    if (response.upsellProducts) {
      setUpsellProducts(response.upsellProducts);
      setRecommendations([]);
    }

    // If checking discounts
    if (response.stage === 'checking_discount') {
      checkForDiscounts(response.preferences.selectedProducts || ['TREK-500']);
    }

    // If proceed to checkout
    if (response.stage === 'proceed_checkout') {
      setTimeout(() => onProceedToCheckout?.(), 1000);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    // Add user message for the suggestion
    const userMessage = { id: Date.now(), type: 'user', text: suggestion.label };
    setMessages(prev => [...prev, userMessage]);

    // Send the value to the LLM
    handleSend(suggestion.value);
  };

  const checkForDiscounts = async (productIds) => {
    setIsTyping(true);
    const discountData = await llmService.checkDiscounts(productIds);
    setIsTyping(false);
    setDiscountInfo(discountData);
    setShowDiscount(true);
  };

  const handleProductSelect = (product) => {
    setConversation(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        selectedProducts: [product.id]
      }
    }));

    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      text: `I'm interested in ${product.name}`
    }]);

    setIsTyping(true);
    setSuggestions([]);
    setTimeout(async () => {
      setIsTyping(false);
      const response = await llmService.processMessage('interested', {
        ...conversation,
        preferences: { ...conversation.preferences, selectedProducts: [product.id] }
      });
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'agent', text: response.message }]);
      setConversation(prev => ({ ...prev, stage: response.stage }));
      if (response.suggestions) setSuggestions(response.suggestions);
    }, 800);
  };

  const handleProceedToCheckout = () => {
    onProceedToCheckout?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Dimmed Background */}
      <div className="absolute inset-0 bg-black/40 z-0" onClick={onClose} />

      {/* Bottom Sheet */}
      <div className="absolute inset-x-0 bottom-0 z-20 h-[92%] bg-white rounded-t-[2.5rem] flex flex-col bottom-sheet-shadow animate-slide-up">
        {/* Handle */}
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 bg-gray-200 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-decathlonBlue rounded-full flex items-center justify-center">
                  <ChatIcon className="h-7 w-7 text-white" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-subtle-pulse"></span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">AI Concierge</h2>
                <span className="text-xs text-green-500 font-semibold uppercase tracking-wider">Online & Active</span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 p-2 hover:bg-gray-100 rounded-full">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              isUser={msg.type === 'user'}
              message={msg.text}
            />
          ))}

          {/* Suggestion Chips */}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 animate-fadeIn">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-2 bg-decathlonBlue/10 hover:bg-decathlonBlue/20 text-decathlonBlue rounded-full text-sm font-medium transition-colors border border-decathlonBlue/20"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          )}

          {/* Product Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-3 animate-fadeIn">
              <p className="text-sm text-gray-600 font-medium">Recommended for you:</p>
              {recommendations.map(product => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex items-center cursor-pointer active:scale-[0.98] transition-transform hover:shadow-md"
                >
                  <img src={product.image} alt={product.name} className="w-20 h-20 object-cover bg-gray-100" />
                  <div className="p-3 flex-1">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">{product.category}</p>
                    <h3 className="font-bold text-sm text-gray-900 leading-tight">{product.name}</h3>
                    <p className="text-decathlonBlue font-bold text-sm mt-0.5">₹{product.price.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{product.description}</p>
                  </div>
                  <div className="pr-3">
                    <div className="w-8 h-8 bg-decathlonBlue/10 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-decathlonBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upsell Products (when no budget match) */}
          {upsellProducts.length > 0 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800 font-medium">💡 Slightly above your budget</p>
                <p className="text-xs text-orange-600">Check out these options with EMI & discounts!</p>
              </div>
              {upsellProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex items-center cursor-pointer active:scale-[0.98] transition-transform hover:shadow-md"
                >
                  <img src={product.image} alt={product.name} className="w-20 h-20 object-cover bg-gray-100" />
                  <div className="p-3 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">{product.category}</p>
                      {product.promo_eligible && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">10% OFF</span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 leading-tight">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-decathlonBlue font-bold text-sm">
                        ₹{product.discountedPrice?.toLocaleString() || product.price.toLocaleString()}
                      </p>
                      {product.discountedPrice < product.price && (
                        <p className="text-xs text-gray-400 line-through">₹{product.price.toLocaleString()}</p>
                      )}
                    </div>
                    <p className="text-[10px] text-green-600 font-medium mt-1">
                      💳 EMI from ₹{product.emiAmount?.toLocaleString()}/month
                    </p>
                  </div>
                  <div className="pr-3">
                    <div className="w-8 h-8 bg-decathlonBlue/10 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-decathlonBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Discount Processing */}
          {showDiscount && discountInfo && (
            <div className="space-y-4 animate-fadeIn">
              {/* Processing Steps */}
              <div className="bg-slate-900 text-white p-4 rounded-xl font-mono text-xs space-y-2">
                {discountInfo.processing.map((step, idx) => (
                  <div
                    key={idx}
                    className={step.includes('Result') ? 'text-gold-accent font-bold' : step.includes('Checking') ? 'text-white/60' : 'text-terminal-green terminal-text'}
                  >
                    {step}
                  </div>
                ))}
                <div className="h-px w-full bg-white/10 my-2"></div>
                <div className="text-slate-400 italic">Negotiation complete in 0.8s</div>
              </div>

              {/* Discount Result */}
              {discountInfo.deals.length > 0 ? (
                <>
                  <ChatMessage isUser={false}>
                    <p className="text-sm font-medium leading-normal">
                      Great news! I found <span className="text-primary font-bold">{discountInfo.deals[0].name}</span> for you.
                    </p>
                    <div className="mt-3 bg-primary/10 p-3 rounded-lg border border-primary/20">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[10px] uppercase text-primary/70 font-bold">Final Price</p>
                          <p className="text-xl font-bold text-gray-900">₹4,900</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] line-through text-gray-400">₹5,499</p>
                          <p className="text-[10px] text-green-600 font-bold">Saved ₹599</p>
                        </div>
                      </div>
                    </div>
                  </ChatMessage>

                  {/* CTA */}
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all"
                  >
                    Proceed to Checkout
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <ChatMessage isUser={false}>
                    <p className="text-sm">No additional discounts available, but you can still use No-Cost EMI options!</p>
                  </ChatMessage>
                  <div className="flex gap-2">
                    <button
                      onClick={handleProceedToCheckout}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all"
                    >
                      Buy Now
                    </button>
                    <button
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all"
                    >
                      💳 EMI Options
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
              <span>AI is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 pb-10">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={() => handleSend()}
            placeholder={
              conversation.stage === 'category_query' ? "Or tap an option above..." :
              conversation.stage === 'brand_query' ? "Select a brand or type your own..." :
              conversation.stage === 'budget_query' ? "Select or type your budget..." :
              "Message your AI Concierge..."
            }
          />
        </div>

        {/* Bottom Nav Mirror */}
        <div className="h-16 border-t border-gray-100 flex items-center justify-around bg-white">
          <button onClick={() => onNavigate?.('home')} className="text-gray-400 hover:text-decathlonBlue flex flex-col items-center">
            <HomeIcon className="h-6 w-6" />
          </button>
          <button className="text-decathlonBlue flex flex-col items-center relative">
            <ChatIcon className="h-6 w-6" />
            <span className="absolute -bottom-1 w-1.5 h-1.5 bg-decathlonBlue rounded-full"></span>
          </button>
          <button className="text-gray-400 flex flex-col items-center">
            <UserIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
