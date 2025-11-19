/**
 * View Planet Command
 *
 * 查看特定日期的星球
 */

import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../types';
import { getOrCreateUser } from '../services/user.service';
import { getEmotionByDate, getTodayEmotion } from '../services/emotion.service';
import { createPlanetEmbed, createWarningEmbed } from '../utils/embed-builder';
import { parseDate } from '../utils/date-utils';
import { log } from '../utils/logger';

export default {
  data: new SlashCommandBuilder()
    .setName('view-planet')
    .setDescription('🔍 查看特定日期的星球')
    .addStringOption((option) =>
      option
        .setName('date')
        .setDescription('日期（格式：YYYY-MM-DD，留空則查看今天）')
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply();

      const user = await getOrCreateUser(interaction.user.id, interaction.user.username);
      const dateStr = interaction.options.getString('date');

      let emotion;
      let targetDate: Date;

      if (!dateStr) {
        // 查看今天
        emotion = await getTodayEmotion(user.id);
        targetDate = new Date();
      } else {
        // 解析日期
        const parsed = parseDate(dateStr);
        if (!parsed) {
          await interaction.editReply({
            content: '❌ 日期格式錯誤！請使用 YYYY-MM-DD 格式（例如：2024-01-15）',
          });
          return;
        }

        targetDate = parsed;
        emotion = await getEmotionByDate(user.id, parsed);
      }

      if (!emotion) {
        const dateDisplay = targetDate.toLocaleDateString('zh-TW');
        const embed = createWarningEmbed(
          `在 ${dateDisplay} 沒有找到星球記錄。\n\n使用 \`/paint\` 開始記錄今天的心情！`
        );
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // 顯示星球
      const embed = createPlanetEmbed({
        planetId: emotion.planetId || '#???',
        mood: emotion.mood,
        moodLabel: emotion.moodLabel,
        color: emotion.color || undefined,
        songName: emotion.songName || undefined,
        songUrl: emotion.songUrl || undefined,
        aiInsight: emotion.aiInsight || undefined,
        date: emotion.date,
      });

      // 添加日記內容
      if (emotion.content) {
        embed.addFields({
          name: '📝 日記內容',
          value: emotion.content.substring(0, 1024),
        });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      log.error('Error in view-planet command:', error);
      await interaction.editReply({
        content: '❌ 發生錯誤，請稍後再試。',
      });
    }
  },
} as Command;
