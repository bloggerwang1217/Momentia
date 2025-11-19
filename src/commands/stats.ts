/**
 * Stats Command - 統計資訊
 */

import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../types';
import { getOrCreateUser, getUserStats } from '../services/user.service';
import { getUserChallengeStats } from '../services/challenge.service';
import { prisma } from '../config/prisma';
import { log } from '../utils/logger';

export default {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('📊 查看你的統計資訊'),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply();

      const user = await getOrCreateUser(interaction.user.id, interaction.user.username);

      // 獲取各種統計
      const [userStats, challengeStats, emotionStats, letterStats] = await Promise.all([
        getUserStats(user.id),
        getUserChallengeStats(user.id),
        getEmotionStats(user.id),
        getLetterStats(user.id),
      ]);

      const embed = new EmbedBuilder()
        .setColor('#10b981')
        .setTitle(`📊 ${interaction.user.username} 的統計資訊`)
        .setDescription('你在 Mementia 宇宙中的旅程數據')
        .addFields(
          {
            name: '⭐ 基本資訊',
            value:
              `等級：Lv.${userStats.level}\n` +
              `星塵：${userStats.stardust} ✨\n` +
              `徽章：${userStats.badges.length} 個\n` +
              `總記錄：${userStats.totalRecords} 天`,
            inline: true,
          },
          {
            name: '🔥 連續記錄',
            value:
              `當前：${userStats.currentStreak} 天\n` +
              `最長：${userStats.longestStreak} 天\n` +
              (userStats.currentStreak >= 7 ? '🎉 保持得很好！' : '💪 繼續努力！'),
            inline: true,
          },
          {
            name: '🎨 情緒記錄',
            value:
              `總記錄：${emotionStats.total} 次\n` +
              `平均分數：${emotionStats.averageMood}/10\n` +
              `最高分數：${emotionStats.highestMood}/10\n` +
              `最低分數：${emotionStats.lowestMood}/10`,
            inline: false,
          },
          {
            name: '👾 挑戰系統',
            value:
              `已完成：${challengeStats.completed} 個\n` +
              `進行中：${challengeStats.active} 個\n` +
              `已過期：${challengeStats.expired} 個\n` +
              `完成率：${challengeStats.completionRate}%`,
            inline: true,
          },
          {
            name: '✉️ 未來的信',
            value:
              `已發送：${letterStats.sent} 封\n` +
              `待送達：${letterStats.pending} 封\n` +
              `已開啟：${letterStats.opened} 封`,
            inline: true,
          }
        )
        .setFooter({
          text: `加入時間：${user.createdAt.toLocaleDateString('zh-TW')}`,
        })
        .setTimestamp();

      // 如果有徽章，顯示前幾個
      if (userStats.badges.length > 0) {
        const badgeList = userStats.badges
          .slice(0, 5)
          .map((b: any) => `${b.emoji || '🏅'} ${b.name}`)
          .join('\n');

        embed.addFields({
          name: '🏆 最近獲得的徽章',
          value: badgeList + (userStats.badges.length > 5 ? `\n...還有 ${userStats.badges.length - 5} 個` : ''),
          inline: false,
        });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      log.error('Error in stats command:', error);
      await interaction.editReply({
        content: '❌ 獲取統計資訊時發生錯誤',
      });
    }
  },
} as Command;

async function getEmotionStats(userId: string) {
  const emotions = await prisma.emotion.findMany({
    where: { userId },
    select: { mood: true },
  });

  if (emotions.length === 0) {
    return {
      total: 0,
      averageMood: 0,
      highestMood: 0,
      lowestMood: 0,
    };
  }

  const moods = emotions.map((e) => e.mood);
  const total = emotions.length;
  const averageMood = moods.reduce((sum, mood) => sum + mood, 0) / total;
  const highestMood = Math.max(...moods);
  const lowestMood = Math.min(...moods);

  return {
    total,
    averageMood: Math.round(averageMood * 10) / 10,
    highestMood,
    lowestMood,
  };
}

async function getLetterStats(userId: string) {
  const [sent, pending, opened] = await Promise.all([
    prisma.futureLetter.count({
      where: { userId },
    }),
    prisma.futureLetter.count({
      where: {
        userId,
        deliverDate: { gt: new Date() },
      },
    }),
    prisma.futureLetter.count({
      where: {
        userId,
        opened: true,
      },
    }),
  ]);

  return { sent, pending, opened };
}
