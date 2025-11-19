/**
 * Open Letter Command - 開啟信件
 */

import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../types';
import { getOrCreateUser } from '../services/user.service';
import { getLetter, openLetter } from '../services/letter.service';
import { createLetterEmbed, createWarningEmbed } from '../utils/embed-builder';

export default {
  data: new SlashCommandBuilder()
    .setName('open-letter')
    .setDescription('📭 打開已送達的信')
    .addStringOption(option =>
      option.setName('id').setDescription('信件 ID').setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply();
      const user = await getOrCreateUser(interaction.user.id, interaction.user.username);
      const letterId = interaction.options.getString('id', true);

      const letter = await getLetter(letterId);

      if (!letter || letter.userId !== user.id) {
        await interaction.editReply({ embeds: [createWarningEmbed('找不到這封信件')] });
        return;
      }

      if (letter.deliverDate > new Date()) {
        const days = Math.ceil((letter.deliverDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        await interaction.editReply({ embeds: [createWarningEmbed(`這封信還需要 ${days} 天才會送達`)] });
        return;
      }

      const opened = !letter.opened ? await openLetter(letterId) : letter;

      const embed = createLetterEmbed({
        content: opened.content,
        sendDate: opened.sendDate,
        deliverDate: opened.deliverDate,
        opened: true,
      });

      await interaction.editReply({
        content: !letter.opened ? '📬 信件已開啟！' : '',
        embeds: [embed]
      });
    } catch (error) {
      await interaction.editReply({ content: '❌ 發生錯誤' });
    }
  },
} as Command;
