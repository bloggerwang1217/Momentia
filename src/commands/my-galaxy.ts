/**
 * My Galaxy Command
 *
 * 查看我的星球圖譜（月曆視圖）
 */

import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../types';
import { getOrCreateUser } from '../services/user.service';
import { getEmotionsByMonth } from '../services/emotion.service';
import { createBaseEmbed } from '../utils/embed-builder';
import { MOOD_EMOJIS, EMBED_COLORS } from '../utils/constants';
import { log } from '../utils/logger';

export default {
  data: new SlashCommandBuilder()
    .setName('my-galaxy')
    .setDescription('🌌 查看我的星球圖譜（月曆視圖）')
    .addStringOption((option) =>
      option
        .setName('month')
        .setDescription('月份（格式：YYYY-MM，留空則查看本月）')
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply();

      const user = await getOrCreateUser(interaction.user.id, interaction.user.username);
      const monthStr = interaction.options.getString('month');

      let year: number;
      let month: number;

      if (!monthStr) {
        const now = new Date();
        year = now.getFullYear();
        month = now.getMonth() + 1;
      } else {
        const match = monthStr.match(/^(\d{4})-(\d{2})$/);
        if (!match) {
          await interaction.editReply({
            content: '❌ 月份格式錯誤！請使用 YYYY-MM 格式（例如：2024-01）',
          });
          return;
        }
        year = parseInt(match[1]);
        month = parseInt(match[2]);

        if (month < 1 || month > 12) {
          await interaction.editReply({
            content: '❌ 月份必須在 1-12 之間！',
          });
          return;
        }
      }

      // 取得該月所有記錄
      const emotions = await getEmotionsByMonth(user.id, year, month);

      // 建立月曆視圖
      const daysInMonth = new Date(year, month, 0).getDate();
      const firstDay = new Date(year, month - 1, 1).getDay();

      // 創建情緒地圖
      const emotionMap = new Map(
        emotions.map((e) => [e.date.getDate(), e])
      );

      // 生成月曆文字
      let calendar = '```\n';
      calendar += '日 一 二 三 四 五 六\n';

      // 添加空白（對齊第一天）
      for (let i = 0; i < firstDay; i++) {
        calendar += '   ';
      }

      // 添加日期
      for (let day = 1; day <= daysInMonth; day++) {
        const emotion = emotionMap.get(day);
        if (emotion) {
          // 有記錄，顯示情緒分數
          calendar += emotion.mood.toString().padStart(2, ' ') + ' ';
        } else {
          // 無記錄，顯示日期
          calendar += day.toString().padStart(2, ' ') + ' ';
        }

        if ((firstDay + day) % 7 === 0) {
          calendar += '\n';
        }
      }

      calendar += '\n```';

      // 創建 Embed
      const embed = createBaseEmbed(
        `🌌 ${year} 年 ${month} 月的星球圖譜`,
        undefined,
        EMBED_COLORS.INFO
      );

      embed.addFields(
        {
          name: '📅 月曆',
          value: calendar + '\n💡 數字代表當天的心情分數 (1-10)',
        },
        {
          name: '📊 本月統計',
          value:
            `記錄天數: ${emotions.length} 天\n` +
            `平均心情: ${emotions.length > 0 ? (emotions.reduce((sum, e) => sum + e.mood, 0) / emotions.length).toFixed(1) : 'N/A'}/10\n` +
            `最高分: ${emotions.length > 0 ? Math.max(...emotions.map((e) => e.mood)) : 'N/A'}\n` +
            `最低分: ${emotions.length > 0 ? Math.min(...emotions.map((e) => e.mood)) : 'N/A'}`,
          inline: true,
        }
      );

      // 顯示本月最亮的星球
      if (emotions.length > 0) {
        const best = emotions.reduce((max, e) => (e.mood > max.mood ? e : max));
        const emoji = MOOD_EMOJIS[best.mood as keyof typeof MOOD_EMOJIS] || '⭐';

        embed.addFields({
          name: `${emoji} 本月最亮的星球`,
          value: `${best.date.getDate()} 日 - ${best.moodLabel} (${best.mood}/10)`,
          inline: true,
        });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      log.error('Error in my-galaxy command:', error);
      await interaction.editReply({
        content: '❌ 發生錯誤，請稍後再試。',
      });
    }
  },
} as Command;
