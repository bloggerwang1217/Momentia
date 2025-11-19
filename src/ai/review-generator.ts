/**
 * Review Generator - AI 生成回顧報告
 *
 * 根據使用者的情緒記錄生成深度洞察和回顧報告
 */

import { callLLMForScenario, generateJSON } from './llm.service';
import { log } from '../utils/logger';

export interface EmotionData {
  date: Date;
  mood: number;
  moodLabel: string;
  content: string;
  aiInsight?: string | null;
}

export interface ReviewData {
  summary: string;
  highlights: Array<{
    date: string;
    title: string;
    description: string;
    mood: number;
  }>;
  insights: string;
  moodTrend: {
    average: number;
    highest: number;
    lowest: number;
    trend: 'improving' | 'declining' | 'stable';
    chartData: Array<{ date: string; mood: number }>;
  };
  wordCloud?: Array<{ word: string; weight: number }>;
}

/**
 * 生成回顧報告
 */
export async function generateReview(
  emotions: EmotionData[],
  reviewType: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
  startDate: Date,
  endDate: Date
): Promise<ReviewData> {
  try {
    if (emotions.length === 0) {
      throw new Error('No emotion data available for review');
    }

    // 計算情緒趨勢
    const moodTrend = calculateMoodTrend(emotions);

    // 提取關鍵詞（詞雲）
    const wordCloud = extractKeywords(emotions);

    // 生成 AI 分析
    const aiAnalysis = await generateAIAnalysis(emotions, reviewType, moodTrend);

    return {
      summary: aiAnalysis.summary,
      highlights: aiAnalysis.highlights,
      insights: aiAnalysis.insights,
      moodTrend,
      wordCloud,
    };
  } catch (error) {
    log.error('Error generating review:', error);
    throw error;
  }
}

/**
 * 計算情緒趨勢
 */
function calculateMoodTrend(emotions: EmotionData[]): ReviewData['moodTrend'] {
  const moods = emotions.map((e) => e.mood);
  const average = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
  const highest = Math.max(...moods);
  const lowest = Math.min(...moods);

  // 計算趨勢（簡單線性回歸）
  const n = moods.length;
  const xMean = (n - 1) / 2;
  const yMean = average;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (moods[i] - yMean);
    denominator += Math.pow(i - xMean, 2);
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;

  let trend: 'improving' | 'declining' | 'stable';
  if (slope > 0.1) {
    trend = 'improving';
  } else if (slope < -0.1) {
    trend = 'declining';
  } else {
    trend = 'stable';
  }

  const chartData = emotions.map((e) => ({
    date: e.date.toISOString().split('T')[0],
    mood: e.mood,
  }));

  return {
    average: Math.round(average * 10) / 10,
    highest,
    lowest,
    trend,
    chartData,
  };
}

/**
 * 提取關鍵詞生成詞雲
 */
function extractKeywords(emotions: EmotionData[]): Array<{ word: string; weight: number }> {
  const wordFrequency = new Map<string, number>();

  // 合併所有內容
  const allContent = emotions.map((e) => e.content).join(' ');

  // 簡單的中文分詞（基於空格和標點）
  const words = allContent
    .replace(/[。！？，、；：""''（）《》【】\s]+/g, ' ')
    .split(' ')
    .filter((word) => word.length >= 2); // 過濾單字

  // 計算詞頻
  for (const word of words) {
    wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
  }

  // 轉換為詞雲格式並排序
  const wordCloud = Array.from(wordFrequency.entries())
    .map(([word, count]) => ({ word, weight: count }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 30); // 取前 30 個

  return wordCloud;
}

/**
 * 生成 AI 分析內容
 */
async function generateAIAnalysis(
  emotions: EmotionData[],
  reviewType: string,
  moodTrend: ReviewData['moodTrend']
): Promise<{
  summary: string;
  highlights: Array<{ date: string; title: string; description: string; mood: number }>;
  insights: string;
}> {
  const periodLabel = {
    WEEKLY: '這週',
    MONTHLY: '這個月',
    QUARTERLY: '這季',
    YEARLY: '今年',
  }[reviewType];

  // 找出情緒最高和最低的幾天
  const sortedByMood = [...emotions].sort((a, b) => b.mood - a.mood);
  const topMoments = sortedByMood.slice(0, 3);
  const lowMoments = sortedByMood.slice(-2);

  const prompt = `
你是一位溫暖、專業的心理諮詢師，正在為使用者生成${periodLabel}的情緒回顧報告。

**情緒數據摘要：**
- 記錄天數：${emotions.length} 天
- 平均情緒分數：${moodTrend.average} / 10
- 最高分數：${moodTrend.highest} / 10
- 最低分數：${moodTrend.lowest} / 10
- 整體趨勢：${moodTrend.trend === 'improving' ? '上升' : moodTrend.trend === 'declining' ? '下降' : '平穩'}

**高光時刻（情緒較好的幾天）：**
${topMoments.map((e, i) => `${i + 1}. ${e.date.toLocaleDateString('zh-TW')} - 分數 ${e.mood}/10
   內容：${e.content.substring(0, 100)}...
`).join('\n')}

**低谷時刻（情緒較低的幾天）：**
${lowMoments.map((e, i) => `${i + 1}. ${e.date.toLocaleDateString('zh-TW')} - 分數 ${e.mood}/10
   內容：${e.content.substring(0, 100)}...
`).join('\n')}

請生成一份溫暖、有洞察力的回顧報告，包含：

1. **summary**（100-150字）：用溫暖的語氣總結${periodLabel}的整體情緒狀態
2. **highlights**（3-5個關鍵時刻）：挑選最有意義的時刻，給每個時刻一個標題和描述
3. **insights**（200-300字）：深度洞察和建議，包括：
   - 情緒模式分析
   - 可能的觸發因素
   - 積極的成長點
   - 溫暖的建議和鼓勵

請以 JSON 格式回應：
{
  "summary": "...",
  "highlights": [
    {
      "date": "YYYY-MM-DD",
      "title": "標題",
      "description": "描述",
      "mood": 情緒分數
    }
  ],
  "insights": "..."
}
`;

  try {
    const result = await generateJSON<{
      summary: string;
      highlights: Array<{ date: string; title: string; description: string; mood: number }>;
      insights: string;
    }>(prompt, {
      model: 'gpt-5.1',
      temperature: 0.7,
    });

    return result;
  } catch (error) {
    log.error('Error in AI analysis:', error);

    // 降級方案：生成基本報告
    return generateBasicAnalysis(emotions, periodLabel, moodTrend);
  }
}

/**
 * 降級方案：生成基本報告
 */
function generateBasicAnalysis(
  emotions: EmotionData[],
  periodLabel: string,
  moodTrend: ReviewData['moodTrend']
): {
  summary: string;
  highlights: Array<{ date: string; title: string; description: string; mood: number }>;
  insights: string;
} {
  const trendText = {
    improving: '呈現上升趨勢，越來越好',
    declining: '略有下降，需要多關注自己',
    stable: '保持平穩',
  }[moodTrend.trend];

  const sortedByMood = [...emotions].sort((a, b) => b.mood - a.mood);
  const highlights = sortedByMood.slice(0, 3).map((e) => ({
    date: e.date.toISOString().split('T')[0],
    title: `${e.moodLabel}的一天`,
    description: e.content.substring(0, 100),
    mood: e.mood,
  }));

  return {
    summary: `${periodLabel}你記錄了 ${emotions.length} 天的心情，平均情緒分數 ${moodTrend.average}/10，整體${trendText}。`,
    highlights,
    insights: `${periodLabel}的情緒${trendText}。最高分達到 ${moodTrend.highest}/10，最低分是 ${moodTrend.lowest}/10。繼續保持記錄的習慣，這將幫助你更了解自己的情緒模式。`,
  };
}
