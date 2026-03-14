export const products = [
  {
    id: 1,
    brand: 'FORCLAZ',
    name: "Men's Waterproof Mountain Trekking Boots - MT500",
    price: 85.00,
    originalPrice: null,
    rating: 4.5,
    reviews: 120,
    badge: 'NEW',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    category: 'Shoes',
  },
  {
    id: 2,
    brand: 'FORCLAZ',
    name: 'Mountain Trekking Backpack 50L - MT900',
    price: 110.00,
    originalPrice: null,
    rating: 4.8,
    reviews: 89,
    badge: null,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    category: 'Backpacks',
  },
  {
    id: 3,
    brand: 'QUECHUA',
    name: "Women's Waterproof Walking Shoes - NH150",
    price: 32.00,
    originalPrice: 40.00,
    rating: null,
    reviews: null,
    badge: '-20%',
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop',
    category: 'Shoes',
  },
  {
    id: 4,
    brand: 'FORCLAZ',
    name: "Men's Trekking Down Jacket - MT100",
    price: 55.00,
    originalPrice: null,
    rating: 4.7,
    reviews: 215,
    badge: null,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop',
    category: 'Clothing',
  },
  {
    id: 5,
    brand: 'FORCLAZ',
    name: 'Trek-500 Boots',
    price: 4900,
    originalPrice: 6499,
    priceDisplay: '₹4,900',
    originalPriceDisplay: '₹6,499',
    rating: 4.6,
    reviews: 156,
    badge: null,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop',
    category: 'Shoes',
    description: 'Ankle support for Khumbu Icefall terrain.',
  },
  {
    id: 6,
    brand: 'FORCLAZ',
    name: 'MT100 Boots',
    price: 4499,
    originalPrice: null,
    priceDisplay: '₹4,499',
    rating: 4.3,
    reviews: 89,
    badge: 'BUDGET',
    image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400&h=400&fit=crop',
    category: 'Shoes',
    description: 'Great entry-level grip for well-marked paths.',
  },
];

export const chatResponses = {
  greeting: "Hi, I'm your Trekking Guide. I see you're prepping for Everest Base Camp. How can I help you find the right gear?",

  shoes_query: {
    text: "I found these options for your Everest Base Camp trek:",
    products: [products[4], products[5]],
    tip: "Pro Tip: The Trek-500 at ₹5,500 has better waterproofing. Want me to see if I can get you a deal?"
  },

  discount_offer: {
    text: "Let me check what discounts are available for you...",
    processing: [
      "[Discovery Agent] → Handoff to Sales Agent",
      "[Checking] Merchant promo budget...",
      "[Checking] Inventory pressure: HIGH",
      "[Result] 'First Trek' discount unlocked ✓",
    ],
    finalPrice: 4900,
    originalPrice: 6499,
    savings: 1599,
    message: "Done. I've secured a 'First Trek' discount for you."
  },

  payment_ready: {
    text: "I've prepared the payment for your Forclaz Trek-500 Boots. Everything is pre-filled. You can pay instantly using UPI or scan the code below.",
    amount: 4900,
    upiId: 'decathlon@upi'
  },

  payment_success: {
    text: "Payment confirmed! Your Trek-500s are on their way. Happy trekking! 🏔️",
    orderId: '#DEC-987654',
    txnRef: 'PL-TXN-003942'
  }
};

export const dummyUser = {
  name: 'You',
  avatar: null,
};

export const aiAgent = {
  name: 'AI Concierge',
  avatar: null,
  status: 'Online & Active',
};
