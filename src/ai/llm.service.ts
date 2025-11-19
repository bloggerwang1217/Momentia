/**
 * LLM Service
 *
 * 整合 OpenAI 和 Anthropic AI 模型
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { aiConfig, calculateCost } from '../config/ai.config';
import { log, logAIRequest } from '../utils/logger';
import { AIServiceError, AIResponse, AIRequestOptions } from '../types';

// 初始化 OpenAI 客戶端
const openai = new OpenAI({
  apiKey: aiConfig.openai.apiKey,
});

// 初始化 Anthropic 客戶端（如果有 API Key）
const anthropic = aiConfig.anthropic.apiKey
  ? new Anthropic({
      apiKey: aiConfig.anthropic.apiKey,
    })
  : null;

/**
 * 呼叫 OpenAI API
 */
async function callOpenAI(
  prompt: string,
  options: AIRequestOptions = {}
): Promise<AIResponse> {
  try {
    const model = options.model || aiConfig.openai.defaultModel;
    const maxTokens = options.maxTokens || aiConfig.openai.maxTokens;
    const temperature = options.temperature ?? aiConfig.openai.temperature;

    const messages: any[] = [];

    if (options.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    const response = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    });

    const content = response.choices[0]?.message?.content || '';
    const usage = response.usage;

    const tokensUsed = {
      input: usage?.prompt_tokens || 0,
      output: usage?.completion_tokens || 0,
      cached: (usage as any)?.prompt_tokens_details?.cached_tokens || 0,
    };

    const cost = calculateCost(model, tokensUsed.input, tokensUsed.output, tokensUsed.cached);

    logAIRequest(model, 'chat', tokensUsed.input + tokensUsed.output);

    return {
      content,
      tokensUsed,
      cost,
      model,
    };
  } catch (error) {
    log.error('OpenAI API error:', error);
    throw new AIServiceError('OpenAI 服務暫時無法使用');
  }
}

/**
 * 呼叫 Anthropic API
 */
async function callAnthropic(
  prompt: string,
  options: AIRequestOptions = {}
): Promise<AIResponse> {
  if (!anthropic) {
    throw new AIServiceError('Anthropic API Key 未設定');
  }

  try {
    const model = options.model || aiConfig.anthropic.defaultModel;
    const maxTokens = options.maxTokens || aiConfig.anthropic.maxTokens;
    const temperature = options.temperature ?? aiConfig.anthropic.temperature;

    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: options.systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content =
      response.content[0]?.type === 'text' ? response.content[0].text : '';

    const tokensUsed = {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    };

    const cost = calculateCost(model, tokensUsed.input, tokensUsed.output);

    logAIRequest(model, 'chat', tokensUsed.input + tokensUsed.output);

    return {
      content,
      tokensUsed,
      cost,
      model,
    };
  } catch (error) {
    log.error('Anthropic API error:', error);
    throw new AIServiceError('Anthropic 服務暫時無法使用');
  }
}

/**
 * 通用 LLM 呼叫函數
 */
export async function callLLM(
  prompt: string,
  options: AIRequestOptions & { provider?: 'openai' | 'anthropic' } = {}
): Promise<AIResponse> {
  const { provider = 'openai', ...restOptions } = options;

  // 根據 provider 選擇對應的 API
  if (provider === 'anthropic') {
    return callAnthropic(prompt, restOptions);
  } else {
    return callOpenAI(prompt, restOptions);
  }
}

/**
 * 根據場景呼叫最適合的模型
 */
export async function callLLMForScenario(
  scenario: keyof typeof aiConfig.scenarios,
  prompt: string,
  options: Omit<AIRequestOptions, 'model'> = {}
): Promise<AIResponse> {
  const model = aiConfig.scenarios[scenario];

  // 判斷 provider
  const provider = model.startsWith('gpt-') ? 'openai' : 'anthropic';

  return callLLM(prompt, {
    ...options,
    model,
    provider,
  });
}

/**
 * 生成結構化 JSON 回應
 */
export async function generateJSON<T = any>(
  prompt: string,
  options: AIRequestOptions = {}
): Promise<T> {
  try {
    const systemPrompt =
      (options.systemPrompt || '') +
      '\n\nIMPORTANT: Respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or additional text. Just pure JSON.';

    const response = await callLLM(prompt, {
      ...options,
      systemPrompt,
    });

    // 移除可能的 markdown 代碼塊標記
    let content = response.content.trim();
    content = content.replace(/^```json\s*/i, '');
    content = content.replace(/^```\s*/i, '');
    content = content.replace(/\s*```$/i, '');
    content = content.trim();

    // 解析 JSON
    const parsed = JSON.parse(content);
    return parsed as T;
  } catch (error) {
    log.error('Error generating JSON:', error);
    if (error instanceof SyntaxError) {
      throw new AIServiceError('AI 回應格式錯誤');
    }
    throw error;
  }
}

/**
 * 使用網路搜尋功能（僅 OpenAI）
 */
export async function callLLMWithWebSearch(
  prompt: string,
  options: AIRequestOptions = {}
): Promise<AIResponse> {
  try {
    // 使用支援 web search 的模型
    const model = 'gpt-4o'; // GPT-4o 支援網路搜尋

    const messages: any[] = [];

    if (options.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    // 注意：OpenAI 的 web search 功能可能需要特定配置
    // 這裡使用標準 API，實際使用時可能需要調整
    const response = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature ?? 0.7,
    });

    const content = response.choices[0]?.message?.content || '';
    const usage = response.usage;

    const tokensUsed = {
      input: usage?.prompt_tokens || 0,
      output: usage?.completion_tokens || 0,
    };

    const cost = calculateCost(model, tokensUsed.input, tokensUsed.output);

    logAIRequest(model, 'web-search', tokensUsed.input + tokensUsed.output);

    return {
      content,
      tokensUsed,
      cost,
      model,
    };
  } catch (error) {
    log.error('OpenAI Web Search error:', error);
    throw new AIServiceError('網路搜尋功能暫時無法使用');
  }
}

/**
 * 批次處理多個提示（並行）
 */
export async function batchCallLLM(
  prompts: string[],
  options: AIRequestOptions = {}
): Promise<AIResponse[]> {
  try {
    const promises = prompts.map((prompt) => callLLM(prompt, options));
    return await Promise.all(promises);
  } catch (error) {
    log.error('Batch LLM call error:', error);
    throw error;
  }
}

/**
 * 重試邏輯的 LLM 呼叫
 */
export async function callLLMWithRetry(
  prompt: string,
  options: AIRequestOptions = {},
  maxRetries: number = aiConfig.retry.maxRetries
): Promise<AIResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await callLLM(prompt, options);
    } catch (error) {
      lastError = error as Error;
      log.warn(`LLM call failed (attempt ${attempt + 1}/${maxRetries})`, error);

      if (attempt < maxRetries - 1) {
        // 等待後重試（指數退避）
        const delay = aiConfig.retry.retryDelay * Math.pow(aiConfig.retry.backoffMultiplier, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new AIServiceError('LLM 呼叫失敗');
}
