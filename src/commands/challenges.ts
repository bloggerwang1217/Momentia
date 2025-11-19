/**
 * Challenges Command - 查看挑戰
 */

import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Command } from '../types';
import { getOrCreateUser } from '../services/user.service';
import { getUserChallenges, assignRandomChallenge, getUserChallengeStats } from '../services/challenge.service';
import { createErrorEmbed, createInfoEmbed } from '../utils/embed-builder';
import { log } from '../utils/logger';

export default {
  data: new SlashCommandBuilder()
    .setName('challenges')
    .setDescription('👾 查看你的幸福挑戰'),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply();

      const user = await getOrCreateUser(interaction.user.id, interaction.user.username);

      // 獲取使用者當前的挑戰
      const challenges = await getUserChallenges(user.id, false);

      // 獲取統計資料
      const stats = await getUserChallengeStats(user.id);

      if (challenges.length === 0) {
        const embed = createInfoEmbed(
          '👾 外星生命入侵！',
          '你目前沒有活躍的挑戰。\n\n點擊下方按鈕接受一個新挑戰，開啟你的幸福探索之旅！'
        );

        embed.addFields({
          name: '📊 你的挑戰統計',
          value:
            `✅ 已完成：${stats.completed}\n` +
            `⏳ 進行中：${stats.active}\n` +
            `⚠️ 已過期：${stats.expired}\n` +
            `📈 完成率：${stats.completionRate}%`,
        });

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('accept_challenge')
            .setLabel('接受新挑戰')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎯')
        );

        await interaction.editReply({
          embeds: [embed],
          components: [row],
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('#f59e0b')
        .setTitle('👾 你的幸福挑戰')
        .setDescription('完成挑戰可以獲得豐厚的獎勵！')
        .addFields({
          name: '📊 挑戰統計',
          value:
            `✅ 已完成：${stats.completed}\n` +
            `⏳ 進行中：${stats.active}\n` +
            `⚠️ 已過期：${stats.expired}\n` +
            `📈 完成率：${stats.completionRate}%`,
          inline: false,
        });

      // 列出所有活躍挑戰
      for (const challenge of challenges) {
        const uc = challenge.userChallenge!;
        const daysLeft = Math.ceil((uc.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const isExpired = daysLeft < 0;
        const difficultyStars = '⭐'.repeat(challenge.difficulty);

        const reward = challenge.reward as { type: string; value: number | string };
        const rewardText = reward.type === 'stardust'
          ? `${reward.value} 星塵`
          : `徽章：${reward.value}`;

        embed.addFields({
          name: `${difficultyStars} ${challenge.title}`,
          value:
            `📝 ${challenge.description}\n` +
            `🏆 獎勵：${rewardText}\n` +
            `⏰ ${isExpired ? `已過期 ${Math.abs(daysLeft)} 天` : `剩餘 ${daysLeft} 天`}\n` +
            `🆔 ID: ${uc.id.substring(0, 8)}`,
          inline: false,
        });
      }

      embed.setFooter({
        text: '使用 /complete-challenge 完成挑戰 | 最多同時 3 個挑戰',
      });

      // 添加按鈕（如果少於 3 個挑戰）
      const components = [];
      if (challenges.length < 3) {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('accept_challenge')
            .setLabel('接受新挑戰')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🎯')
        );
        components.push(row);
      }

      await interaction.editReply({
        embeds: [embed],
        components,
      });
    } catch (error) {
      log.error('Error in challenges command:', error);
      const embed = createErrorEmbed('查看挑戰時發生錯誤');
      await interaction.editReply({ embeds: [embed] });
    }
  },
} as Command;
