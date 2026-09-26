export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'INR' | 'CHF';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateAgainstUSD: number; // For currency switching display
}

export type CategoryType = 'need' | 'want' | 'savings' | 'debt';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  budgetLimit: number;
  isCustom?: boolean;
}

export type PaymentMethod = 
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'cash'
  | 'paypal'
  | 'apple_pay'
  | 'other';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'expense' | 'income';
  categoryId: string;
  categoryName: string;
  date: string; // YYYY-MM-DD
  payee: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';
  tags?: string[];
  createdAt: string;
}

export interface SavingGoal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  category: string;
  icon: string;
  color: string;
  monthlyContributionTarget: number;
  createdAt: string;
}

export interface UserSecuritySettings {
  sessionTimeoutMinutes: number;
  failedLoginAttempts: number;
  lockedUntil: number | null; // timestamp ms
  lastPasswordChange: string;
  requireStrongPassword: boolean;
  twoFactorSimulated: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  currency: CurrencyCode;
  monthlyIncomeTarget: number;
  createdAt: string;
  lastLoginAt: string;
  securitySettings: UserSecuritySettings;
}

export interface UserCredentials {
  userId: string;
  email: string;
  passwordHash: string; // PBKDF2 SHA-256
  salt: string; // Hex string
  iterations: number;
}

export interface AuthSession {
  token: string;
  userId: string;
  expiresAt: number; // timestamp ms
  rememberMe: boolean;
}

export interface Recommendation {
  id: string;
  title: string;
  category: string;
  potentialSavingsMonthly: number;
  potentialSavingsAnnual: number;
  impact: 'high' | 'medium' | 'low';
  type: 'dining_cut' | 'subscription_trim' | 'budget_creep' | 'needs_wants_rebalance' | 'micro_spending' | 'smart_habit' | 'emergency_boost' | 'ai_insight';
  description: string;
  reasoning: string;
  actionLabel: string;
  actionType: 'adjust_budget' | 'cancel_recurring' | 'view_transactions' | 'view_goals' | 'view_analytics';
  targetCategoryId?: string;
  targetAmount?: number;
  applied?: boolean;
}

export interface MonthlyBudgetSummary {
  month: string; // YYYY-MM
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number; // percentage (0-100)
  totalBudgetLimit: number;
  budgetUtilization: number; // percentage
  daysInMonth: number;
  daysElapsed: number;
  daysRemaining: number;
  expectedPacePercentage: number;
  dailyAverageSpend: number;
  recommendedDailyRemaining: number;
  needsSpend: number;
  wantsSpend: number;
  savingsSpend: number;
}
