// LLM Service - Mock Bedrock Integration
// In production, this would call the Python backend with Bedrock

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

const extractCategory = (message) => {
  const lowerMsg = message.toLowerCase();
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

const extractBrand = (message) => {
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('forclaz')) return 'Forclaz';
  if (lowerMsg.includes('quechua')) return 'Quechua';
  return null;
};

const extractBudget = (message) => {
  const match = message.match(/(\d+)[kK]?/);
  if (match) {
    let budget = parseInt(match[1]);
    if (budget < 100) budget *= 1000;
    return budget;
  }
  return null;
};

// Find closest products when no exact budget match
const findUpsellProducts = (preferences) => {
  let filtered = [...dummyData.products];

  // Filter by category
  if (preferences.category) {
    filtered = filtered.filter(p =>
      p.category.toLowerCase() === preferences.category.toLowerCase()
    );
  }

  // Filter by brand
  if (preferences.brand) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(preferences.brand.toLowerCase())
    );
  }

  // Sort by price difference from budget (ascending)
  // Products slightly above budget will appear first
  filtered.sort((a, b) => {
    const diffA = a.price - preferences.budget;
    const diffB = b.price - preferences.budget;
    // Prefer products slightly above budget over way above
    if (diffA > 0 && diffB > 0) return diffA - diffB;
    if (diffA > 0) return -1; // a is above budget, prefer it
    if (diffB > 0) return 1;
    return Math.abs(diffA) - Math.abs(diffB);
  });

  return filtered.slice(0, 3);
};

// Find products with best EMI/deal options
const findProductsWithFinancing = (preferences) => {
  let products = findUpsellProducts(preferences);

  // Add financing info to each product
  return products.map(p => {
    const emiAmount = Math.ceil(p.price / 6);
    const discountPercent = p.promo_eligible ? 10 : 0;
    const discountedPrice = p.promo_eligible ? Math.floor(p.price * 0.9) : p.price;

    return {
      ...p,
      emiAmount,
      discountPercent,
      discountedPrice,
      priceDifference: p.price - preferences.budget
    };
  });
};

// Filter products based on preferences
const filterProducts = (preferences) => {
  let filtered = [...dummyData.products];

  if (preferences.category) {
    filtered = filtered.filter(p =>
      p.category.toLowerCase() === preferences.category.toLowerCase()
    );
  }

  if (preferences.brand) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(preferences.brand.toLowerCase())
    );
  }

  if (preferences.budget) {
    filtered = filtered.filter(p => p.price <= preferences.budget);
  }

  filtered.sort((a, b) => (b.rating * b.reviews) - (a.rating * b.reviews));

  return filtered.slice(0, 3);
};

export const llmService = {
  async getGreeting() {
    await delay(600);
    return {
      message: "Hi! I'm your Trekking Concierge. What are you looking for today?",
      stage: 'category_query',
      suggestions: SUGGESTIONS.category
    };
  },

  async processMessage(message, conversationHistory) {
    await delay(800);

    const currentStage = conversationHistory.stage || 'category_query';
    const preferences = { ...conversationHistory.preferences } || {};

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
            message: `Perfect! What's your budget for ${preferences.category.toLowerCase()}?`,
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

      case 'budget_query':
      case 'adjust_budget': {
        const budget = extractBudget(message);
        if (budget) {
          preferences.budget = budget;
          preferences.budgetAdjusted = currentStage === 'adjust_budget';
          const recommendations = filterProducts(preferences);

          if (recommendations.length === 0) {
            // No products in budget - upsell mode
            const upsellProducts = findProductsWithFinancing(preferences);
            const lowestPrice = upsellProducts[0]?.price || 0;
            const priceDiff = lowestPrice - budget;

            return {
              message: `I couldn't find ${preferences.category.toLowerCase()} within ₹${budget.toLocaleString()}. But here are some great options just slightly above your budget:`,
              stage: 'upsell_options',
              preferences,
              upsellProducts,
              suggestions: [
                { label: `See options under ₹${Math.ceil(budget * 1.5 / 1000)}k`, value: String(Math.ceil(budget * 1.5)) },
                { label: 'Try Different Category', value: 'change_category' },
                { label: 'Show All Products', value: 'show_all' }
              ]
            };
          }

          return {
            message: preferences.budgetAdjusted
              ? "Here are products within your new budget:"
              : `Here are the best ${preferences.category.toLowerCase()} within ₹${budget.toLocaleString()}:`,
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

      case 'upsell_options': {
        // User wants to see options after upsell
        if (message.toLowerCase().includes('show') || message.toLowerCase().includes('all')) {
          const allProducts = findUpsellProducts(preferences);
          return {
            message: "Here are all available options sorted by value:",
            stage: 'show_recommendations',
            preferences,
            products: allProducts
          };
        }
        if (message.toLowerCase().includes('change') || message.toLowerCase().includes('category')) {
          return {
            message: "What category would you like to explore instead?",
            stage: 'category_query',
            preferences: {},
            suggestions: SUGGESTIONS.category
          };
        }
        // Try to extract new budget
        const newBudget = extractBudget(message);
        if (newBudget) {
          preferences.budget = newBudget;
          const recommendations = filterProducts(preferences);
          if (recommendations.length > 0) {
            return {
              message: `Here are options within ₹${newBudget.toLocaleString()}:`,
              stage: 'show_recommendations',
              preferences,
              products: recommendations
            };
          }
        }
        return {
          message: "Let me show you all available options:",
          stage: 'show_recommendations',
          preferences,
          products: findUpsellProducts(preferences)
        };
      }

      case 'show_recommendations': {
        // Check if user selected a product
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
        if (message.toLowerCase().includes('discount') || message.toLowerCase().includes('yes')) {
          return {
            message: "Let me check for available discounts...",
            stage: 'checking_discount',
            preferences
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
        if (message.toLowerCase().includes('emi') || message.toLowerCase().includes('finance')) {
          return {
            message: "I can offer No-Cost EMI options! Pay in 6 easy installments. Would you like to proceed?",
            stage: 'emi_options',
            preferences,
            suggestions: [
              { label: '6 months EMI', value: 'emi6' },
              { label: '12 months EMI', value: 'emi12' },
              { label: 'Pay Full Amount', value: 'full' }
            ]
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
          message: "Would you like to check for discounts or EMI options?",
          stage: 'discount_query',
          preferences,
          suggestions: [
            { label: 'Check Discounts', value: 'discounts' },
            { label: 'EMI Options', value: 'emi' }
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
  },

  async checkDiscounts(productIds) {
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
};

export default llmService;
