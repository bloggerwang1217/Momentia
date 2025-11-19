/**
 * AI Configuration
 *
 * 管理 AI 模型的設定和策略
 */

export const aiConfig = {
  // OpenAI 設定
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
    defaultModel: process.env.OPENAI_MODEL || 'gpt-5.1-mini',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1000', 10),
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),

    // 模型別名
    models: {
      mini: 'gpt-5.1-mini',
      standard: 'gpt-5.1',
      legacy: 'gpt-4o',
    },
  },

  // Anthropic 設定
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    defaultModel: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1000', 10),
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),

    // 模型別名
    models: {
      haiku: 'claude-3-5-haiku-20241022',
      sonnet: 'claude-sonnet-4.5',
    },
  },

  // 場景模型分配策略
  scenarios: {
    // 日常情緒記錄（同理心高、超便宜）
    dailyEmotion: process.env.AI_MODEL_DAILY || 'gpt-5.1-mini',

    // 聊天記錄分析（長文本處理強）
    chatAnalysis: process.env.AI_MODEL_CHAT_ANALYSIS || 'claude-3-5-haiku-20241022',

    // 歌曲推薦（快速精準）
    songRecommend: process.env.AI_MODEL_SONG || 'gpt-5.1-mini',

    // 挑戰建議（創意實用）
    challenge: process.env.AI_MODEL_CHALLENGE || 'gpt-5.1-mini',

    // 週期回顧報告（同理心高、遵守指令）
    review: process.env.AI_MODEL_REVIEW || 'gpt-5.1',

    // 年度總結（真誠直接）
    annualReview: process.env.AI_MODEL_ANNUAL_REVIEW || 'gpt-5.1',
  },

  // 成本追蹤設定
  costTracking: {
    enabled: true,

    // 每 1M tokens 的成本（美元）
    pricing: {
      'gpt-5.1-mini': { input: 0.25, output: 2.0, cached: 0.025 },
      'gpt-5.1': { input: 1.25, output: 10.0, cached: 0.125 },
      'gpt-4o': { input: 2.5, output: 10.0 },
      'claude-3-5-haiku-20241022': { input: 1.0, output: 5.0 },
      'claude-sonnet-4.5': { input: 3.0, output: 15.0 },
    },
  },

  // 重試設定
  retry: {
    maxRetries: 3,
    retryDelay: 1000, // 毫秒
    backoffMultiplier: 2,
  },

  // 超時設定
  timeout: {
    // API 請求超時（毫秒）
    apiRequest: 30000,
  },
};

/**
 * 根據場景獲取對應的模型
 */
export function getModelForScenario(
  scenario: keyof typeof aiConfig.scenarios
): { provider: 'openai' | 'anthropic'; model: string } {
  const model = aiConfig.scenarios[scenario];

  // 判斷是 OpenAI 還是 Anthropic 模型
  if (model.startsWith('gpt-')) {
    return { provider: 'openai', model };
  } else if (model.startsWith('claude-')) {
    return { provider: 'anthropic', model };
  }

  // 預設使用 OpenAI
  return { provider: 'openai', model: aiConfig.openai.defaultModel };
}

/**
 * 驗證必要的設定
 */
export function validateAIConfig(): void {
  const required = ['OPENAI_API_KEY'];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  // Anthropic API Key 是可選的
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY not set. Claude models will not be available.');
  }
}

/**
 * 計算 API 呼叫成本
 */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cachedTokens: number = 0
): number {
  const pricing = aiConfig.costTracking.pricing[model as keyof typeof aiConfig.costTracking.pricing];

  if (!pricing) {
    console.warn(`Unknown model for cost calculation: ${model}`);
    return 0;
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  const cachedCost = cachedTokens > 0 && 'cached' in pricing
    ? (cachedTokens / 1_000_000) * pricing.cached
    : 0;

  return inputCost + outputCost + cachedCost;
}
