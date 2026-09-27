## ClaritySpend: Budget & Money Tracking App
ClaritySpend is a modern, responsive personal finance and budget analytics web application. 
Track income and expenses, monitor daily spending, visualize cash flow with interactive charts, set category limits for budgeting.

## 🛠️ Core Technologies & Frameworks

### 💻 Frontend & UI Architecture
- **[React 19](https://react.dev/)**: Latest functional component architecture with hooks, state management, and modern concurrent capabilities.
- **[TypeScript](https://www.typescriptlang.org/)**: Full strict type safety across financial calculations, transaction schemas, and UI state models.
- **[Tailwind CSS v4](https://tailwindcss.com/)**: Next-generation utility-first styling engine integrated via `@tailwindcss/vite` for sleek, responsive dark-mode aesthetics.
- **[Lucide React](https://lucide.dev/)**: Comprehensive, lightweight iconography across all dashboards, category tags, and action buttons.
- **[Motion](https://motion.dev/)**: Smooth interactive transitions and visual effects.
- **[Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)**: Celebration milestone animations when completing savings goals.

### ⚙️ Build System & Server Runtime
- **[Vite 8](https://vite.dev/)**: Ultra-fast next-gen build tool and dev server featuring optimized ESM bundling.
- **[Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)**: Fast, minimal server runtime for local execution and hosting.
- **[TSX](https://github.com/privatenumber/tsx)**: Seamless TypeScript execution engine for server scripts.

### 🔒 Security, Storage & Intelligence
- **Web Crypto API**: Native browser cryptographic primitives implementing PBKDF2 with SHA-256 for client-side password hashing and credential verification.
- **Client-Side Persistence**: Fast, privacy-first local storage architecture with multi-account switching and full JSON/CSV data backup & import/export.
- **Google Gen AI SDK (`@google/genai`)**: Modern Google Gen AI TypeScript SDK configured for future AI-powered financial advisory features.

## Features

### 📊 Dashboard & Budget Pacing
- **Real-Time Financial Overview**: At-a-glance KPIs for total income, total expenses, net savings rate, and remaining budget.
- **Budget Pace Tracking**: Compares your budget utilization against the days elapsed in the month to detect overspending early.
- **Safe Daily Allowance**: Dynamically calculates your safe daily spend limit based on remaining days and unallocated funds.
- **Daily Spending Outflows**: Interactive bar visualization displaying day-by-day spending patterns, highlighting weekend versus weekday activity.

### ⚖️ Customizable Budget Framework (Needs / Wants / Savings)
- **Customizable Target Ratios**: Set your own allocation percentages (e.g., 50/30/20 Classic, 60/20/20 Urban Metro, 50/20/30 Aggressive Saver, 70/20/10 Tight Essentials, 40/30/30 Wealth Builder, or custom ratios).
- **Automated Categorization**: Sorts expenses into essential **Needs**, discretionary **Wants**, and **Savings / Investments**.
- **Real-Time Visual Envelope Meters**: Live progress bars and variance indicators alert you when category spending diverges from your personalized targets.

### 📈 Deep Visual Analytics
- **Category Donut Chart**: Interactive breakdown of expenditures across customizable categories with percentage shares.
- **Cumulative Trajectory Area Chart**: Compares your actual month-to-date spending curve against an ideal linear budget pace.
- **Top Merchants & Spending Outliers**: Pinpoints where your highest cash outflows are going each month.

### 💳 Transaction & Subscription Management
- **Quick Logging**: Add and edit income and expense transactions with date, category, payment method, and custom tags.
- **Recurring Charge Detection**: Flags subscriptions and monthly commitments (e.g., Netflix, Spotify, gym memberships) to audit fixed overhead.
- **Search, Filter & Sort**: Fast client-side filtering by category, payment method, date range, or transaction type.

### 🎯 Category Budgets & Savings Goals
- **Category Limits**: Set target monthly caps per category with visual progress meters and warning thresholds (normal, warning at 80%, over-budget at 100%).
- **Savings Goals**: Create financial targets (e.g., Emergency Fund, Vacation, New Laptop) with target deadlines, monthly contribution trackers, and completion milestones.

### 💡 Actionable Savings Recommendations
- **Heuristic Pattern Analysis**: Automated detection of dining out spikes, micro-spending leakage (frequent purchases under $15), and subscription creep.
- **Direct Actions**: One-click actions to adjust category budget targets or navigate directly to flagged charges.

### 👤 User Accounts & Data Portability
- **Multi-Account Support**: Switch between different user profiles or test instantly with a pre-configured demo account.
- **Multi-Currency Support**: Native support for USD ($), EUR (€), GBP (£), CAD ($), AUD ($), JPY (¥), and INR (₹).
- **100% Client-Side Privacy**: Data stays in your browser's persistent storage.
- **Data Export & Backup**: One-click export of transactions to CSV (spreadsheet-compatible) and full account backup/restore via JSON.

### Video Demo 
Youtube Link: https://youtu.be/az1jloE3M5w




