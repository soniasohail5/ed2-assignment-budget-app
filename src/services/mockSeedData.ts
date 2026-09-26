import { Category, Transaction, SavingGoal } from '../types/finance';

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Housing & Rent', type: 'need', icon: 'Home', color: '#6366f1', budgetLimit: 1450 },
  { name: 'Groceries & Household', type: 'need', icon: 'ShoppingCart', color: '#10b981', budgetLimit: 450 },
  { name: 'Dining Out & Coffee', type: 'want', icon: 'UtensilsCrossed', color: '#f59e0b', budgetLimit: 320 },
  { name: 'Utilities & Internet', type: 'need', icon: 'Zap', color: '#06b6d4', budgetLimit: 220 },
  { name: 'Transportation & Gas', type: 'need', icon: 'Car', color: '#8b5cf6', budgetLimit: 280 },
  { name: 'Subscriptions & Streaming', type: 'want', icon: 'Tv', color: '#ec4899', budgetLimit: 95 },
  { name: 'Health & Wellness', type: 'need', icon: 'HeartPulse', color: '#14b8a6', budgetLimit: 140 },
  { name: 'Shopping & Discretionary', type: 'want', icon: 'ShoppingBag', color: '#f97316', budgetLimit: 250 },
  { name: 'Entertainment & Leisure', type: 'want', icon: 'Gamepad2', color: '#eab308', budgetLimit: 180 },
  { name: 'Savings & Investments', type: 'savings', icon: 'PiggyBank', color: '#22c55e', budgetLimit: 600 },
  { name: 'Debt & Loans', type: 'debt', icon: 'CreditCard', color: '#ef4444', budgetLimit: 200 },
  { name: 'Miscellaneous', type: 'want', icon: 'HelpCircle', color: '#94a3b8', budgetLimit: 100 },
];

export function getInitialSeedData(userId: string) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const pad = (d: number) => String(d).padStart(2, '0');

  const categories: Category[] = DEFAULT_CATEGORIES.map((cat, idx) => ({
    ...cat,
    id: `cat_${idx + 1}`
  }));

  const catMap = new Map(categories.map(c => [c.name, c.id]));

  // Realistic transactions across the current month
  const transactions: Transaction[] = [
    // Income
    {
      id: 'tx_inc_1',
      userId,
      amount: 3200,
      type: 'income',
      categoryId: 'inc_salary',
      categoryName: 'Salary / Primary Income',
      date: `${year}-${month}-01`,
      payee: 'TechCorp Global Inc.',
      paymentMethod: 'bank_transfer',
      notes: 'Direct deposit - First half payroll',
      isRecurring: true,
      recurringFrequency: 'monthly',
      createdAt: `${year}-${month}-01T09:00:00Z`
    },
    {
      id: 'tx_inc_2',
      userId,
      amount: 650,
      type: 'income',
      categoryId: 'inc_freelance',
      categoryName: 'Freelance & Side Gig',
      date: `${year}-${month}-12`,
      payee: 'Acme Design Agency',
      paymentMethod: 'bank_transfer',
      notes: 'UI/UX consulting retainer',
      createdAt: `${year}-${month}-12T14:30:00Z`
    },

    // Fixed Needs
    {
      id: 'tx_exp_1',
      userId,
      amount: 1400,
      type: 'expense',
      categoryId: catMap.get('Housing & Rent') || 'cat_1',
      categoryName: 'Housing & Rent',
      date: `${year}-${month}-01`,
      payee: 'Oakwood Apartments',
      paymentMethod: 'bank_transfer',
      notes: 'Monthly apartment lease payment',
      isRecurring: true,
      recurringFrequency: 'monthly',
      createdAt: `${year}-${month}-01T10:00:00Z`
    },
    {
      id: 'tx_exp_2',
      userId,
      amount: 85,
      type: 'expense',
      categoryId: catMap.get('Utilities & Internet') || 'cat_4',
      categoryName: 'Utilities & Internet',
      date: `${year}-${month}-03`,
      payee: 'FiberOptic Internet',
      paymentMethod: 'credit_card',
      notes: 'Gigabit fiber internet bill',
      isRecurring: true,
      recurringFrequency: 'monthly',
      createdAt: `${year}-${month}-03T11:00:00Z`
    },
    {
      id: 'tx_exp_3',
      userId,
      amount: 112.50,
      type: 'expense',
      categoryId: catMap.get('Utilities & Internet') || 'cat_4',
      categoryName: 'Utilities & Internet',
      date: `${year}-${month}-07`,
      payee: 'City Energy & Power',
      paymentMethod: 'credit_card',
      notes: 'Electric & gas utility',
      createdAt: `${year}-${month}-07T08:30:00Z`
    },

    // Groceries (Needs)
    {
      id: 'tx_exp_4',
      userId,
      amount: 124.60,
      type: 'expense',
      categoryId: catMap.get('Groceries & Household') || 'cat_2',
      categoryName: 'Groceries & Household',
      date: `${year}-${month}-02`,
      payee: 'Whole Foods Market',
      paymentMethod: 'credit_card',
      notes: 'Weekly fresh produce & pantry essentials',
      createdAt: `${year}-${month}-02T16:20:00Z`
    },
    {
      id: 'tx_exp_5',
      userId,
      amount: 88.20,
      type: 'expense',
      categoryId: catMap.get('Groceries & Household') || 'cat_2',
      categoryName: 'Groceries & Household',
      date: `${year}-${month}-10`,
      payee: "Trader Joe's",
      paymentMethod: 'debit_card',
      notes: 'Snacks, frozen meals, and staples',
      createdAt: `${year}-${month}-10T17:15:00Z`
    },
    {
      id: 'tx_exp_6',
      userId,
      amount: 115.40,
      type: 'expense',
      categoryId: catMap.get('Groceries & Household') || 'cat_2',
      categoryName: 'Groceries & Household',
      date: `${year}-${month}-18`,
      payee: 'Target Supercenter',
      paymentMethod: 'credit_card',
      notes: 'Groceries & bathroom toiletries',
      createdAt: `${year}-${month}-18T18:40:00Z`
    },

    // Dining Out & Coffee (Notice: High spending pattern opportunity for recommendation!)
    {
      id: 'tx_exp_7',
      userId,
      amount: 62.40,
      type: 'expense',
      categoryId: catMap.get('Dining Out & Coffee') || 'cat_3',
      categoryName: 'Dining Out & Coffee',
      date: `${year}-${month}-04`,
      payee: 'Bella Italia Bistro',
      paymentMethod: 'credit_card',
      notes: 'Dinner with coworker',
      createdAt: `${year}-${month}-04T19:30:00Z`
    },
    {
      id: 'tx_exp_8',
      userId,
      amount: 38.50,
      type: 'expense',
      categoryId: catMap.get('Dining Out & Coffee') || 'cat_3',
      categoryName: 'Dining Out & Coffee',
      date: `${year}-${month}-06`,
      payee: 'DoorDash - Thai Express',
      paymentMethod: 'apple_pay',
      notes: 'Late delivery order',
      createdAt: `${year}-${month}-06T20:45:00Z`
    },
    {
      id: 'tx_exp_9',
      userId,
      amount: 8.75,
      type: 'expense',
      categoryId: catMap.get('Dining Out & Coffee') || 'cat_3',
      categoryName: 'Dining Out & Coffee',
      date: `${year}-${month}-08`,
      payee: 'Blue Bottle Coffee',
      paymentMethod: 'apple_pay',
      notes: 'Latte & almond croissant',
      createdAt: `${year}-${month}-08T08:15:00Z`
    },
    {
      id: 'tx_exp_10',
      userId,
      amount: 54.00,
      type: 'expense',
      categoryId: catMap.get('Dining Out & Coffee') || 'cat_3',
      categoryName: 'Dining Out & Coffee',
      date: `${year}-${month}-11`,
      payee: 'Uber Eats - Sushi Sake',
      paymentMethod: 'apple_pay',
      notes: 'Friday night takeout',
      createdAt: `${year}-${month}-11T19:10:00Z`
    },
    {
      id: 'tx_exp_11',
      userId,
      amount: 72.80,
      type: 'expense',
      categoryId: catMap.get('Dining Out & Coffee') || 'cat_3',
      categoryName: 'Dining Out & Coffee',
      date: `${year}-${month}-15`,
      payee: 'Harbor Grill & Taphouse',
      paymentMethod: 'credit_card',
      notes: 'Weekend dinner & drinks',
      createdAt: `${year}-${month}-15T21:00:00Z`
    },
    {
      id: 'tx_exp_12',
      userId,
      amount: 9.50,
      type: 'expense',
      categoryId: catMap.get('Dining Out & Coffee') || 'cat_3',
      categoryName: 'Dining Out & Coffee',
      date: `${year}-${month}-19`,
      payee: 'Artisan Roastery',
      paymentMethod: 'apple_pay',
      notes: 'Cold brew & pastry',
      createdAt: `${year}-${month}-19T09:20:00Z`
    },
    {
      id: 'tx_exp_13',
      userId,
      amount: 46.00,
      type: 'expense',
      categoryId: catMap.get('Dining Out & Coffee') || 'cat_3',
      categoryName: 'Dining Out & Coffee',
      date: `${year}-${month}-22`,
      payee: 'Chipotle & Juice Bar',
      paymentMethod: 'credit_card',
      notes: 'Lunch with friend',
      createdAt: `${year}-${month}-22T13:10:00Z`
    },

    // Subscriptions (Recurring audit opportunity)
    {
      id: 'tx_exp_14',
      userId,
      amount: 19.99,
      type: 'expense',
      categoryId: catMap.get('Subscriptions & Streaming') || 'cat_6',
      categoryName: 'Subscriptions & Streaming',
      date: `${year}-${month}-05`,
      payee: 'Netflix 4K Ultra',
      paymentMethod: 'credit_card',
      notes: 'Monthly streaming plan',
      isRecurring: true,
      recurringFrequency: 'monthly',
      createdAt: `${year}-${month}-05T03:00:00Z`
    },
    {
      id: 'tx_exp_15',
      userId,
      amount: 11.99,
      type: 'expense',
      categoryId: catMap.get('Subscriptions & Streaming') || 'cat_6',
      categoryName: 'Subscriptions & Streaming',
      date: `${year}-${month}-09`,
      payee: 'Spotify Premium Family',
      paymentMethod: 'credit_card',
      notes: 'Music streaming',
      isRecurring: true,
      recurringFrequency: 'monthly',
      createdAt: `${year}-${month}-09T03:00:00Z`
    },
    {
      id: 'tx_exp_16',
      userId,
      amount: 14.99,
      type: 'expense',
      categoryId: catMap.get('Subscriptions & Streaming') || 'cat_6',
      categoryName: 'Subscriptions & Streaming',
      date: `${year}-${month}-12`,
      payee: 'HBO Max Streaming',
      paymentMethod: 'credit_card',
      notes: 'Video on demand',
      isRecurring: true,
      recurringFrequency: 'monthly',
      createdAt: `${year}-${month}-12T04:00:00Z`
    },
    {
      id: 'tx_exp_17',
      userId,
      amount: 22.00,
      type: 'expense',
      categoryId: catMap.get('Subscriptions & Streaming') || 'cat_6',
      categoryName: 'Subscriptions & Streaming',
      date: `${year}-${month}-14`,
      payee: 'Cloud Storage & Productivity Pro',
      paymentMethod: 'credit_card',
      notes: 'Cloud backup service',
      isRecurring: true,
      recurringFrequency: 'monthly',
      createdAt: `${year}-${month}-14T02:00:00Z`
    },
    {
      id: 'tx_exp_18',
      userId,
      amount: 12.99,
      type: 'expense',
      categoryId: catMap.get('Subscriptions & Streaming') || 'cat_6',
      categoryName: 'Subscriptions & Streaming',
      date: `${year}-${month}-20`,
      payee: 'Audible Audiobooks',
      paymentMethod: 'credit_card',
      notes: 'Monthly credit unused for 2 months',
      isRecurring: true,
      recurringFrequency: 'monthly',
      createdAt: `${year}-${month}-20T05:00:00Z`
    },

    // Transportation
    {
      id: 'tx_exp_19',
      userId,
      amount: 58.00,
      type: 'expense',
      categoryId: catMap.get('Transportation & Gas') || 'cat_5',
      categoryName: 'Transportation & Gas',
      date: `${year}-${month}-05`,
      payee: 'Shell Fuel Station',
      paymentMethod: 'credit_card',
      notes: 'Full tank premium gas',
      createdAt: `${year}-${month}-05T12:00:00Z`
    },
    {
      id: 'tx_exp_20',
      userId,
      amount: 32.50,
      type: 'expense',
      categoryId: catMap.get('Transportation & Gas') || 'cat_5',
      categoryName: 'Transportation & Gas',
      date: `${year}-${month}-13`,
      payee: 'Metro Rapid Transit Pass',
      paymentMethod: 'apple_pay',
      notes: 'Subway reload card',
      createdAt: `${year}-${month}-13T08:00:00Z`
    },
    {
      id: 'tx_exp_21',
      userId,
      amount: 62.00,
      type: 'expense',
      categoryId: catMap.get('Transportation & Gas') || 'cat_5',
      categoryName: 'Transportation & Gas',
      date: `${year}-${month}-21`,
      payee: 'Chevron Gas Station',
      paymentMethod: 'credit_card',
      notes: 'Gas fill-up',
      createdAt: `${year}-${month}-21T17:30:00Z`
    },

    // Health & Wellness
    {
      id: 'tx_exp_22',
      userId,
      amount: 65.00,
      type: 'expense',
      categoryId: catMap.get('Health & Wellness') || 'cat_7',
      categoryName: 'Health & Wellness',
      date: `${year}-${month}-02`,
      payee: 'Equinox Gym & Climbing',
      paymentMethod: 'bank_transfer',
      notes: 'Monthly health club membership',
      isRecurring: true,
      recurringFrequency: 'monthly',
      createdAt: `${year}-${month}-02T06:00:00Z`
    },
    {
      id: 'tx_exp_23',
      userId,
      amount: 34.20,
      type: 'expense',
      categoryId: catMap.get('Health & Wellness') || 'cat_7',
      categoryName: 'Health & Wellness',
      date: `${year}-${month}-16`,
      payee: 'CVS Pharmacy',
      paymentMethod: 'debit_card',
      notes: 'Vitamins & allergy medication',
      createdAt: `${year}-${month}-16T15:10:00Z`
    },

    // Shopping
    {
      id: 'tx_exp_24',
      userId,
      amount: 119.00,
      type: 'expense',
      categoryId: catMap.get('Shopping & Discretionary') || 'cat_8',
      categoryName: 'Shopping & Discretionary',
      date: `${year}-${month}-14`,
      payee: 'Nordstrom Rack',
      paymentMethod: 'credit_card',
      notes: 'Running shoes & athletic socks',
      createdAt: `${year}-${month}-14T15:45:00Z`
    },

    // Entertainment
    {
      id: 'tx_exp_25',
      userId,
      amount: 45.00,
      type: 'expense',
      categoryId: catMap.get('Entertainment & Leisure') || 'cat_9',
      categoryName: 'Entertainment & Leisure',
      date: `${year}-${month}-17`,
      payee: 'AMC Theatres IMAX',
      paymentMethod: 'credit_card',
      notes: '2 movie tickets & popcorn combo',
      createdAt: `${year}-${month}-17T20:15:00Z`
    },

    // Debt repayment
    {
      id: 'tx_exp_26',
      userId,
      amount: 180.00,
      type: 'expense',
      categoryId: catMap.get('Debt & Loans') || 'cat_11',
      categoryName: 'Debt & Loans',
      date: `${year}-${month}-15`,
      payee: 'Student Loan Servicer',
      paymentMethod: 'bank_transfer',
      notes: 'Standard monthly repayment',
      isRecurring: true,
      recurringFrequency: 'monthly',
      createdAt: `${year}-${month}-15T10:00:00Z`
    },

    // Savings transfer
    {
      id: 'tx_exp_27',
      userId,
      amount: 400.00,
      type: 'expense',
      categoryId: catMap.get('Savings & Investments') || 'cat_10',
      categoryName: 'Savings & Investments',
      date: `${year}-${month}-02`,
      payee: 'High-Yield Savings Auto-Deposit',
      paymentMethod: 'bank_transfer',
      notes: 'Monthly emergency fund contribution',
      isRecurring: true,
      recurringFrequency: 'monthly',
      createdAt: `${year}-${month}-02T09:30:00Z`
    }
  ];

  const goals: SavingGoal[] = [
    {
      id: 'goal_1',
      userId,
      title: '6-Month Emergency Fund',
      targetAmount: 12000,
      currentAmount: 7800,
      deadline: `${year + 1}-03-31`,
      category: 'Safety Net',
      icon: 'ShieldCheck',
      color: '#10b981',
      monthlyContributionTarget: 400,
      createdAt: `${year}-01-15T00:00:00Z`
    },
    {
      id: 'goal_2',
      userId,
      title: 'European Autumn Vacation',
      targetAmount: 3500,
      currentAmount: 2150,
      deadline: `${year + 1}-09-15`,
      category: 'Travel',
      icon: 'Plane',
      color: '#3b82f6',
      monthlyContributionTarget: 150,
      createdAt: `${year}-03-10T00:00:00Z`
    },
    {
      id: 'goal_3',
      userId,
      title: 'New M4 MacBook Pro',
      targetAmount: 2200,
      currentAmount: 1650,
      deadline: `${year}-12-20`,
      category: 'Tech Upgrade',
      icon: 'Laptop',
      color: '#8b5cf6',
      monthlyContributionTarget: 100,
      createdAt: `${year}-05-01T00:00:00Z`
    }
  ];

  return { categories, transactions, goals };
}
