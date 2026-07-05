const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * AI Service — Google Gemini Integration
 * 
 * Provides three AI-powered features:
 * 1. Financial Insights — Personalized spending analysis from real user data
 * 2. Smart Suggestions — Autocomplete for expense title → category + amount
 * 3. Natural Language Queries — "How much did I spend on food last month?"
 * 
 * Gracefully falls back to rule-based responses if Gemini API unavailable.
 */

let genAI = null;
let model = null;

const initAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || process.env.ENABLE_AI === 'false') {
    console.log('⏭️  Gemini AI disabled (no API key or ENABLE_AI=false). Using fallback insights.');
    return false;
  }
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('✅ Gemini AI initialized (model: gemini-2.0-flash)');
    return true;
  } catch (error) {
    console.warn(`⚠️  Gemini AI init failed: ${error.message}. Using fallback.`);
    return false;
  }
};

/**
 * Generate AI-powered financial insights from user's real data
 */
const generateFinancialInsights = async (userData) => {
  const { summary, categoryBreakdown, monthlyTrend, budgets } = userData;

  // Try Gemini first
  if (model) {
    try {
      const prompt = `You are a concise, expert financial advisor. Analyze this user's financial data and provide exactly 5 actionable insights. Each insight should be 1-2 sentences max.

FINANCIAL DATA:
- Monthly Income: $${summary.monthlyIncome.toFixed(2)}
- Monthly Expenses: $${summary.monthlyExpenses.toFixed(2)}
- Monthly Balance: $${summary.monthlyBalance.toFixed(2)}
- Savings Rate: ${summary.monthlyIncome > 0 ? ((summary.monthlyBalance / summary.monthlyIncome) * 100).toFixed(1) : 0}%

TOP SPENDING CATEGORIES:
${categoryBreakdown.slice(0, 5).map(c => `- ${c._id}: $${c.total.toFixed(2)} (${c.count} transactions)`).join('\n')}

SPENDING TREND (last 6 months):
${monthlyTrend.map(t => `- Month ${t._id.month}/${t._id.year}: $${t.total.toFixed(2)}`).join('\n')}

BUDGET STATUS:
${budgets.map(b => `- ${b.category}: $${b.spent?.toFixed(2) || 0} / $${b.limit.toFixed(2)} (${b.limit > 0 ? ((b.spent / b.limit) * 100).toFixed(0) : 0}%)`).join('\n')}

Return a JSON array with exactly 5 objects. Each object has:
- "type": one of "positive", "warning", "danger", "info", "neutral"
- "icon": a single relevant emoji
- "message": the insight text (1-2 sentences, actionable)
- "priority": number 1-5 (1 = most important)

Return ONLY the JSON array, no markdown formatting, no code blocks.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      
      // Parse JSON from response (handle potential markdown wrapping)
      let cleanJson = responseText;
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/```(?:json)?\n?/g, '').trim();
      }
      
      const insights = JSON.parse(cleanJson);
      return {
        insights: insights.sort((a, b) => a.priority - b.priority),
        source: 'gemini',
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.warn(`⚠️  Gemini insights failed: ${error.message}. Using fallback.`);
    }
  }

  // Fallback: rule-based insights
  return {
    insights: generateFallbackInsights(summary, categoryBreakdown, budgets, monthlyTrend),
    source: 'fallback',
    generatedAt: new Date().toISOString()
  };
};

/**
 * Smart expense suggestions — given a partial title, suggest category + amount
 */
const suggestExpenseDetails = async (partialTitle, recentExpenses = []) => {
  if (model && partialTitle.length >= 2) {
    try {
      const recentContext = recentExpenses.slice(0, 10).map(e => 
        `"${e.title}" → category: ${e.category}, amount: $${e.amount}`
      ).join('\n');

      const prompt = `You are an expense categorization assistant. Based on the partial expense title and the user's recent spending history, suggest the most likely details.

PARTIAL TITLE: "${partialTitle}"

USER'S RECENT EXPENSES:
${recentContext || 'No recent data'}

AVAILABLE CATEGORIES: food, transportation, entertainment, shopping, utilities, healthcare, education, housing, insurance, savings, personal, travel, subscriptions, other

Return a JSON object with:
- "suggestedTitle": completed/corrected title (string)
- "suggestedCategory": most likely category from the list above (string)
- "suggestedAmount": estimated amount based on user history or general knowledge (number)
- "confidence": how confident you are (0.0 to 1.0)
- "note": a brief auto-generated note for the expense (string, max 50 chars)

Return ONLY the JSON object, no markdown, no code blocks.`;

      const result = await model.generateContent(prompt);
      let responseText = result.response.text().trim();
      if (responseText.startsWith('```')) {
        responseText = responseText.replace(/```(?:json)?\n?/g, '').trim();
      }
      return { suggestion: JSON.parse(responseText), source: 'gemini' };
    } catch (error) {
      console.warn(`⚠️  Gemini suggestions failed: ${error.message}`);
    }
  }

  // Fallback: simple keyword matching
  return {
    suggestion: matchExpenseByKeyword(partialTitle),
    source: 'fallback'
  };
};

/**
 * Natural language financial query
 */
const queryFinancialData = async (question, userData) => {
  const { summary, categoryBreakdown, recentTransactions, budgets } = userData;

  if (model) {
    try {
      const prompt = `You are a helpful financial assistant for an expense tracking app called FinTrack. Answer the user's question based on their financial data. Be concise and specific with numbers.

USER'S FINANCIAL DATA:
- Total Income (all time): $${summary.totalIncome.toFixed(2)}
- Total Expenses (all time): $${summary.totalExpenses.toFixed(2)}
- This Month's Income: $${summary.monthlyIncome.toFixed(2)}
- This Month's Expenses: $${summary.monthlyExpenses.toFixed(2)}
- Current Balance: $${summary.balance.toFixed(2)}

SPENDING BY CATEGORY (this month):
${categoryBreakdown.map(c => `- ${c._id}: $${c.total.toFixed(2)} (${c.count} transactions)`).join('\n')}

RECENT TRANSACTIONS:
${recentTransactions.slice(0, 10).map(t => `- ${t.type === 'expense' ? '📤' : '📥'} ${t.title}: $${t.amount.toFixed(2)} (${t.category}, ${new Date(t.date).toLocaleDateString()})`).join('\n')}

BUDGETS:
${budgets.map(b => `- ${b.category}: $${b.spent?.toFixed(2) || 0} spent of $${b.limit.toFixed(2)} limit`).join('\n')}

USER'S QUESTION: "${question}"

Provide a helpful, conversational answer in 2-4 sentences. Include specific dollar amounts where relevant. If the question can't be answered from the data, say so politely and suggest what data might help.`;

      const result = await model.generateContent(prompt);
      return {
        answer: result.response.text().trim(),
        source: 'gemini',
        answeredAt: new Date().toISOString()
      };
    } catch (error) {
      console.warn(`⚠️  Gemini query failed: ${error.message}`);
    }
  }

  // Fallback: basic pattern matching
  return {
    answer: generateFallbackAnswer(question, summary, categoryBreakdown),
    source: 'fallback',
    answeredAt: new Date().toISOString()
  };
};

// ─── Fallback Functions ─────────────────────────────────────────────

function generateFallbackInsights(summary, categories, budgets, trend) {
  const insights = [];
  const { monthlyIncome, monthlyExpenses } = summary;

  if (monthlyIncome > 0) {
    const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(0);
    if (savingsRate > 30) {
      insights.push({ type: 'positive', icon: '🎯', message: `Excellent! You're saving ${savingsRate}% of your income this month. Keep this up to build a strong emergency fund.`, priority: 1 });
    } else if (savingsRate > 10) {
      insights.push({ type: 'neutral', icon: '💡', message: `You're saving ${savingsRate}% of your income. Financial experts recommend aiming for 30%+. Consider reviewing discretionary spending.`, priority: 1 });
    } else if (savingsRate > 0) {
      insights.push({ type: 'warning', icon: '⚠️', message: `Low savings rate of ${savingsRate}%. Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.`, priority: 1 });
    } else {
      insights.push({ type: 'danger', icon: '🚨', message: `You're spending more than you earn this month! Immediate action needed — review your largest expense categories.`, priority: 1 });
    }
  }

  if (categories.length > 0) {
    const topCat = categories[0];
    const pct = monthlyExpenses > 0 ? ((topCat.total / monthlyExpenses) * 100).toFixed(0) : 0;
    insights.push({ type: 'info', icon: '📊', message: `${topCat._id.charAt(0).toUpperCase() + topCat._id.slice(1)} is your #1 expense at ${pct}% of total spending ($${topCat.total.toFixed(2)}).`, priority: 2 });
  }

  budgets.forEach(budget => {
    if (budget.limit > 0) {
      const usage = (budget.spent / budget.limit) * 100;
      if (usage >= 100) {
        insights.push({ type: 'danger', icon: '🔴', message: `${budget.category} budget exceeded by $${(budget.spent - budget.limit).toFixed(2)}. Consider adjusting your limit or reducing spend.`, priority: 2 });
      } else if (usage >= 80) {
        insights.push({ type: 'warning', icon: '🟡', message: `${budget.category} budget is at ${usage.toFixed(0)}% — only $${(budget.limit - budget.spent).toFixed(2)} remaining this month.`, priority: 3 });
      }
    }
  });

  if (trend.length >= 2) {
    const last = trend[trend.length - 1]?.total || 0;
    const prev = trend[trend.length - 2]?.total || 0;
    if (prev > 0) {
      const change = ((last - prev) / prev * 100).toFixed(0);
      if (change > 10) {
        insights.push({ type: 'warning', icon: '📈', message: `Spending increased ${change}% vs last month. Check for unusual or one-time expenses.`, priority: 3 });
      } else if (change < -10) {
        insights.push({ type: 'positive', icon: '📉', message: `Great job! Spending decreased ${Math.abs(change)}% compared to last month.`, priority: 3 });
      }
    }
  }

  if (monthlyIncome > 0) {
    insights.push({ type: 'info', icon: '💰', message: `Recommended savings target: $${(monthlyIncome * 0.2).toFixed(2)}/month (20% of income).`, priority: 5 });
  }

  return insights.sort((a, b) => a.priority - b.priority).slice(0, 5);
}

function matchExpenseByKeyword(title) {
  const lower = title.toLowerCase();
  const mappings = [
    { keywords: ['grocery', 'food', 'restaurant', 'cafe', 'coffee', 'lunch', 'dinner', 'breakfast', 'pizza', 'burger'], category: 'food', amount: 25 },
    { keywords: ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'parking', 'metro', 'bus', 'train'], category: 'transportation', amount: 15 },
    { keywords: ['netflix', 'spotify', 'movie', 'game', 'concert', 'theater'], category: 'entertainment', amount: 15 },
    { keywords: ['amazon', 'shop', 'store', 'mall', 'cloth', 'shoe'], category: 'shopping', amount: 50 },
    { keywords: ['electric', 'water', 'internet', 'phone', 'bill', 'utility'], category: 'utilities', amount: 60 },
    { keywords: ['doctor', 'hospital', 'pharmacy', 'medicine', 'health', 'dental'], category: 'healthcare', amount: 40 },
    { keywords: ['course', 'book', 'tuition', 'school', 'udemy', 'class'], category: 'education', amount: 30 },
    { keywords: ['rent', 'mortgage', 'lease', 'apartment'], category: 'housing', amount: 1200 },
    { keywords: ['insurance', 'premium', 'policy'], category: 'insurance', amount: 150 },
    { keywords: ['gym', 'salon', 'haircut', 'spa'], category: 'personal', amount: 40 },
    { keywords: ['flight', 'hotel', 'trip', 'travel', 'vacation', 'airbnb'], category: 'travel', amount: 200 },
    { keywords: ['subscription', 'membership', 'cloud', 'saas'], category: 'subscriptions', amount: 10 },
  ];

  for (const map of mappings) {
    if (map.keywords.some(k => lower.includes(k))) {
      return {
        suggestedTitle: title,
        suggestedCategory: map.category,
        suggestedAmount: map.amount,
        confidence: 0.6,
        note: `Auto-suggested for ${map.category}`
      };
    }
  }

  return {
    suggestedTitle: title,
    suggestedCategory: 'other',
    suggestedAmount: 0,
    confidence: 0.1,
    note: ''
  };
}

function generateFallbackAnswer(question, summary, categories) {
  const lower = question.toLowerCase();

  if (lower.includes('balance') || lower.includes('how much do i have')) {
    return `Your current balance is $${summary.balance.toFixed(2)}. This month you've earned $${summary.monthlyIncome.toFixed(2)} and spent $${summary.monthlyExpenses.toFixed(2)}.`;
  }
  if (lower.includes('spend') || lower.includes('expense')) {
    const categoryMatch = categories.find(c => lower.includes(c._id));
    if (categoryMatch) {
      return `You've spent $${categoryMatch.total.toFixed(2)} on ${categoryMatch._id} this month across ${categoryMatch.count} transactions.`;
    }
    return `Your total expenses this month are $${summary.monthlyExpenses.toFixed(2)} across ${categories.length} categories. Your top category is ${categories[0]?._id || 'N/A'} at $${categories[0]?.total?.toFixed(2) || 0}.`;
  }
  if (lower.includes('income') || lower.includes('earn') || lower.includes('salary')) {
    return `Your total income this month is $${summary.monthlyIncome.toFixed(2)}. Your all-time income is $${summary.totalIncome.toFixed(2)}.`;
  }
  if (lower.includes('save') || lower.includes('saving')) {
    const saved = summary.monthlyIncome - summary.monthlyExpenses;
    return `You've saved $${saved.toFixed(2)} this month (${summary.monthlyIncome > 0 ? ((saved / summary.monthlyIncome) * 100).toFixed(1) : 0}% savings rate). Experts recommend saving at least 20% of income.`;
  }

  return `Based on your data: Monthly income is $${summary.monthlyIncome.toFixed(2)}, expenses are $${summary.monthlyExpenses.toFixed(2)}, and your balance is $${summary.balance.toFixed(2)}. Try asking about specific categories, savings, or spending trends!`;
}

const isAIAvailable = () => model !== null;

module.exports = {
  initAI,
  generateFinancialInsights,
  suggestExpenseDetails,
  queryFinancialData,
  isAIAvailable,
};
