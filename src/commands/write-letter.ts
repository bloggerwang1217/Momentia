/**
 * Write Letter Command - 寫給未來的信
 */

import { ChatInputCommandInteraction, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { Command } from '../types';
import { getOrCreateUser } from '../services/user.service';
import { createSuccessEmbed } from '../utils/embed-builder';

export default {
  data: new SlashCommandBuilder()
    .setName('write-letter')
    .setDescription('✉️ 寫一封給未來的信'),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const user = await getOrCreateUser(interaction.user.id, interaction.user.username);

      const modal = new ModalBuilder()
        .setCustomId('write_letter_modal')
        .setTitle('✉️ 給未來的信');

      const deliverInput = new TextInputBuilder()
        .setCustomId('deliver_months')
        .setLabel('幾個月後送達？(輸入數字，如: 3)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('3')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(2);

      const contentInput = new TextInputBuilder()
        .setCustomId('content')
        .setLabel('你想對未來的自己說什麼？')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('寫下你的想法、目標、期待...')
        .setRequired(true)
        .setMinLength(10)
        .setMaxLength(2000);

      modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(deliverInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(contentInput)
      );

      await interaction.showModal(modal);
    } catch (error) {
      await interaction.reply({ content: '❌ 發生錯誤', ephemeral: true });
    }
  },
} as Command;
