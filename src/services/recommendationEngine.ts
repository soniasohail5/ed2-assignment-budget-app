import { Category, Transaction, SavingGoal, MonthlyBudgetSummary, Recommendation } from '../types/finance';

export class RecommendationEngine {
  /**
   * Generates actionable, data-driven savings recommendations based on actual spending
   */
  static generateRecommendations(params: {
    categories: Category[];
    transactions: Transaction[];
    summary: MonthlyBudgetSummary;
    goals: SavingGoal[];
    currencySymbol: string;
  }): Recommendation[] {
    const { categories, transactions, summary, goals, currencySymbol } = params;
    const recommendations: Recommendation[] = [];

    // Filter current month transactions
    const monthTx = transactions.filter(tx => tx.date.startsWith(summary.month));
    const expenses = monthTx.filter(tx => tx.type === 'expense');

    // Category spend map
    const catSpendMap = new Map<string, number>();
    expenses.forEach(tx => {
      const current = catSpendMap.get(tx.categoryId) || 0;
      catSpendMap.set(tx.categoryId, current + tx.amount);
    });

    // 1. Dining Out & Coffee Analysis
    const diningCategory = categories.find(c => 
      c.name.toLowerCase().includes('dining') || 
      c.name.toLowerCase().includes('restaurant') || 
      c.name.toLowerCase().includes('food')
    );
    const groceryCategory = categories.find(c => 
      c.name.toLowerCase().includes('grocer') || 
      c.name.toLowerCase().includes('market')
    );

    const diningSpend = diningCategory ? (catSpendMap.get(diningCategory.id) || 0) : 0;
    const grocerySpend = groceryCategory ? (catSpendMap.get(groceryCategory.id) || 0) : 0;

    if (diningSpend > 150) {
      const potentialMonthlyCut = Math.round(diningSpend * 0.35);
      const potentialAnnual = potentialMonthlyCut * 12;
      recommendations.push({
        id: 'rec_dining_optimization',
        title: 'Optimize Dining Out & Delivery',
        category: 'Dining & Food',
        potentialSavingsMonthly: potentialMonthlyCut,
        potentialSavingsAnnual: potentialAnnual,
        impact: potentialMonthlyCut > 100 ? 'high' : 'medium',
        type: 'dining_cut',
        description: `You've spent ${currencySymbol}${diningSpend.toFixed(0)} on dining and takeout this month${grocerySpend > 0 ? ` (compared to ${currencySymbol}${grocerySpend.toFixed(0)} on groceries)` : ''}.`,
        reasoning: `Preparing 2 additional meals at home each week instead of restaurant delivery typically cuts food spend by 30-40% without sacrificing quality.`,
        actionLabel: 'Adjust Dining Budget',
        actionType: 'adjust_budget',
        targetCategoryId: diningCategory?.id,
        targetAmount: Math.max(100, Math.round(diningSpend * 0.65)),
      });
    }

    // 2. Subscription Audit
    const subscriptionCategory = categories.find(c => 
      c.name.toLowerCase().includes('subscript') || 
      c.name.toLowerCase().includes('stream')
    );
    const recurringExpenses = expenses.filter(tx => 
      tx.isRecurring || 
      (subscriptionCategory && tx.categoryId === subscriptionCategory.id)
    );

    const totalSubSpend = recurringExpenses.reduce((sum, tx) => sum + tx.amount, 0);
    if (recurringExpenses.length >= 3 || totalSubSpend > 50) {
      const potentialMonthly = Math.round(totalSubSpend * 0.3);
      recommendations.push({
        id: 'rec_subscription_audit',
        title: 'Audit Recurring Subscriptions',
        category: 'Subscriptions',
        potentialSavingsMonthly: potentialMonthly,
        potentialSavingsAnnual: potentialMonthly * 12,
        impact: 'medium',
        type: 'subscription_trim',
        description: `You currently have ${recurringExpenses.length} recurring subscriptions totaling ${currencySymbol}${totalSubSpend.toFixed(0)}/month (${currencySymbol}${(totalSubSpend * 12).toFixed(0)}/year).`,
        reasoning: `Most households pay for at least 1-2 overlapping video streaming or audio platforms they rarely use. Pausing or rotating subscriptions saves an easy 25-35%.`,
        actionLabel: 'Review Recurring Charges',
        actionType: 'view_transactions',
      });
    }

    // 3. 50/30/20 Rule Balancing
    if (summary.totalIncome > 0) {
      const wantsPercentage = (summary.wantsSpend / summary.totalIncome) * 100;
      const savingsPercentage = (summary.netSavings / summary.totalIncome) * 100;

      if (wantsPercentage > 35) {
        const excessWants = Math.round(summary.wantsSpend - (summary.totalIncome * 0.30));
        recommendations.push({
          id: 'rec_wants_rebalance',
          title: 'Rebalance 50/30/20 Discretionary Spending',
          category: 'Budget Structure',
          potentialSavingsMonthly: Math.max(50, excessWants),
          potentialSavingsAnnual: Math.max(50, excessWants) * 12,
          impact: 'high',
          type: 'needs_wants_rebalance',
          description: `Discretionary "Wants" account for ${wantsPercentage.toFixed(0)}% of your income (ideal target is 30% or less).`,
          reasoning: `Trimming discretionary categories down to the 30% ceiling would free up ${currencySymbol}${excessWants}/month to channel directly toward emergency savings or debt payoff.`,
          actionLabel: 'Rebalance Budgets',
          actionType: 'adjust_budget',
        });
      } else if (savingsPercentage < 15 && summary.totalIncome > 2000) {
        const boostTarget = Math.round(summary.totalIncome * 0.10);
        recommendations.push({
          id: 'rec_savings_rate_boost',
          title: 'Automate 10% Pay-Yourself-First Transfer',
          category: 'Wealth Building',
          potentialSavingsMonthly: boostTarget,
          potentialSavingsAnnual: boostTarget * 12,
          impact: 'high',
          type: 'emergency_boost',
          description: `Your current net savings rate is ${Math.max(0, savingsPercentage).toFixed(0)}% (recommended threshold: 20%+).`,
          reasoning: `Scheduling an automatic bank transfer of ${currencySymbol}${boostTarget} into a high-yield account immediately on payday removes the temptation to spend leftover cash.`,
          actionLabel: 'View Monthly Breakdown',
          actionType: 'view_analytics',
        });
      }
    }

    // 4. Micro-spending Leakage Detection
    const microExpenses = expenses.filter(tx => tx.amount < 15 && tx.amount > 2);
    if (microExpenses.length >= 4) {
      const microTotal = microExpenses.reduce((sum, tx) => sum + tx.amount, 0);
      recommendations.push({
        id: 'rec_micro_spending',
        title: 'Plug Micro-Spending Leaks',
        category: 'Impulse Control',
        potentialSavingsMonthly: Math.round(microTotal * 0.4),
        potentialSavingsAnnual: Math.round(microTotal * 0.4) * 12,
        impact: 'low',
        type: 'micro_spending',
        description: `You have ${microExpenses.length} small purchases under ${currencySymbol}15 totaling ${currencySymbol}${microTotal.toFixed(0)} this month.`,
        reasoning: `Daily coffees, convenience fees, and impulse snacks feel negligible individually, but compound to significant outflows over 12 months.`,
        actionLabel: 'See Micro Charges',
        actionType: 'view_transactions',
      });
    }

    // 5. Budget Burn Rate Alert
    if (summary.expectedPacePercentage > 0 && summary.budgetUtilization > (summary.expectedPacePercentage + 12)) {
      const overspendPace = summary.budgetUtilization - summary.expectedPacePercentage;
      const dailyCap = Math.max(0, summary.recommendedDailyRemaining);
      recommendations.push({
        id: 'rec_budget_pace_alert',
        title: 'Spending Pacing Ahead of Schedule',
        category: 'Pace Management',
        potentialSavingsMonthly: Math.round(summary.dailyAverageSpend * 4),
        potentialSavingsAnnual: Math.round(summary.dailyAverageSpend * 4) * 12,
        impact: 'high',
        type: 'budget_creep',
        description: `You've utilized ${summary.budgetUtilization.toFixed(0)}% of your monthly budget, but only ${summary.expectedPacePercentage.toFixed(0)}% of the month has passed.`,
        reasoning: `To finish the month without overspending, aim to limit total daily spending to ${currencySymbol}${dailyCap.toFixed(0)}/day for the remaining ${summary.daysRemaining} days.`,
        actionLabel: 'View Pace Gauge',
        actionType: 'view_analytics',
      });
    }

    // 6. Connect to Active Goals
    if (goals.length > 0) {
      const primaryGoal = goals[0];
      const remainingOnGoal = primaryGoal.targetAmount - primaryGoal.currentAmount;
      if (remainingOnGoal > 0) {
        const potentialSavingsTotal = recommendations.reduce((sum, r) => sum + r.potentialSavingsMonthly, 0);
        if (potentialSavingsTotal > 0) {
          const currentMonthsNeeded = Math.ceil(remainingOnGoal / Math.max(1, primaryGoal.monthlyContributionTarget));
          const acceleratedMonthsNeeded = Math.ceil(remainingOnGoal / Math.max(1, primaryGoal.monthlyContributionTarget + potentialSavingsTotal));
          const monthsSaved = Math.max(1, currentMonthsNeeded - acceleratedMonthsNeeded);

          recommendations.push({
            id: 'rec_goal_acceleration',
            title: `Accelerate "${primaryGoal.title}" Goal`,
            category: 'Goal Milestone',
            potentialSavingsMonthly: potentialSavingsTotal,
            potentialSavingsAnnual: potentialSavingsTotal * 12,
            impact: 'high',
            type: 'smart_habit',
            description: `Applying your top savings recommendations (${currencySymbol}${potentialSavingsTotal}/mo) will fund your "${primaryGoal.title}" goal ${monthsSaved} month${monthsSaved > 1 ? 's' : ''} sooner!`,
            reasoning: `Redirecting optimized dining and subscription savings straight into your dedicated savings goal turns small daily adjustments into tangible milestone wins.`,
            actionLabel: 'View Savings Goals',
            actionType: 'view_goals',
          });
        }
      }
    }

    return recommendations;
  }
}
