'use strict';
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const {
  ChatbotIntent,
  ChatbotKeyword,
  ChatbotResponse,
  ChatbotSession,
  ChatbotMessage,
  ChatbotUnknownQuestion,
  Product,
  Category,
  ProductVariant,
  Order,
  OrderItem
} = require('../models');

const normalizeText = (text = '') => {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019\u201c\u201d]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const tokenize = (text = '') => normalizeText(text).split(' ').filter(Boolean);

const defaultIntents = [
  {
    name: 'greeting',
    description: 'Respond to greetings and welcome users',
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'welcome'],
    responses: [
      'Hello! 👋 How can I help you with our store today?',
      'Hi there! I can help you find products, check size details, or answer order questions.',
      'Hey! Ask me about our products, sizes, returns, shipping, or orders.'
    ]
  },
  {
    name: 'shirt_inventory',
    description: 'Answer shirt inventory questions using the product catalog',
    keywords: ['shirt', 'shirts', 'shirt details', 'shirt price', 'shirt sizes', 'shirt colors', 'shirt availability', 'highest price', 'order status'],
    responses: [
      'I can help with shirts, sizes, prices, colors, and order status. Tell me what you want to know about our shirt collection.',
      'Ask me for available shirt colors, sizes, prices, or the highest price for a shirt and I will pull the details from the catalog.',
      'I can also check an order number if you want to know where an order is currently.'
    ]
  },
  {
    name: 'product_search',
    description: 'Help customers find products by name, category or features',
    keywords: ['find', 'search', 'looking for', 'need', 'show me', 'available', 'in stock', 'product', 'jeans', 'shirt', 'dress', 'tshirt', 'shoes', 'jacket'],
    responses: [
      'I found some products that match your search. Tell me if you want to compare or view details.',
      'Here are some items I found. You can ask for a category, price, or size.',
      'I can help you narrow your search. Do you want me to filter by category, brand, or price?'
    ]
  },
  {
    name: 'size_help',
    description: 'Assist customers with sizing and fitting questions',
    keywords: ['size', 'fit', 'fitting', 'measurement', 'chest', 'waist', 'height', 'small', 'medium', 'large', 'size chart', 'size guide', 'true to size', 'runs small', 'runs large'],
    responses: [
      'For the best fit, choose the size closest to your chest and waist measurements. I can also compare sizes for a specific product if you want.',
      'If you share your measurements or the product name, I can suggest the right size from our available options.',
      'Most customers select the size matching their usual brand. If a product runs small or large, I can help you decide.'
    ]
  },
  {
    name: 'delivery_info',
    description: 'Answer shipping and delivery questions',
    keywords: ['shipping', 'delivery', 'courier', 'ship', 'deliver', 'dispatch', 'arrival', 'tracking', 'shipping time', 'delivery time', 'delivery charges', 'shipping cost', 'free shipping', 'standard shipping', 'express shipping'],
    responses: [
      'Orders are usually shipped within 1-2 business days and delivered depending on your location.',
      'Shipping time depends on your zip code. If you want, I can help check delivery availability for a product.',
      'We offer standard and express shipping. Ask me if you need details on shipping charges or delivery times.'
    ]
  },
  {
    name: 'order_status',
    description: 'Answer questions about order delivery status and expected arrival',
    keywords: ['when will my order arrive', 'when will i get my order', 'when do i get my order', 'when i get my order', 'where is my order', 'order status', 'track order', 'tracking', 'delivery status', 'order update', 'order tracking', 'expected delivery', 'order arrival'],
    responses: [
      'Your order is usually delivered within 1-2 business days. If you share your order number, I can help check the exact status.',
      'You can expect delivery shortly. If you need the specific status, please provide your order number or email used for checkout.',
      'I can help with order status and tracking. Please tell me your order number if you want a precise update.'
    ]
  },
  {
    name: 'return_policy',
    description: 'Explain returns, refunds, and exchanges',
    keywords: ['return', 'refund', 'exchange', 'cancel', 'replacement', 'policy', 'return policy', 'refund policy', 'exchange policy', 'return window'],
    responses: [
      'You can return most products within 7 days of delivery, provided they are unused and have the tags attached.',
      'If you want to exchange an item, I can help you with the steps and order details.',
      'Refunds are processed after we receive the returned item. It may take a few business days to appear on your statement.'
    ]
  },
  {
    name: 'exchange_policy',
    description: 'Explain exchange rules and how to swap for a new size or product',
    keywords: ['exchange', 'swap', 'size exchange', 'change size', 'exchange item', 'exchange order', 'replace product'],
    responses: [
      'You can exchange products within 7 days of delivery, as long as the item is unused and has the tags attached.',
      'To exchange an item, please request a new size or product through your order page and send the original item back.',
      'I can help you with the exchange process and next steps if you share your order details.'
    ]
  },
  {
    name: 'payment_help',
    description: 'Answer questions about payment methods, COD, and card support',
    keywords: ['payment', 'pay', 'credit card', 'debit card', 'upi', 'net banking', 'cash on delivery', 'cod', 'paypal', 'payment failed', 'payment method'],
    responses: [
      'We accept credit cards, debit cards, UPI, net banking, and cash on delivery for eligible orders.',
      'If your payment failed, please try again or use a different payment method. I can also help with order payment issues.',
      'You can use promo codes and coupons at checkout if they are valid for your order.'
    ]
  },
  {
    name: 'promo_help',
    description: 'Explain coupons, discounts, sales and promo code usage',
    keywords: ['coupon', 'promo', 'discount', 'sale', 'voucher', 'code', 'offer', 'promo code', 'deal'],
    responses: [
      'You can apply promo codes at checkout if they are still valid. Let me know the code and I can help verify it.',
      'Discounts are automatically applied when your order meets the sale conditions. Check your cart summary for the final price.',
      'If a promo code is not working, it may be expired or not valid for the selected products.'
    ]
  },
  {
    name: 'availability_help',
    description: 'Answer questions about stock availability and restock updates',
    keywords: ['stock', 'available', 'out of stock', 'restock', 'availability', 'back in stock', 'sold out'],
    responses: [
      'If a product is out of stock, you can request a restock notification and I will let you know when it becomes available again.',
      'Product availability changes quickly. I can check if a similar item is available in your size or color.',
      'Many items are restocked regularly. Tell me the product name and I can look for alternatives or updates.'
    ]
  },
  {
    name: 'account_help',
    description: 'Help users with account, login, registration, and password issues',
    keywords: ['account', 'login', 'log in', 'sign in', 'register', 'sign up', 'password', 'forgot password', 'profile', 'account help'],
    responses: [
      'You can sign in using your email and password. If you forgot your password, use the forgot password link to reset it.',
      'To create an account, register with your email and phone number. I can help you complete the signup process.',
      'If you need help accessing your account, please tell me whether you are having trouble logging in or resetting your password.'
    ]
  },
  {
    name: 'customer_support',
    description: 'Direct users to customer support and contact options',
    keywords: ['support', 'help', 'customer service', 'contact support', 'chat with support', 'assistance', 'helpdesk'],
    responses: [
      'Our customer support team is available to help with orders, returns, and account issues. You can reach them through the contact page.',
      'If you need immediate assistance, I can connect you to support or provide the best next step.',
      'I am here to help with your order questions. If you prefer, I can give you the customer support contact details.'
    ]
  },
  {
    name: 'comparison_help',
    description: 'Guide customers who want to compare products',
    keywords: ['compare', 'difference', 'better', 'than', 'between', 'compare products', 'which is better'],
    responses: [
      'If you want, I can help compare two or three products based on price, material, and size availability.',
      'Send me the names or IDs of the products and I can tell you the main differences.',
      'Comparisons work best when you give me the product names or categories you are interested in.'
    ]
  }
];

const parseUserFromRequest = (req) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice(7);
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return user || null;
  } catch (err) {
    return null;
  }
};

const getProductQueryContext = (message = '', knownCategories = []) => {
  const normalized = normalizeText(message);
  const tokens = tokenize(normalized);
  const categoryNames = knownCategories
    .map((category) => normalizeText(category.name))
    .filter(Boolean);

  let category = null;
  for (const categoryName of categoryNames) {
    if (normalized.includes(categoryName)) {
      category = categoryName;
      break;
    }
  }

  if (!category) {
    if (normalized.includes('shirt') || normalized.includes('shirts')) {
      category = 'shirts';
    } else if (normalized.includes('tshirt') || normalized.includes('tshirts')) {
      category = 'tshirts';
    } else if (normalized.includes('trouser') || normalized.includes('trousers')) {
      category = 'trousers';
    } else if (normalized.includes('short') || normalized.includes('shorts')) {
      category = 'shorts';
    }
  }

  const actions = [];
  if (tokens.some((token) => ['color', 'colour', 'colors', 'colours'].includes(token))) actions.push('colors');
  if (tokens.some((token) => ['size', 'sizes', 'sizing'].includes(token))) actions.push('sizes');
  if (tokens.some((token) => ['price', 'prices', 'cost', 'costs', 'rate', 'rates'].includes(token))) actions.push('prices');
  if (tokens.some((token) => ['highest', 'maximum', 'max', 'expensive'].includes(token))) actions.push('highest_price');
  if (tokens.some((token) => ['detail', 'details', 'info', 'information'].includes(token))) actions.push('details');
  if (tokens.some((token) => ['available', 'stock', 'inventory', 'in stock'].includes(token))) actions.push('availability');
  if (tokens.some((token) => ['order', 'status', 'track', 'tracking', 'where', 'delivery'].includes(token))) actions.push('order_status');

  const isCatalogQuestion = normalized.includes('products') || normalized.includes('product') || normalized.includes('what do you have') || normalized.includes('what are the') || normalized.includes('available') || normalized.includes('have');
  const isOrderQuestion = normalized.includes('order') || normalized.includes('track') || normalized.includes('delivery') || normalized.includes('where is my order');

  return {
    category,
    actions,
    isCatalogQuestion,
    isOrderQuestion,
    productName: tokens.join(' ').trim()
  };
};

const getOrderQueryContext = (message = '') => {
  const normalized = normalizeText(message);
  const isOrderQuery = normalized.includes('order') || normalized.includes('orders') || normalized.includes('track') || normalized.includes('tracking') || normalized.includes('delivery') || normalized.includes('where is my order');
  const isOrderListQuery = normalized.includes('orders') || normalized.includes('my orders') || normalized.includes('show my orders') || normalized.includes('list my orders');
  const isOrderStatusQuery = normalized.includes('order status') || normalized.includes('track order') || normalized.includes('delivery status') || normalized.includes('where is my order');
  const orderNumber = normalized.match(/order\s*([a-z0-9-]+)/i)?.[1] || null;

  return {
    isOrderQuery,
    isOrderListQuery,
    isOrderStatusQuery,
    orderNumber
  };
};

const extractTargetProduct = (message = '', productNames = []) => {
  if (!message || !Array.isArray(productNames) || productNames.length === 0) return null;

  const normalizedMessage = normalizeText(message);
  const candidates = productNames
    .map((name) => ({ name, normalizedName: normalizeText(name) }))
    .filter((candidate) => candidate.normalizedName);

  for (const candidate of candidates) {
    if (normalizedMessage.includes(candidate.normalizedName)) {
      return candidate.name;
    }
  }

  let bestMatch = null;
  let bestScore = 0;

  for (const candidate of candidates) {
    const candidateTokens = tokenize(candidate.normalizedName);
    const matchedTokens = candidateTokens.filter((token) => tokenize(normalizedMessage).includes(token)).length;
    const score = matchedTokens * 10 + (candidate.normalizedName.length > 0 ? 1 : 0);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = candidate.name;
    }
  }

  return bestScore >= 10 ? bestMatch : null;
};

const ensureDefaultIntents = async () => {
  for (const intentData of defaultIntents) {
    let intent = await ChatbotIntent.findOne({ where: { name: intentData.name } });
    if (!intent) {
      intent = await ChatbotIntent.create({
        name: intentData.name,
        description: intentData.description,
        active: true
      });
    } else if (!intent.active) {
      await intent.update({ active: true, description: intentData.description });
    }

    const existingKeywords = await ChatbotKeyword.findAll({ where: { intentId: intent.id } });
    const existingKeywordTexts = existingKeywords.map((kw) => normalizeText(kw.keyword));
    const keywordRecords = intentData.keywords
      .map((keyword) => normalizeText(keyword))
      .filter((keyword) => keyword && !existingKeywordTexts.includes(keyword))
      .map((keyword) => ({ intentId: intent.id, keyword }));

    if (keywordRecords.length > 0) {
      await ChatbotKeyword.bulkCreate(keywordRecords);
    }

    const existingResponses = await ChatbotResponse.findAll({ where: { intentId: intent.id, active: true } });
    const existingResponseTexts = existingResponses.map((resp) => normalizeText(resp.responseText));
    const responseRecords = intentData.responses
      .map((responseText, index) => ({
        intentId: intent.id,
        responseText,
        responseType: 'text',
        priority: index + 1,
        active: true
      }))
      .filter((response) => !existingResponseTexts.includes(normalizeText(response.responseText)));

    if (responseRecords.length > 0) {
      await ChatbotResponse.bulkCreate(responseRecords);
    }
  }
};

const fetchActiveIntents = async () => {
  await ensureDefaultIntents();
  return ChatbotIntent.findAll({
    where: { active: true },
    include: [
      {
        model: ChatbotKeyword,
        as: 'keywords',
        attributes: ['keyword']
      },
      {
        model: ChatbotResponse,
        as: 'responses',
        where: { active: true },
        required: false,
        attributes: ['responseText', 'priority', 'responseType']
      }
    ]
  });
};

const searchProducts = async (query) => {
  if (!query || !query.trim()) return [];
  const normalized = normalizeText(query);
  const searchTerm = `%${normalized}%`;

  const products = await Product.findAll({
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['name'],
        required: false
      }
    ],
    where: {
      [Op.or]: [
        { name: { [Op.like]: searchTerm } },
        { description: { [Op.like]: searchTerm } }
      ]
    },
    attributes: ['id', 'name', 'description', 'price', 'categoryId'],
    limit: 6
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: parseFloat(product.price),
    category: product.category ? product.category.name : 'Uncategorized'
  }));
};

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const scoreIntent = (text, intent) => {
  const normalizedText = normalizeText(text);
  const tokens = tokenize(normalizedText);
  let score = 0;

  if (!intent.keywords || intent.keywords.length === 0) {
    return score;
  }

  for (const keywordRow of intent.keywords) {
    const keyword = normalizeText(keywordRow.keyword);
    if (!keyword) continue;

    const keywordTokens = tokenize(keyword);
    const exactPhraseRegex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'i');

    if (exactPhraseRegex.test(normalizedText)) {
      score += keywordTokens.length * 10;
      continue;
    }

    const matchedTokens = keywordTokens.filter((token) => tokens.includes(token)).length;
    if (matchedTokens > 0) {
      score += matchedTokens * 4;
      if (matchedTokens === keywordTokens.length && keywordTokens.length > 1) {
        score += 6;
      }
    }
  }

  const interrogativeWords = ['how', 'what', 'why', 'where', 'when', 'do', 'is', 'are', 'can', 'should'];
  if (interrogativeWords.some((word) => normalizedText.includes(` ${word} `))) {
    score += 2;
  }

  return score;
};

const chooseIntent = (message, intents) => {
  const scored = intents.map(intent => ({
    intent,
    score: scoreIntent(message, intent)
  }));

  scored.sort((a, b) => b.score - a.score);
  const top = scored[0];
  if (!top || top.score <= 4) {
    return null;
  }

  if (scored.length > 1 && scored[1].score > 0 && top.score - scored[1].score <= 2) {
    return top.score >= 10 ? top.intent : null;
  }

  return top.intent;
};

const chooseResponse = (intent) => {
  if (!intent?.responses || intent.responses.length === 0) {
    return null;
  }

  const sorted = [...intent.responses].sort((a, b) => a.priority - b.priority);
  return sorted[0].responseText;
};

const isOrderNumber = (text = '') => {
  const normalized = normalizeText(text).replace(/\s+/g, '');
  return normalized.length >= 6 && normalized.length <= 30 && /[a-z]/.test(normalized) && /[0-9]/.test(normalized);
};

const isAffirmative = (text = '') => {
  const normalized = normalizeText(text);
  return ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'please', 'of course', 'please do'].includes(normalized);
};

const createFollowUpResponse = (lastAssistantMessage, userMessage) => {
  if (!lastAssistantMessage || !userMessage) return null;

  const normalizedUser = normalizeText(userMessage);
  const normalizedAssistant = normalizeText(lastAssistantMessage);

  if (isAffirmative(normalizedUser)) {
    if (normalizedAssistant.includes('compare') || normalizedAssistant.includes('view details') || normalizedAssistant.includes('product details') || normalizedAssistant.includes('details')) {
      return {
        reply: 'Please tell me the product name or ID you want details for, or ask me to compare specific items.',
        intent: 'product_search'
      };
    }

    if (normalizedAssistant.includes('order status') || normalizedAssistant.includes('order number') || normalizedAssistant.includes('delivery status') || normalizedAssistant.includes('track')) {
      return {
        reply: 'Please provide the order number and the email or phone used for checkout so I can help with order status.',
        intent: 'order_status'
      };
    }

    if (normalizedAssistant.includes('shipping') || normalizedAssistant.includes('delivery')) {
      return {
        reply: 'Tell me if you want shipping time, cost, or delivery options for your order.',
        intent: 'delivery_info'
      };
    }
  }

  if (normalizedUser.includes('view details') || normalizedUser.includes('details')) {
    return {
      reply: 'Please tell me the product name or ID for the item you want details on.',
      intent: 'product_search'
    };
  }

  if (normalizedUser.includes('order number') || normalizedUser.includes('order code')) {
    return {
      reply: 'I can help with your order status. Please provide the order number and the email used for checkout.',
      intent: 'order_status'
    };
  }

  return null;
};

const createOrderNumberReply = (message) => {
  if (!isOrderNumber(message)) return null;
  return {
    reply: 'I see an order code. Please also provide the email or phone used for checkout so I can help check the order status.',
    intent: 'order_status'
  };
};

const buildCatalogReply = async (context, catalogProducts = [], targetProductName = null) => {
  const categories = await Category.findAll({ attributes: ['name'], order: [['name', 'ASC']] });
  const categoryNames = categories.map((category) => category.name).filter(Boolean);

  if (!context.category && context.isCatalogQuestion && !context.actions.includes('colors') && !context.actions.includes('sizes') && !context.actions.includes('prices') && !context.actions.includes('highest_price') && !context.actions.includes('details')) {
    const preview = categoryNames.slice(0, 6).join(', ');
    return {
      reply: `We currently offer categories such as ${preview}. Ask me about shirts, sizes, colors, prices, or order status and I will pull the details from the catalog.`,
      intent: 'product_search',
      products: []
    };
  }

  const selectedProducts = targetProductName
    ? catalogProducts.filter((product) => normalizeText(product.name) === normalizeText(targetProductName))
    : catalogProducts;

  const whereClause = context.category && selectedProducts.length === 0
    ? {
        [Op.or]: [
          { name: { [Op.like]: `%${context.category}%` } },
          { description: { [Op.like]: `%${context.category}%` } },
          { '$category.name$': { [Op.like]: `%${context.category}%` } }
        ]
      }
    : {};

  const products = selectedProducts.length > 0
    ? selectedProducts
    : await Product.findAll({
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['name'],
            required: false
          },
          {
            model: ProductVariant,
            as: 'variants',
            attributes: ['size', 'color', 'quantity'],
            required: false
          }
        ],
        where: whereClause,
        attributes: ['id', 'name', 'description', 'price', 'categoryId'],
        order: [['price', 'DESC']],
        limit: 8
      });

  if (!products || products.length === 0) {
    return {
      reply: `I could not find any ${context.category || 'matching'} items in the catalog right now. Try asking for shirts, colors, sizes, or prices.`,
      intent: 'shirt_inventory',
      products: []
    };
  }

  const normalizedCategory = context.category || (targetProductName ? 'product' : 'products');
  const productList = products.map((product) => ({
    id: product.id,
    name: product.name,
    price: parseFloat(product.price),
    category: product.category ? product.category.name : 'Uncategorized'
  }));

  if (context.actions.includes('highest_price')) {
    const highest = productList.reduce((max, current) => (current.price > max.price ? current : max), productList[0]);
    const productLabel = targetProductName ? targetProductName : `${normalizedCategory} currently available`;
    return {
      reply: `The highest price for ${productLabel} is Rs. ${highest.price.toFixed(2)} for ${highest.name}.`,
      intent: 'shirt_inventory',
      products: productList
    };
  }

  const colors = [...new Set(products.flatMap((product) => (product.variants || []).map((variant) => variant.color)).filter(Boolean))];
  const sizes = [...new Set(products.flatMap((product) => (product.variants || []).map((variant) => variant.size)).filter(Boolean))];

  if (targetProductName) {
    const product = products[0];
    const productColors = [...new Set((product.variants || []).map((variant) => variant.color).filter(Boolean))];
    const productSizes = [...new Set((product.variants || []).map((variant) => variant.size).filter(Boolean))];

    if (context.actions.includes('colors')) {
      return {
        reply: `${product.name} is available in these colors: ${productColors.join(', ')}.`,
        intent: 'shirt_inventory',
        products: productList
      };
    }

    if (context.actions.includes('sizes')) {
      return {
        reply: `${product.name} is available in these sizes: ${productSizes.join(', ')}.`,
        intent: 'shirt_inventory',
        products: productList
      };
    }

    if (context.actions.includes('prices')) {
      return {
        reply: `${product.name} is priced at Rs. ${parseFloat(product.price).toFixed(2)}.`,
        intent: 'shirt_inventory',
        products: productList
      };
    }

    return {
      reply: `${product.name} is priced at Rs. ${parseFloat(product.price).toFixed(2)}. Available sizes are ${productSizes.join(', ')} and available colors are ${productColors.join(', ')}.`,
      intent: 'shirt_inventory',
      products: productList
    };
  }

  if (context.actions.includes('colors')) {
    return {
      reply: `${normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1)} color options currently available are ${colors.join(', ')}.`,
      intent: 'shirt_inventory',
      products: productList
    };
  }

  if (context.actions.includes('sizes')) {
    return {
      reply: `Available sizes for ${normalizedCategory} are ${sizes.join(', ')}.`,
      intent: 'shirt_inventory',
      products: productList
    };
  }

  if (context.actions.includes('prices')) {
    const pricesText = productList.map((product) => `${product.name} — Rs. ${product.price.toFixed(2)}`).join('; ');
    return {
      reply: `Current prices for ${normalizedCategory} are ${pricesText}.`,
      intent: 'shirt_inventory',
      products: productList
    };
  }

  if (context.actions.includes('details')) {
    const detailLines = productList.slice(0, 4).map((product) => `${product.name} — Rs. ${product.price.toFixed(2)} — sizes: ${sizes.join(', ')}`);
    return {
      reply: `Here are the latest ${normalizedCategory} details: ${detailLines.join(' | ')}.`,
      intent: 'shirt_inventory',
      products: productList
    };
  }

  const productLines = productList.slice(0, 4).map((product) => `${product.name} at Rs. ${product.price.toFixed(2)}`).join(', ');
  return {
    reply: `We currently have these ${normalizedCategory} options: ${productLines}. Sizes available are ${sizes.join(', ')} and colors available are ${colors.join(', ')}.`,
    intent: 'shirt_inventory',
    products: productList
  };
};

const buildOrderReply = async (message) => {
  const normalized = normalizeText(message);
  const orderNumberCandidate = normalized.match(/order\s*([a-z0-9-]+)/i);
  const orderNumber = orderNumberCandidate ? orderNumberCandidate[1] : null;
  const orderContext = getOrderQueryContext(message);

  if (orderContext.isOrderListQuery) {
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'order_number', 'status', 'total_bill', 'createdAt']
    });

    if (!orders || orders.length === 0) {
      return {
        reply: 'I could not find any orders in the system right now.',
        intent: 'order_status',
        products: []
      };
    }

    const orderSummary = orders.map((order) => `${order.order_number} — ${order.status} — Rs. ${parseFloat(order.total_bill || 0).toFixed(2)}`).join('; ');
    return {
      reply: `Here are your recent orders: ${orderSummary}.`,
      intent: 'order_status',
      products: []
    };
  }

  if (!orderNumber && (orderContext.isOrderStatusQuery || normalized.includes('where is my order') || normalized.includes('track order') || normalized.includes('order status') || normalized.includes('delivery status'))) {
    return {
      reply: 'Please share your order code so I can check the current status for you.',
      intent: 'order_status',
      products: []
    };
  }

  if (!orderNumber) {
    return null;
  }

  const order = await Order.findOne({
    where: { order_number: orderNumber },
    include: [
      {
        model: OrderItem,
        as: 'items',
        attributes: ['productId', 'size', 'color', 'quantity', 'price']
      }
    ]
  });

  if (!order) {
    return {
      reply: `I could not find an order with code ${orderNumber}. Please check the code and try again.`,
      intent: 'order_status',
      products: []
    };
  }

  const itemSummary = (order.items || []).map((item) => `${item.quantity} x item ${item.productId}`).join(', ');
  return {
    reply: `Your order ${order.order_number} is currently ${order.status}. ${itemSummary ? `Items: ${itemSummary}.` : ''}`,
    intent: 'order_status',
    products: []
  };
};

const buildProductReply = (products) => {
  if (!products || products.length === 0) {
    return null;
  }

  const names = products.slice(0, 3).map((p) => p.name).join(', ');
  const firstProduct = products[0];
  const count = products.length;

  return `I found ${count} product${count === 1 ? '' : 's'} matching your query. The first one is ${firstProduct.name} (${firstProduct.category}) priced at Rs. ${firstProduct.price.toFixed(2)}. ${count > 1 ? `Also available: ${names}.` : ''}`;
};

const createSession = async (userId, name = null) => {
  const session = await ChatbotSession.create({
    userId: userId || null,
    sessionName: name || `Chat session ${new Date().toLocaleString()}`
  });
  return session;
};

const saveMessage = async (sessionId, role, message, userId = null, metadata = null) => {
  return ChatbotMessage.create({
    sessionId,
    userId: userId || null,
    role,
    sender: role === 'assistant' ? 'bot' : 'user',
    message,
    metadata: metadata || null
  });
};

const saveUnknown = async (userId, question, metadata = null) => {
  return ChatbotUnknownQuestion.create({
    userId: userId || null,
    question,
    metadata: metadata || null,
    handled: false
  });
};

const classifyMessage = async (message, lastAssistantMessage = null) => {
  const activeIntents = await fetchActiveIntents();

  const followUp = createFollowUpResponse(lastAssistantMessage, message);
  if (followUp) {
    return {
      reply: followUp.reply,
      intent: followUp.intent,
      products: [],
      matchedIntent: { name: followUp.intent }
    };
  }

  const orderReply = await buildOrderReply(message);
  if (orderReply) {
    return {
      reply: orderReply.reply,
      intent: orderReply.intent,
      products: orderReply.products,
      matchedIntent: { name: orderReply.intent }
    };
  }

  const categories = await Category.findAll({ attributes: ['name'] });
  const queryContext = getProductQueryContext(message, categories);
  const catalogProducts = await Product.findAll({
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['name'],
        required: false
      },
      {
        model: ProductVariant,
        as: 'variants',
        attributes: ['size', 'color', 'quantity'],
        required: false
      }
    ],
    attributes: ['id', 'name', 'description', 'price', 'categoryId'],
    order: [['name', 'ASC']],
    limit: 20
  });
  const targetProductName = extractTargetProduct(message, catalogProducts.map((product) => product.name));
  const productReply = await buildCatalogReply(queryContext, catalogProducts, targetProductName);
  if (productReply && (queryContext.category || queryContext.actions.length > 0 || queryContext.isCatalogQuestion || targetProductName)) {
    return {
      reply: productReply.reply,
      intent: productReply.intent,
      products: productReply.products,
      matchedIntent: { name: productReply.intent }
    };
  }

  const matchedIntent = chooseIntent(message, activeIntents);
  const products = await searchProducts(message);
  let reply = null;
  let usedIntent = null;

  if (matchedIntent) {
    usedIntent = matchedIntent;
    reply = chooseResponse(matchedIntent);
  }

  if (!reply && isOrderNumber(message)) {
    const orderReply = createOrderNumberReply(message);
    if (orderReply) {
      return {
        reply: orderReply.reply,
        intent: orderReply.intent,
        products: [],
        matchedIntent: { name: orderReply.intent }
      };
    }
  }

  if (!reply && products.length > 0) {
    reply = buildProductReply(products) || 'I found some products that may match your request.';
  }

  if (!reply) {
    reply = 'I\'m sorry, I didn\'t understand that. Please try asking in a different way, or tell me whether you need help with orders, shipping, returns, payment, or sizes.';
  }

  return {
    reply,
    intent: usedIntent ? usedIntent.name : null,
    products,
    matchedIntent: usedIntent
  };
};

module.exports = {
  parseUserFromRequest,
  ensureDefaultIntents,
  createSession,
  saveMessage,
  saveUnknown,
  classifyMessage,
  searchProducts,
  getProductQueryContext,
  getOrderQueryContext
};
