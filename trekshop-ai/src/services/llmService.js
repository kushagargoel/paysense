// LLM Service - Real Bedrock Integration via Backend API
// Set USE_MOCK=true in .env to use mock responses instead of calling the API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Import mock data as fallback
import dummyData from '../../dummy_data.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Suggestion chips for each stage
export const SUGGESTIONS = {
  category: [
    { label: '🥾 Trekking Shoes', value: 'shoes' },
    { label: '🎒 Backpacks', value: 'backpacks' },
    { label: '🧥 Jackets', value: 'jackets' },
    { label: '🦯 Poles & Accessories', value: 'accessories' }
  ],
  brand: [
    { label: 'Forclaz', value: 'forclaz' },
    { label: 'Quechua', value: 'quechua' },
    { label: 'Any Brand', value: 'no preference' }
  ],
  budget: [
    { label: 'Under ₹3,000', value: '3000' },
    { label: 'Under ₹5,000', value: '5000' },
    { label: 'Under ₹8,000', value: '8000' },
    { label: 'No Limit', value: '100000' }
  ],
  adjustBudget: [
    { label: 'Increase Budget', value: 'increase' },
    { label: 'Try Different Category', value: 'change' },
    { label: 'Show All Options', value: 'show_all' }
  ]
};

// Helper to convert conversation state to message history for API
const buildMessageHistory = (conversation) => {
  // This would track the actual message history if needed
  // For now, the backend maintains state via the conversation object
  return [];
};

export const llmService = {
  async getGreeting() {
    if (USE_MOCK) {
      await delay(600);
      return {
        message: "Hi! I'm your Trekking Concierge. What are you looking for today?",
        stage: 'category_query',
        suggestions: SUGGESTIONS.category
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/chat/greeting`);
      const data = await response.json();

      if (data.success) {
        return {
          message: data.message,
          stage: data.stage || 'greeting',
          suggestions: SUGGESTIONS.category
        };
      }
      throw new Error(data.error || 'Failed to get greeting');
    } catch (error) {
      console.error('Error getting greeting:', error);
      // Fallback to mock
      return {
        message: "Hi! I'm your Trekking Concierge. What are you looking for today?",
        stage: 'category_query',
        suggestions: SUGGESTIONS.category
      };
    }
  },

  async processMessage(message, conversationHistory) {
    if (USE_MOCK) {
      return this._processMockMessage(message, conversationHistory);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history: buildMessageHistory(conversationHistory),
          stage: conversationHistory.stage,
          preferences: conversationHistory.preferences
        }),
      });

      const data = await response.json();

      if (data.success) {
        return {
          message: data.message,
          stage: data.stage || 'conversation',
          preferences: data.preferences || conversationHistory.preferences || {},
          suggestions: data.suggestions || this._getSuggestionsForStage(data.stage),
          products: data.products || null
        };
      }
      throw new Error(data.error || 'Failed to process message');
    } catch (error) {
      console.error('Error processing message:', error);
      // Fallback to mock
      return this._processMockMessage(message, conversationHistory);
    }
  },

  _getSuggestionsForStage(stage) {
    switch (stage) {
      case 'category_query':
        return SUGGESTIONS.category;
      case 'brand_query':
        return SUGGESTIONS.brand;
      case 'budget_query':
        return SUGGESTIONS.budget;
      case 'show_recommendations':
        return [
          { label: '✅ Check for Discounts', value: 'discounts' },
          { label: '💳 EMI Options', value: 'emi' },
          { label: 'Proceed to Buy', value: 'buy' }
        ];
      default:
        return [];
    }
  },

  async checkDiscounts(productIds) {
    if (USE_MOCK) {
      await delay(1200);

      const eligibleDeals = [];
      for (const deal of Object.values(dummyData.deals)) {
        const eligibleProducts = productIds.filter(id =>
          deal.eligible_products.includes(id)
        );
        if (eligibleProducts.length > 0) {
          eligibleDeals.push({ ...deal, eligibleProducts });
        }
      }

      return {
        deals: eligibleDeals,
        processing: [
          "[Discovery Agent] → Handoff to Sales Agent",
          "[Checking] Merchant promo budget...",
          "[Checking] User eligibility...",
          "[Checking] Inventory pressure...",
          `[Result] ${eligibleDeals.length > 0 ? 'Discounts unlocked ✓' : 'Standard pricing applied'}`
        ]
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/check-discounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds }),
      });

      const data = await response.json();

      if (data.success) {
        return {
          deals: data.deals,
          processing: data.processing
        };
      }
      throw new Error(data.error || 'Failed to check discounts');
    } catch (error) {
      console.error('Error checking discounts:', error);
      // Fallback to mock
      const eligibleDeals = [];
      for (const deal of Object.values(dummyData.deals)) {
        const eligibleProducts = productIds.filter(id =>
          deal.eligible_products.includes(id)
        );
        if (eligibleProducts.length > 0) {
          eligibleDeals.push({ ...deal, eligibleProducts });
        }
      }
      return {
        deals: eligibleDeals,
        processing: [
          "[Discovery Agent] → Handoff to Sales Agent",
          "[Checking] Merchant promo budget...",
          "[Checking] User eligibility...",
          "[Checking] Inventory pressure...",
          `[Result] ${eligibleDeals.length > 0 ? 'Discounts unlocked ✓' : 'Standard pricing applied'}`
        ]
      };
    }
  },

  // Mock implementation for fallback
  async _processMockMessage(message, conversationHistory) {
    await delay(800);

    const currentStage = conversationHistory.stage || 'category_query';
    const preferences = { ...conversationHistory.preferences } || {};

    const extractCategory = (msg) => {
      const lowerMsg = msg.toLowerCase();
      const categories = {
        'Footwear': ['shoe', 'boot', 'footwear', 'walking', 'trekking shoe', 'hiking boot', 'sandal'],
        'Backpacks': ['backpack', 'bag', 'rucksack', '50l', '60l', '40l'],
        'Clothing': ['jacket', 'rain jacket', 'down jacket', 'clothing', 'apparel', 'pant', 'shirt'],
        'Accessories': ['pole', 'stick', 'sock', 'accessory', 'accessories', 'water bottle', 'headlamp']
      };

      for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(kw => lowerMsg.includes(kw))) {
          return category;
        }
      }
      return null;
    };

    const extractBrand = (msg) => {
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.includes('forclaz')) return 'Forclaz';
      if (lowerMsg.includes('quechua')) return 'Quechua';
      return null;
    };

    const extractBudget = (msg) => {
      const match = msg.match(/(\d+)[kK]?/);
      if (match) {
        let budget = parseInt(match[1]);
        if (budget < 100) budget *= 1000;
        return budget;
      }
      return null;
    };

    const filterProducts = (prefs) => {
      let filtered = [...dummyData.products];

      if (prefs.category) {
        filtered = filtered.filter(p =>
          p.category.toLowerCase() === prefs.category.toLowerCase()
        );
      }

      if (prefs.brand) {
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(prefs.brand.toLowerCase())
        );
      }

      if (prefs.budget) {
        filtered = filtered.filter(p => p.price <= prefs.budget);
      }

      filtered.sort((a, b) => (b.rating * b.reviews) - (a.rating * b.reviews));
      return filtered.slice(0, 3);
    };

    switch (currentStage) {
      case 'category_query': {
        const category = extractCategory(message);
        if (category) {
          preferences.category = category;
          return {
            message: `Great choice! ${category} it is. Any specific brand preference?`,
            stage: 'brand_query',
            preferences,
            suggestions: SUGGESTIONS.brand
          };
        }
        return {
          message: "What would you like to explore? Select from the options below:",
          stage: 'category_query',
          preferences,
          suggestions: SUGGESTIONS.category
        };
      }

      case 'brand_query': {
        const brand = extractBrand(message);
        if (brand) {
          preferences.brand = brand;
        }
        if (brand || message.toLowerCase().includes('no') || message.toLowerCase().includes('any')) {
          return {
            message: `Perfect! What's your budget for ${preferences.category?.toLowerCase() || 'these items'}?`,
            stage: 'budget_query',
            preferences,
            suggestions: SUGGESTIONS.budget
          };
        }
        return {
          message: "Any brand preference?",
          stage: 'brand_query',
          preferences,
          suggestions: SUGGESTIONS.brand
        };
      }

      case 'budget_query': {
        const budget = extractBudget(message);
        if (budget) {
          preferences.budget = budget;
          const recommendations = filterProducts(preferences);

          if (recommendations.length === 0) {
            return {
              message: `I couldn't find ${preferences.category?.toLowerCase() || 'items'} within ₹${budget.toLocaleString()}. Would you like to increase your budget or try a different category?`,
              stage: 'adjust_budget',
              preferences,
              suggestions: SUGGESTIONS.adjustBudget
            };
          }

          return {
            message: `Here are the best ${preferences.category?.toLowerCase() || 'options'} within ₹${budget.toLocaleString()}:`,
            stage: 'show_recommendations',
            preferences,
            products: recommendations
          };
        }
        return {
          message: "Please select or type your budget:",
          stage: 'budget_query',
          preferences,
          suggestions: SUGGESTIONS.budget
        };
      }

      case 'show_recommendations': {
        if (message.toLowerCase().includes('interested') || message.toLowerCase().includes('this')) {
          return {
            message: "Great choice! Would you like me to check for available discounts or financing options?",
            stage: 'discount_query',
            preferences,
            suggestions: [
              { label: '✅ Check for Discounts', value: 'discounts' },
              { label: '💳 EMI Options', value: 'emi' },
              { label: 'Proceed to Buy', value: 'buy' }
            ]
          };
        }
        return {
          message: "Click on any product above to proceed, or ask me to check for discounts!",
          stage: 'show_recommendations',
          preferences
        };
      }

      case 'discount_query': {
        if (message.toLowerCase().includes('discount') || message.toLowerCase().includes('yes')) {
          return {
            message: "Checking discounts...",
            stage: 'checking_discount',
            preferences
          };
        }
        if (message.toLowerCase().includes('buy') || message.toLowerCase().includes('proceed')) {
          return {
            message: "Proceeding to checkout...",
            stage: 'proceed_checkout',
            preferences
          };
        }
        return {
          message: "Would you like to check for discounts?",
          stage: 'discount_query',
          preferences,
          suggestions: [
            { label: 'Check Discounts', value: 'discounts' },
            { label: 'Proceed to Buy', value: 'buy' }
          ]
        };
      }

      default:
        return {
          message: "I'm here to help! What are you looking for?",
          stage: 'category_query',
          preferences: {},
          suggestions: SUGGESTIONS.category
        };
    }
  }
};

export default llmService;
