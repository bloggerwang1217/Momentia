/**
 * Insight Generator
 *
 * 生成深度洞察和建議
 */

import { callLLMForScenario } from './llm.service';
import { log } from '../utils/logger';

/**
 * 生成深度洞察
 */
export async function generateInsight(
  content: string,
  mood: number,
  moodLabel: string
): Promise<string> {
  const systemPrompt = `你是一位溫暖、有同理心的心理諮詢師和生活教練。
你的任務是為使用者的情緒日記提供深度洞察和鼓勵。

請遵循以下原則：
1. 展現真誠的同理心，理解使用者的感受
2. 提供正面且實用的觀點
3. 避免過度樂觀或說教
4. 用溫暖、支持的語氣
5. 2-3 句話，簡潔有力

不要使用「我理解」「我明白」這類開頭，直接給予洞察。`;

  const prompt = `使用者的情緒狀態：
- 情緒分數：${mood}/10
- 情緒標籤：${moodLabel}

日記內容：
${content}

請給予深度洞察和鼓勵。`;

  try {
    const response = await callLLMForScenario('dailyEmotion', prompt, {
      systemPrompt,
      temperature: 0.8,
      maxTokens: 200,
    });

    log.info('Generated insight for emotion record');

    return response.content.trim();
  } catch (error) {
    log.error('Error generating insight:', error);

    // 返回預設洞察
    const defaultInsights: Record<string, string> = {
      low: '即使在低潮時刻，你仍願意記錄和面對自己的感受，這本身就是一種勇氣。明天會是新的一天，給自己一些時間和空間。',
      neutral: '平靜也是一種珍貴的狀態。在忙碌的生活中，能夠感受到平和是值得珍惜的。',
      good: '你今天的心情不錯！這種正向的能量值得被記住，它提醒著你生活中美好的可能性。',
      excellent: '你今天充滿了活力和喜悅！記住這種感覺，它會成為未來面對挑戰時的力量來源。',
    };

    if (mood <= 3) return defaultInsights.low;
    if (mood >= 7 && mood <= 8) return defaultInsights.good;
    if (mood >= 9) return defaultInsights.excellent;
    return defaultInsights.neutral;
  }
}

/**
 * 生成星球顏色
 */
export async function generatePlanetColor(
  content: string,
  mood: number,
  moodLabel: string
): Promise<{ color: string; meaning: string }> {
  const systemPrompt = `你是一位藝術家和色彩心理學家。
你的任務是根據使用者的情緒，為他們的「今日星球」設計一個獨特的顏色。

請根據情緒的質感、氛圍和能量，自由創造一個最能代表今天的顏色。
可以是單一顏色、漸層色，或複合色。

請以 JSON 格式回應：
{
  "color": "<Hex code，如 #FF6B6B>",
  "meaning": "<這個顏色代表的意義，一句話>"
}`;

  const prompt = `情緒狀態：
- 情緒分數：${mood}/10
- 情緒標籤：${moodLabel}
- 日記內容：${content.substring(0, 150)}...

請設計一個獨特的星球顏色。`;

  try {
    const response = await callLLMForScenario('dailyEmotion', prompt, {
      systemPrompt,
      temperature: 0.9, // 高創意
      maxTokens: 150,
    });

    // 解析 JSON
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      log.info(`Generated planet color: ${result.color}`);
      return result;
    }

    throw new Error('Failed to parse color response');
  } catch (error) {
    log.error('Error generating planet color:', error);

    // 返回預設顏色
    const defaultColors: Record<string, { color: string; meaning: string }> = {
      low: { color: '#6B7280', meaning: '陰霾的灰藍色，代表低潮但仍堅持' },
      neutral: { color: '#95B8D1', meaning: '平靜的天藍色，代表安穩與和諧' },
      good: { color: '#FFD93D', meaning: '溫暖的金黃色，代表喜悅與希望' },
      excellent: { color: '#FF6B9D', meaning: '活力的粉紅色，代表熱情與能量' },
    };

    if (mood <= 3) return defaultColors.low;
    if (mood >= 7 && mood <= 8) return defaultColors.good;
    if (mood >= 9) return defaultColors.excellent;
    return defaultColors.neutral;
  }
}
