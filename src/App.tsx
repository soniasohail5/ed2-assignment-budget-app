import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { AccountView } from './components/AccountView';
import { DashboardView } from './components/DashboardView';
import { VisualAnalyticsView } from './components/VisualAnalyticsView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetsView } from './components/BudgetsView';
import { RecommendationsView } from './components/RecommendationsView';
import { SavingsGoalsView } from './components/SavingsGoalsView';
import { AuthModal } from './components/AuthModal';
import { AddTransactionModal } from './components/AddTransactionModal';

import { AuthService } from './services/authService';
import { StorageService, CURRENCY_CONFIGS } from './services/storageService';
import { RecommendationEngine } from './services/recommendationEngine';
import { User, Category, Transaction, SavingGoal, CurrencyCode } from './types/finance';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Selected month format: YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingGoal[]>([]);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Initialize Auth: check existing active session
  useEffect(() => {
    const existing = AuthService.getCurrentUser();
    if (existing) {
      setUser(existing);
    }
    setIsInitializing(false);
  }, []);

  // Reload user data when active user changes
  const reloadData = useCallback((userId: string) => {
    const cats = StorageService.getCategories(userId);
    const txs = StorageService.getTransactions(userId);
    const gls = StorageService.getGoals(userId);

    setCategories(cats);
    setTransactions(txs);
    setGoals(gls);
  }, []);

  useEffect(() => {
    if (user) {
      reloadData(user.id);
    }
  }, [user, reloadData]);

  // Currency symbol
  const currencySymbol = useMemo(() => {
    const code = user?.currency || 'USD';
    return CURRENCY_CONFIGS[code]?.symbol || '$';
  }, [user?.currency]);

  // Monthly summary computed for selected month
  const monthlySummary = useMemo(() => {
    if (!user) return null;
    return StorageService.getMonthlySummary(user.id, selectedMonth);
  }, [user, selectedMonth, categories, transactions]);

  // Recommendations calculated dynamically
  const recommendations = useMemo(() => {
    if (!monthlySummary) return [];
    return RecommendationEngine.generateRecommendations({
      categories,
      transactions,
      summary: monthlySummary,
      goals,
      currencySymbol,
    });
  }, [categories, transactions, monthlySummary, goals, currencySymbol]);

  // Handlers for Transactions
  const handleSaveTransaction = (txData: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    if (editingTransaction) {
      const updated = StorageService.updateTransaction(user.id, editingTransaction.id, txData);
      setTransactions(updated);
      setEditingTransaction(null);
    } else {
      const newTx = StorageService.addTransaction(user.id, txData);
      setTransactions(prev => [newTx, ...prev]);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (!user) return;
    const updated = StorageService.deleteTransaction(user.id, id);
    setTransactions(updated);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddTxOpen(true);
  };

  // Handlers for Budgets & Categories
  const handleUpdateCategoryBudget = (catId: string, limit: number) => {
    if (!user) return;
    const updated = StorageService.updateCategoryBudget(user.id, catId, limit);
    setCategories(updated);
  };

  const handleAddCategory = (catData: Omit<Category, 'id'>) => {
    if (!user) return;
    const newCat = StorageService.addCategory(user.id, catData);
    setCategories(prev => [...prev, newCat]);
  };

  const handleDeleteCategory = (catId: string) => {
    if (!user) return;
    StorageService.deleteCategory(user.id, catId);
    setCategories(prev => prev.filter(c => c.id !== catId));
  };

  // Handlers for Goals
  const handleAddGoal = (goalData: Omit<SavingGoal, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newGoal = StorageService.addGoal(user.id, goalData);
    setGoals(prev => [...prev, newGoal]);
  };

  const handleGoalContribute = (goalId: string, amount: number) => {
    if (!user) return;
    const updated = StorageService.updateGoalContribution(user.id, goalId, amount);
    setGoals(updated);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (!user) return;
    const updated = StorageService.deleteGoal(user.id, goalId);
    setGoals(updated);
  };

  // Currency & User handlers
  const handleCurrencyChange = (code: CurrencyCode) => {
    if (!user) return;
    const updated = AuthService.updateUserProfile(user.id, { currency: code });
    setUser(updated);
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
  };

  const handleResetData = () => {
    if (!user) return;
    StorageService.resetUserData(user.id);
    reloadData(user.id);
  };

  const handleSwitchAccount = () => {
    AuthService.logout();
    setUser(null);
  };

  const handleDeleteAccount = () => {
    setUser(null);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold">Initializing ClaritySpend Engine...</span>
        </div>
      </div>
    );
  }

  // If user is not logged in, render the dedicated Login & Register Page
  if (!user) {
    return (
      <LoginPage
        onLoginSuccess={loggedInUser => {
          setUser(loggedInUser);
          reloadData(loggedInUser.id);
          setActiveTab('dashboard');
        }}
      />
    );
  }

  if (!monthlySummary) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold">Computing budget analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Navigation Header */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddTxOpen(true);
        }}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onCurrencyChange={handleCurrencyChange}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            summary={monthlySummary}
            categories={categories}
            transactions={transactions}
            goals={goals}
            recommendations={recommendations}
            currencySymbol={currencySymbol}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsAddTxOpen(true);
            }}
            onNavigateTab={setActiveTab}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'analytics' && (
          <VisualAnalyticsView
            summary={monthlySummary}
            categories={categories}
            transactions={transactions}
            currencySymbol={currencySymbol}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            categories={categories}
            currencySymbol={currencySymbol}
            userId={user.id}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsAddTxOpen(true);
            }}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onTransactionsImported={setTransactions}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsView
            categories={categories}
            transactions={transactions}
            summary={monthlySummary}
            currencySymbol={currencySymbol}
            onUpdateBudget={handleUpdateCategoryBudget}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsView
            recommendations={recommendations}
            categories={categories}
            transactions={transactions}
            goals={goals}
            summary={monthlySummary}
            currencySymbol={currencySymbol}
            onUpdateCategoryBudget={handleUpdateCategoryBudget}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'goals' && (
          <SavingsGoalsView
            goals={goals}
            currencySymbol={currencySymbol}
            onAddGoal={handleAddGoal}
            onContribute={handleGoalContribute}
            onDeleteGoal={handleDeleteGoal}
          />
        )}

        {activeTab === 'account' && (
          <AccountView
            user={user}
            currencySymbol={currencySymbol}
            onUserUpdated={setUser}
            onLogout={handleLogout}
            onResetData={handleResetData}
            onSwitchAccount={handleSwitchAccount}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={newUser => {
          setUser(newUser);
          reloadData(newUser.id);
        }}
      />

      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => {
          setIsAddTxOpen(false);
          setEditingTransaction(null);
        }}
        categories={categories}
        currencySymbol={currencySymbol}
        onSave={handleSaveTransaction}
        initialTransaction={editingTransaction}
      />

    </div>
  );
}
