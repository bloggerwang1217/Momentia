/**
 * Complete Challenge Command - 完成挑戰
 */

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from 'discord.js';
import { Command } from '../types';
import { getOrCreateUser } from '../services/user.service';
import { getUserChallenges } from '../services/challenge.service';
import { createErrorEmbed, createInfoEmbed } from '../utils/embed-builder';
import { log } from '../utils/logger';

export default {
  data: new SlashCommandBuilder()
    .setName('complete-challenge')
    .setDescription('✅ 完成挑戰並獲得獎勵')
    .addStringOption((option) =>
      option
        .setName('challenge_id')
        .setDescription('挑戰 ID (前 8 位即可)')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const user = await getOrCreateUser(interaction.user.id, interaction.user.username);
      const partialId = interaction.options.getString('challenge_id', true);

      // 獲取使用者的活躍挑戰
      const challenges = await getUserChallenges(user.id, false);

      // 找到匹配的挑戰
      const matchedChallenge = challenges.find(
        (c) => c.userChallenge?.id.startsWith(partialId)
      );

      if (!matchedChallenge || !matchedChallenge.userChallenge) {
        const embed = createErrorEmbed(
          '找不到該挑戰，請檢查 ID 是否正確。\n\n使用 `/challenges` 查看你的活躍挑戰。'
        );
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      if (matchedChallenge.userChallenge.completed) {
        const embed = createInfoEmbed(
          '該挑戰已完成',
          '你已經完成過這個挑戰了！'
        );
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      // 顯示 Modal 讓使用者輸入完成證明
      const modal = new ModalBuilder()
        .setCustomId(`complete_challenge_${matchedChallenge.userChallenge.id}`)
        .setTitle('完成挑戰');

      const challengeTitle = new TextInputBuilder()
        .setCustomId('challenge_title')
        .setLabel('挑戰名稱')
        .setStyle(TextInputStyle.Short)
        .setValue(matchedChallenge.title)
        .setRequired(false);

      const proofInput = new TextInputBuilder()
        .setCustomId('proof')
        .setLabel('完成證明 (描述你如何完成這個挑戰)')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('分享你的經驗和感受...')
        .setRequired(true)
        .setMinLength(20)
        .setMaxLength(1000);

      modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(challengeTitle),
        new ActionRowBuilder<TextInputBuilder>().addComponents(proofInput)
      );

      await interaction.showModal(modal);
    } catch (error) {
      log.error('Error in complete-challenge command:', error);
      const embed = createErrorEmbed('完成挑戰時發生錯誤');
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
} as Command;
