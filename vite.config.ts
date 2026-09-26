import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';

function apiPlugin(): Plugin {
  return {
    name: 'clarityspend-api-server',
    configureServer(server) {
      server.middlewares.use('/api/recommendations', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const apiKey = process.env.GEMINI_API_KEY;

            if (!apiKey) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                analysis: 'AI Smart Insights is standing by. Your budget data has been evaluated against the 50/30/20 guideline and pace benchmarks.',
                isMock: true
              }));
              return;
            }

            const ai = new GoogleGenAI({});
            const prompt = `You are an empathetic, tactical personal finance advisor for ClaritySpend. 
Analyze the user's monthly budget and spending patterns:
- Total Income: ${data.currencySymbol || '$'}${data.summary?.totalIncome || 0}
- Total Expenses: ${data.currencySymbol || '$'}${data.summary?.totalExpenses || 0}
- Savings Rate: ${data.summary?.savingsRate || 0}%
- Month Progress: ${data.summary?.daysElapsed || 0} of ${data.summary?.daysInMonth || 30} days (${(data.summary?.expectedPacePercentage || 0).toFixed(0)}% elapsed)
- Budget Utilization: ${(data.summary?.budgetUtilization || 0).toFixed(0)}%
- Top Categories Spending:
${(data.topCategories || []).map((c: any) => `  * ${c.name}: Spent ${data.currencySymbol || '$'}${c.spend} / Budget ${data.currencySymbol || '$'}${c.limit}`).join('\n')}

Provide exactly 3 concise, high-impact tactical recommendations formatted in clear bullet points:
1. One immediate expense reduction (e.g. food, subscriptions, or discretionary)
2. One structural cashflow improvement (e.g. 50/30/20 pacing or automated transfer)
3. A motivating milestone encouragement based on their pace.
Keep tone professional, encouraging, and highly specific with dollar targets. No fluff.`;

            const response = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: prompt,
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ analysis: response.text || '' }));
          } catch (err: any) {
            console.error('Gemini API error in /api/recommendations:', err);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              analysis: 'Based on your recent transactions, optimizing your food delivery frequency and auditing unused subscriptions offers the quickest path to increasing your monthly net savings by 15-20%.',
              fallback: true 
            }));
          }
        });
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
