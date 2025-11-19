/**
 * Paint Command
 *
 * 開始今天的星球彩繪，記錄情緒
 */

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { Command } from '../types';
import { getOrCreateUser } from '../services/user.service';
import { createEmotionRecord, getTodayEmotion, createEmotionFromChat } from '../services/emotion.service';
import { createPlanetEmbed, createInfoEmbed, createWarningEmbed } from '../utils/embed-builder';
import { log } from '../utils/logger';

export default {
  data: new SlashCommandBuilder()
    .setName('paint')
    .setDescription('🎨 開始今天的星球彩繪，記錄你的心情'),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      // 取得或創建使用者
      const user = await getOrCreateUser(interaction.user.id, interaction.user.username);

      // 檢查今天是否已經記錄
      const todayEmotion = await getTodayEmotion(user.id);
      if (todayEmotion) {
        const embed = createWarningEmbed(
          '你今天已經記錄過心情了！\n\n使用 `/view-planet` 查看今天的星球。'
        );
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      // 顯示選擇輸入方式的按鈕
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('paint_manual')
          .setLabel('✍️ 手動輸入')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('paint_chat')
          .setLabel('📋 貼上聊天記錄')
          .setStyle(ButtonStyle.Secondary)
      );

      const embed = createInfoEmbed(
        '🌟 歡迎來到今天的星球！',
        '你想怎麼記錄今天的心情？\n\n**✍️ 手動輸入** - 直接輸入心情分數和內容\n**📋 貼上聊天記錄** - 讓 AI 分析你的對話記錄'
      );

      await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: false,
      });
    } catch (error) {
      log.error('Error in paint command:', error);
      await interaction.reply({
        content: '❌ 發生錯誤，請稍後再試。',
        ephemeral: true,
      });
    }
  },
} as Command;
