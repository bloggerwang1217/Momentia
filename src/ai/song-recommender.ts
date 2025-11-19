/**
 * Song Recommender
 *
 * 根據情緒推薦歌曲
 */

import { callLLMWithWebSearch, generateJSON } from './llm.service';
import { log } from '../utils/logger';
import { SongRecommendation } from '../types';

/**
 * 推薦歌曲
 */
export async function recommendSong(
  content: string,
  mood: number,
  moodLabel: string
): Promise<SongRecommendation> {
  const systemPrompt = `你是一位音樂治療師和歌曲推薦專家。
你的任務是根據使用者的情緒狀態，推薦一首能夠共鳴、療癒或鼓勵他們的歌曲。

請考慮：
- 歌曲的情緒氛圍要與使用者當前狀態相符或能帶來正面影響
- 優先推薦華語、英語或日語歌曲
- 選擇經典或知名度較高的歌曲

請以 JSON 格式回應：
{
  "songName": "<歌曲名稱>",
  "artist": "<歌手名稱>",
  "url": "<Spotify、YouTube 或 Apple Music 的播放連結（使用網路搜尋找出）>",
  "reason": "<推薦理由，一句話>"
}

如果無法找到連結，url 可以為 null。`;

  const prompt = `使用者情緒狀態：
- 情緒分數：${mood}/10
- 情緒標籤：${moodLabel}
- 日記內容：${content.substring(0, 200)}...

請推薦一首適合的歌曲，並使用網路搜尋功能找出播放連結。`;

  try {
    // 使用網路搜尋功能
    const result = await generateJSON<SongRecommendation>(prompt, {
      systemPrompt,
      temperature: 0.8,
      model: 'gpt-5.1-mini',
    });

    log.info(`Recommended song: ${result.songName} by ${result.artist}`);

    return result;
  } catch (error) {
    log.error('Error recommending song:', error);

    // 返回預設歌曲
    const defaultSongs: Record<string, SongRecommendation> = {
      low: {
        songName: 'Someone Like You',
        artist: 'Adele',
        reason: '讓情緒流淌，接納自己的感受',
      },
      neutral: {
        songName: 'Weightless',
        artist: 'Marconi Union',
        reason: '平靜的旋律，適合放鬆心情',
      },
      good: {
        songName: 'Happy',
        artist: 'Pharrell Williams',
        reason: '輕快的節奏，延續你的好心情',
      },
      excellent: {
        songName: 'Walking on Sunshine',
        artist: 'Katrina and the Waves',
        reason: '充滿活力，慶祝美好時刻',
      },
    };

    let category: keyof typeof defaultSongs = 'neutral';
    if (mood <= 3) category = 'low';
    else if (mood >= 7 && mood <= 8) category = 'good';
    else if (mood >= 9) category = 'excellent';

    return defaultSongs[category];
  }
}
