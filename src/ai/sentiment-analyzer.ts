/**
 * Sentiment Analyzer
 *
 * 分析情緒並生成情緒標籤和分數
 */

import { callLLMForScenario, generateJSON } from './llm.service';
import { log } from '../utils/logger';
import { EmotionAnalysis } from '../types';

/**
 * 分析情緒內容
 */
export async function analyzeEmotion(content: string): Promise<EmotionAnalysis> {
  const systemPrompt = `你是一位專業的情緒分析師和心理諮詢師。
你的任務是分析使用者的情緒日記，並給予同理心的回應。

請分析以下內容並回應 JSON 格式：
{
  "mood": <1-10的整數，代表整體情緒分數>,
  "moodLabel": "<情緒標籤，如：開心、焦慮、平靜等>",
  "aiInsight": "<給使用者的同理心洞察和鼓勵，2-3句話>",
  "color": "<代表這個情緒的顏色 hex code，如 #FF6B6B>",
  "tags": ["<關鍵情緒標籤1>", "<關鍵情緒標籤2>"]
}

評分標準：
1-3: 非常低落、悲傷、焦慮
4-6: 平淡、還好、平靜
7-8: 愉快、開心
9-10: 非常快樂、興奮

請確保回應溫暖、真誠且有同理心。`;

  const prompt = `使用者的日記內容：

${content}

請分析上述內容。`;

  try {
    const result = await generateJSON<EmotionAnalysis>(prompt, {
      systemPrompt,
      temperature: 0.7,
    });

    // 驗證結果
    if (!result.mood || result.mood < 1 || result.mood > 10) {
      throw new Error('Invalid mood score');
    }

    log.info(`Analyzed emotion: mood=${result.mood}, label=${result.moodLabel}`);

    return result;
  } catch (error) {
    log.error('Error analyzing emotion:', error);

    // 返回預設值
    return {
      mood: 5,
      moodLabel: '平靜',
      aiInsight: '感謝你記錄今天的心情。每一天都是獨特的，繼續保持這個好習慣！',
      color: '#95B8D1',
      tags: ['日常'],
    };
  }
}

/**
 * 分析聊天記錄並提取情緒片段
 */
export async function analyzeChatHistory(
  chatContent: string
): Promise<{
  segments: Array<{
    time?: string;
    mood: number;
    moodLabel: string;
    content: string;
    keyEvent: string;
  }>;
  overallMood: number;
  summary: string;
}> {
  const systemPrompt = `你是一位專業的對話分析師。
你的任務是分析使用者提供的聊天記錄，識別不同時間點的情緒變化。

請分析聊天記錄並回應 JSON 格式：
{
  "segments": [
    {
      "time": "<如果能識別出時間，格式為 HH:mm，否則為 null>",
      "mood": <1-10的整數>,
      "moodLabel": "<情緒標籤>",
      "content": "<該片段的簡短摘要>",
      "keyEvent": "<關鍵事件描述>"
    }
  ],
  "overallMood": <整體平均情緒分數 1-10>,
  "summary": "<整體情緒變化的簡短摘要，2-3句話>"
}`;

  const prompt = `聊天記錄：

${chatContent}

請分析上述聊天記錄，識別情緒變化的關鍵時刻。`;

  try {
    const result = await generateJSON<any>(prompt, {
      systemPrompt,
      temperature: 0.7,
    });

    log.info(`Analyzed chat history: ${result.segments?.length || 0} segments found`);

    return result;
  } catch (error) {
    log.error('Error analyzing chat history:', error);

    // 返回預設值
    return {
      segments: [
        {
          mood: 5,
          moodLabel: '平靜',
          content: chatContent.substring(0, 100),
          keyEvent: '日常對話',
        },
      ],
      overallMood: 5,
      summary: '今天有一些對話和想法，整體情緒平穩。',
    };
  }
}
