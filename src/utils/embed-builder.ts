/**
 * Embed Builder Utility
 *
 * 建構美觀的 Discord Embed 訊息
 */

import { EmbedBuilder, ColorResolvable } from 'discord.js';
import { EMBED_COLORS, MOOD_EMOJIS } from './constants';

/**
 * 創建基礎 Embed
 */
export function createBaseEmbed(
  title?: string,
  description?: string,
  color: ColorResolvable = EMBED_COLORS.PRIMARY
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTimestamp()
    .setFooter({ text: 'Mementia - Where memories live ✨' });

  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);

  return embed;
}

/**
 * 創建成功訊息 Embed
 */
export function createSuccessEmbed(message: string): EmbedBuilder {
  return createBaseEmbed('✅ 成功', message, EMBED_COLORS.SUCCESS);
}

/**
 * 創建錯誤訊息 Embed
 */
export function createErrorEmbed(message: string): EmbedBuilder {
  return createBaseEmbed('❌ 錯誤', message, EMBED_COLORS.ERROR);
}

/**
 * 創建警告訊息 Embed
 */
export function createWarningEmbed(message: string): EmbedBuilder {
  return createBaseEmbed('⚠️ 警告', message, EMBED_COLORS.WARNING);
}

/**
 * 創建資訊訊息 Embed
 */
export function createInfoEmbed(title: string, message: string): EmbedBuilder {
  return createBaseEmbed(title, message, EMBED_COLORS.INFO);
}

/**
 * 創建星球彩繪 Embed
 */
export function createPlanetEmbed(data: {
  planetId: string;
  mood: number;
  moodLabel: string;
  color?: string;
  songName?: string;
  songUrl?: string;
  aiInsight?: string;
  date: Date;
}): EmbedBuilder {
  const emoji = MOOD_EMOJIS[data.mood as keyof typeof MOOD_EMOJIS] || '😊';

  const embed = createBaseEmbed(
    `${emoji} 你的星球 #${data.planetId}`,
    undefined,
    data.color ? parseInt(data.color.replace('#', ''), 16) : EMBED_COLORS.PRIMARY
  );

  embed.addFields(
    { name: '📅 日期', value: data.date.toLocaleDateString('zh-TW'), inline: true },
    { name: '💫 情緒', value: `${data.moodLabel} (${data.mood}/10)`, inline: true },
    { name: '🎨 顏色', value: data.color || '未設定', inline: true }
  );

  if (data.songName && data.songUrl) {
    embed.addFields({
      name: '🎵 推薦歌曲',
      value: `[${data.songName}](${data.songUrl})`,
    });
  } else if (data.songName) {
    embed.addFields({
      name: '🎵 推薦歌曲',
      value: data.songName,
    });
  }

  if (data.aiInsight) {
    embed.addFields({
      name: '💭 AI 洞察',
      value: data.aiInsight,
    });
  }

  return embed;
}

/**
 * 創建回顧報告 Embed
 */
export function createReviewEmbed(data: {
  type: string;
  period: string;
  summary: string;
  highlights: string[];
  insights: string;
  averageMood: number;
}): EmbedBuilder {
  const embed = createBaseEmbed(
    `📊 ${data.type}回顧 - ${data.period}`,
    undefined,
    EMBED_COLORS.INFO
  );

  embed.addFields(
    {
      name: '📈 情緒趨勢',
      value: `平均心情指數: ${data.averageMood.toFixed(1)}/10`,
    },
    {
      name: '✨ 本期亮點',
      value: data.highlights.join('\n') || '暫無亮點',
    },
    {
      name: '💭 AI 深度洞察',
      value: data.insights,
    }
  );

  return embed;
}

/**
 * 創建挑戰 Embed
 */
export function createChallengeEmbed(data: {
  title: string;
  description: string;
  category: string;
  difficulty: number;
  reward: { type: string; value: number | string };
  dueDate?: Date;
}): EmbedBuilder {
  const difficultyStars = '⭐'.repeat(data.difficulty);

  const embed = createBaseEmbed(
    `🛸 挑戰: ${data.title}`,
    data.description,
    EMBED_COLORS.WARNING
  );

  embed.addFields(
    { name: '📂 類別', value: data.category, inline: true },
    { name: '⭐ 難度', value: difficultyStars, inline: true },
    {
      name: '🎁 獎勵',
      value:
        data.reward.type === 'stardust'
          ? `星塵 x${data.reward.value}`
          : `徽章: ${data.reward.value}`,
      inline: true,
    }
  );

  if (data.dueDate) {
    embed.addFields({
      name: '⏰ 截止時間',
      value: data.dueDate.toLocaleDateString('zh-TW'),
    });
  }

  return embed;
}

/**
 * 創建信件 Embed
 */
export function createLetterEmbed(data: {
  content: string;
  sendDate: Date;
  deliverDate?: Date;
  opened?: boolean;
}): EmbedBuilder {
  const embed = createBaseEmbed(
    data.opened ? '📬 來自過去的信' : '📮 給未來的信',
    data.content,
    EMBED_COLORS.INFO
  );

  embed.addFields({
    name: '📅 寄件日期',
    value: data.sendDate.toLocaleDateString('zh-TW'),
    inline: true,
  });

  if (data.deliverDate) {
    embed.addFields({
      name: '📅 送達日期',
      value: data.deliverDate.toLocaleDateString('zh-TW'),
      inline: true,
    });
  }

  return embed;
}

/**
 * 創建使用者統計 Embed
 */
export function createStatsEmbed(data: {
  username: string;
  level: number;
  levelName: string;
  stardust: number;
  totalRecords: number;
  badges: number;
  currentStreak: number;
}): EmbedBuilder {
  const embed = createBaseEmbed(
    `📊 ${data.username} 的統計資料`,
    undefined,
    EMBED_COLORS.INFO
  );

  embed.addFields(
    { name: '🎖️ 等級', value: `Lv.${data.level} ${data.levelName}`, inline: true },
    { name: '⭐ 星塵', value: `${data.stardust}`, inline: true },
    { name: '📝 總記錄數', value: `${data.totalRecords} 天`, inline: true },
    { name: '🏅 徽章', value: `${data.badges} 個`, inline: true },
    { name: '🔥 連續記錄', value: `${data.currentStreak} 天`, inline: true }
  );

  return embed;
}

/**
 * 創建徽章獲得通知 Embed
 */
export function createBadgeEarnedEmbed(data: {
  badgeName: string;
  badgeIcon: string;
  description: string;
  stardustReward?: number;
}): EmbedBuilder {
  const embed = createBaseEmbed(
    '🎉 恭喜！你獲得了新徽章！',
    undefined,
    EMBED_COLORS.SUCCESS
  );

  embed.addFields(
    {
      name: `${data.badgeIcon} ${data.badgeName}`,
      value: data.description,
    },
    {
      name: '🎁 獎勵',
      value: data.stardustReward ? `⭐ +${data.stardustReward} 星塵` : '無',
    }
  );

  return embed;
}
