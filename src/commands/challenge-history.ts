/**
 * Challenge History Command - 挑戰歷史
 */

import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../types';
import { getOrCreateUser } from '../services/user.service';
import { getUserCompletedChallenges, getUserChallengeStats } from '../services/challenge.service';
import { createInfoEmbed } from '../utils/embed-builder';
import { log } from '../utils/logger';

export default {
  data: new SlashCommandBuilder()
    .setName('challenge-history')
    .setDescription('📜 查看你的挑戰完成歷史'),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply();

      const user = await getOrCreateUser(interaction.user.id, interaction.user.username);

      const [completedChallenges, stats] = await Promise.all([
        getUserCompletedChallenges(user.id),
        getUserChallengeStats(user.id),
      ]);

      if (completedChallenges.length === 0) {
        const embed = createInfoEmbed(
          '📜 還沒有完成記錄',
          '你還沒有完成任何挑戰。\n\n使用 `/challenges` 開始接受挑戰吧！'
        );
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('#10b981')
        .setTitle('📜 挑戰完成歷史')
        .setDescription(`你已經完成了 ${stats.completed} 個挑戰！`)
        .addFields({
          name: '📊 統計資料',
          value:
            `✅ 已完成：${stats.completed}\n` +
            `⏳ 進行中：${stats.active}\n` +
            `⚠️ 已過期：${stats.expired}\n` +
            `📈 完成率：${stats.completionRate}%`,
          inline: false,
        });

      // 顯示最近的 10 個完成記錄
      const recentChallenges = completedChallenges.slice(0, 10);

      for (const uc of recentChallenges) {
        const challenge = uc.challenge as any;
        const difficultyStars = '⭐'.repeat(challenge.difficulty);
        const completedDate = uc.completedAt?.toLocaleDateString('zh-TW') || '未知';

        const reward = challenge.reward as { type: string; value: number | string };
        const rewardText = reward.type === 'stardust'
          ? `${reward.value} 星塵`
          : `徽章：${reward.value}`;

        embed.addFields({
          name: `${difficultyStars} ${challenge.title}`,
          value:
            `✅ 完成於：${completedDate}\n` +
            `🏆 獎勵：${rewardText}\n` +
            `📝 證明：${uc.proof?.substring(0, 100)}...`,
          inline: false,
        });
      }

      if (completedChallenges.length > 10) {
        embed.setFooter({
          text: `顯示最近 10 個完成記錄，共 ${completedChallenges.length} 個`,
        });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      log.error('Error in challenge-history command:', error);
      await interaction.editReply({
        content: '❌ 查看挑戰歷史時發生錯誤',
      });
    }
  },
} as Command;
