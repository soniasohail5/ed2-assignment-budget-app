import { Category, Transaction, SavingGoal, MonthlyBudgetSummary, CurrencyCode } from '../types/finance';
import { getInitialSeedData, DEFAULT_CATEGORIES } from './mockSeedData';

export const CURRENCY_CONFIGS: Record<CurrencyCode, { symbol: string; name: string; rateAgainstUSD: number }> = {
  USD: { symbol: '$', name: 'US Dollar', rateAgainstUSD: 1.0 },
  EUR: { symbol: '€', name: 'Euro', rateAgainstUSD: 0.92 },
  GBP: { symbol: '£', name: 'British Pound', rateAgainstUSD: 0.79 },
  JPY: { symbol: '¥', name: 'Japanese Yen', rateAgainstUSD: 153.0 },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar', rateAgainstUSD: 1.38 },
  AUD: { symbol: 'A$', name: 'Australian Dollar', rateAgainstUSD: 1.54 },
  INR: { symbol: '₹', name: 'Indian Rupee', rateAgainstUSD: 85.5 },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', rateAgainstUSD: 0.90 },
};

export class StorageService {
  private static getKey(userId: string, suffix: string): string {
    return `clarityspend_user_${userId}_${suffix}`;
  }

  // Categories
  static getCategories(userId: string): Category[] {
    try {
      const raw = localStorage.getItem(this.getKey(userId, 'categories'));
      if (!raw) {
        const seed = getInitialSeedData(userId);
        this.saveCategories(userId, seed.categories);
        return seed.categories;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error fetching categories:', e);
      return [];
    }
  }

  static saveCategories(userId: string, categories: Category[]): void {
    localStorage.setItem(this.getKey(userId, 'categories'), JSON.stringify(categories));
  }

  static updateCategoryBudget(userId: string, categoryId: string, newLimit: number): Category[] {
    const categories = this.getCategories(userId);
    const updated = categories.map(c => (c.id === categoryId ? { ...c, budgetLimit: Math.max(0, newLimit) } : c));
    this.saveCategories(userId, updated);
    return updated;
  }

  static addCategory(userId: string, category: Omit<Category, 'id'>): Category {
    const categories = this.getCategories(userId);
    const newCat: Category = {
      ...category,
      id: `cat_custom_${Date.now()}`,
      isCustom: true,
    };
    categories.push(newCat);
    this.saveCategories(userId, categories);
    return newCat;
  }

  static deleteCategory(userId: string, categoryId: string): void {
    const categories = this.getCategories(userId).filter(c => c.id !== categoryId);
    this.saveCategories(userId, categories);
  }

  // Transactions
  static getTransactions(userId: string): Transaction[] {
    try {
      const raw = localStorage.getItem(this.getKey(userId, 'transactions'));
      if (!raw) {
        const seed = getInitialSeedData(userId);
        this.saveTransactions(userId, seed.transactions);
        return seed.transactions;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error fetching transactions:', e);
      return [];
    }
  }

  static saveTransactions(userId: string, transactions: Transaction[]): void {
    localStorage.setItem(this.getKey(userId, 'transactions'), JSON.stringify(transactions));
  }

  static addTransaction(userId: string, transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>): Transaction {
    const transactions = this.getTransactions(userId);
    const newTx: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      createdAt: new Date().toISOString(),
    };
    transactions.unshift(newTx);
    this.saveTransactions(userId, transactions);
    return newTx;
  }

  static updateTransaction(userId: string, id: string, updates: Partial<Transaction>): Transaction[] {
    const transactions = this.getTransactions(userId);
    const updated = transactions.map(tx => (tx.id === id ? { ...tx, ...updates } : tx));
    this.saveTransactions(userId, updated);
    return updated;
  }

  static deleteTransaction(userId: string, id: string): Transaction[] {
    const transactions = this.getTransactions(userId).filter(tx => tx.id !== id);
    this.saveTransactions(userId, transactions);
    return transactions;
  }

  // Savings Goals
  static getGoals(userId: string): SavingGoal[] {
    try {
      const raw = localStorage.getItem(this.getKey(userId, 'goals'));
      if (!raw) {
        const seed = getInitialSeedData(userId);
        this.saveGoals(userId, seed.goals);
        return seed.goals;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error fetching goals:', e);
      return [];
    }
  }

  static saveGoals(userId: string, goals: SavingGoal[]): void {
    localStorage.setItem(this.getKey(userId, 'goals'), JSON.stringify(goals));
  }

  static addGoal(userId: string, goal: Omit<SavingGoal, 'id' | 'userId' | 'createdAt'>): SavingGoal {
    const goals = this.getGoals(userId);
    const newGoal: SavingGoal = {
      ...goal,
      id: `goal_${Date.now()}`,
      userId,
      createdAt: new Date().toISOString(),
    };
    goals.push(newGoal);
    this.saveGoals(userId, goals);
    return newGoal;
  }

  static updateGoalContribution(userId: string, goalId: string, addAmount: number): SavingGoal[] {
    const goals = this.getGoals(userId);
    const updated = goals.map(g => {
      if (g.id === goalId) {
        const newAmount = Math.max(0, g.currentAmount + addAmount);
        return { ...g, currentAmount: newAmount };
      }
      return g;
    });
    this.saveGoals(userId, updated);
    return updated;
  }

  static deleteGoal(userId: string, goalId: string): SavingGoal[] {
    const goals = this.getGoals(userId).filter(g => g.id !== goalId);
    this.saveGoals(userId, goals);
    return goals;
  }

  // Analytics & Summary computation for a given month (YYYY-MM)
  static getMonthlySummary(userId: string, yearMonth?: string): MonthlyBudgetSummary {
    const now = new Date();
    const currentYearMonth = yearMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [yearStr, monthStr] = currentYearMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const daysInMonth = new Date(year, month, 0).getDate();
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
    const daysElapsed = isCurrentMonth ? Math.min(now.getDate(), daysInMonth) : daysInMonth;
    const daysRemaining = Math.max(1, daysInMonth - daysElapsed);

    const categories = this.getCategories(userId);
    const transactions = this.getTransactions(userId);

    const monthTx = transactions.filter(tx => tx.date.startsWith(currentYearMonth));

    let totalIncome = 0;
    let totalExpenses = 0;
    let needsSpend = 0;
    let wantsSpend = 0;
    let savingsSpend = 0;

    const catTypeMap = new Map<string, string>();
    categories.forEach(c => {
      catTypeMap.set(c.id, c.type);
      catTypeMap.set(c.name.toLowerCase(), c.type);
    });

    monthTx.forEach(tx => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpenses += tx.amount;
        const type = catTypeMap.get(tx.categoryId) || catTypeMap.get(tx.categoryName.toLowerCase()) || 'want';
        if (type === 'need') needsSpend += tx.amount;
        else if (type === 'savings') savingsSpend += tx.amount;
        else wantsSpend += tx.amount;
      }
    });

    const totalBudgetLimit = categories.reduce((sum, c) => sum + (c.budgetLimit || 0), 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;
    const budgetUtilization = totalBudgetLimit > 0 ? (totalExpenses / totalBudgetLimit) * 100 : 0;
    const expectedPacePercentage = (daysElapsed / daysInMonth) * 100;
    const dailyAverageSpend = daysElapsed > 0 ? totalExpenses / daysElapsed : 0;

    const budgetRemaining = Math.max(0, totalBudgetLimit - totalExpenses);
    const recommendedDailyRemaining = daysRemaining > 0 ? budgetRemaining / daysRemaining : 0;

    return {
      month: currentYearMonth,
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      totalBudgetLimit,
      budgetUtilization,
      daysInMonth,
      daysElapsed,
      daysRemaining,
      expectedPacePercentage,
      dailyAverageSpend,
      recommendedDailyRemaining,
      needsSpend,
      wantsSpend,
      savingsSpend,
    };
  }

  // CSV Export
  static exportTransactionsToCSV(userId: string): string {
    const transactions = this.getTransactions(userId);
    const headers = ['ID', 'Date', 'Type', 'Category', 'Payee', 'Amount', 'Payment Method', 'Notes', 'Recurring'];
    const rows = transactions.map(tx => [
      `"${tx.id}"`,
      `"${tx.date}"`,
      `"${tx.type}"`,
      `"${tx.categoryName.replace(/"/g, '""')}"`,
      `"${tx.payee.replace(/"/g, '""')}"`,
      tx.amount.toFixed(2),
      `"${tx.paymentMethod}"`,
      `"${(tx.notes || '').replace(/"/g, '""')}"`,
      tx.isRecurring ? 'Yes' : 'No'
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  // Backup data export
  static exportUserDataJSON(userId: string): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      categories: this.getCategories(userId),
      transactions: this.getTransactions(userId),
      goals: this.getGoals(userId),
    };
    return JSON.stringify(data, null, 2);
  }

  // Restore data from JSON
  static importUserDataJSON(userId: string, jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.categories)) this.saveCategories(userId, data.categories);
      if (Array.isArray(data.transactions)) this.saveTransactions(userId, data.transactions);
      if (Array.isArray(data.goals)) this.saveGoals(userId, data.goals);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  // Reset to rich sample data
  static resetUserData(userId: string): void {
    const seed = getInitialSeedData(userId);
    this.saveCategories(userId, seed.categories);
    this.saveTransactions(userId, seed.transactions);
    this.saveGoals(userId, seed.goals);
  }
}
