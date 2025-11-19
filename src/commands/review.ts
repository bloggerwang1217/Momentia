/**
 * Review Command - 查看回顧報告
 */

import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../types';
import { getOrCreateUser } from '../services/user.service';
import { getOrCreateLatestReview, getUserReviews } from '../services/review.service';
import { createErrorEmbed, createInfoEmbed } from '../utils/embed-builder';
import { log } from '../utils/logger';
import { ReviewType } from '@prisma/client';

export default {
  data: new SlashCommandBuilder()
    .setName('review')
    .setDescription('📊 查看你的情緒回顧報告')
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('回顧類型')
        .setRequired(true)
        .addChoices(
          { name: '📅 週回顧', value: 'WEEKLY' },
          { name: '📆 月回顧', value: 'MONTHLY' },
          { name: '📊 季回顧', value: 'QUARTERLY' },
          { name: '🎊 年回顧', value: 'YEARLY' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('action')
        .setDescription('操作')
        .setRequired(false)
        .addChoices(
          { name: '查看當前/最新', value: 'current' },
          { name: '查看歷史列表', value: 'list' }
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply();

      const user = await getOrCreateUser(interaction.user.id, interaction.user.username);
      const type = interaction.options.getString('type', true) as ReviewType;
      const action = interaction.options.getString('action') || 'current';

      if (action === 'list') {
        // 顯示歷史回顧列表
        const reviews = await getUserReviews(user.id, type);

        if (reviews.length === 0) {
          const embed = createInfoEmbed(
            '📊 暫無回顧報告',
            `你還沒有 ${getTypeLabel(type)} 記錄。\n\n使用 \`/review type:${type}\` 生成最新的回顧報告。`
          );
          await interaction.editReply({ embeds: [embed] });
          return;
        }

        const embed = new EmbedBuilder()
          .setColor('#6366f1')
          .setTitle(`📊 ${getTypeLabel(type)} - 歷史記錄`)
          .setDescription(
            reviews
              .map(
                (r, i) =>
                  `**${i + 1}. ${r.period}**\n` +
                  `${r.summary.substring(0, 100)}...\n` +
                  `平均分數：${(r.moodTrend as any).average}/10\n`
              )
              .join('\n')
          )
          .setFooter({ text: `共 ${reviews.length} 份報告` })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } else {
        // 生成或獲取最新回顧
        try {
          const review = await getOrCreateLatestReview(user.id, type);

          const moodTrend = review.moodTrend as {
            average: number;
            highest: number;
            lowest: number;
            trend: string;
            chartData: Array<{ date: string; mood: number }>;
          };

          const highlights = review.highlights as Array<{
            date: string;
            title: string;
            description: string;
            mood: number;
          }>;

          const trendEmoji = {
            improving: '📈',
            declining: '📉',
            stable: '➡️',
          }[moodTrend.trend] || '➡️';

          const trendText = {
            improving: '上升趨勢',
            declining: '下降趨勢',
            stable: '平穩',
          }[moodTrend.trend] || '平穩';

          const embed = new EmbedBuilder()
            .setColor('#6366f1')
            .setTitle(`📊 ${getTypeLabel(type)} - ${review.period}`)
            .setDescription(`**📝 總結**\n${review.summary}`)
            .addFields(
              {
                name: '📈 情緒趨勢',
                value:
                  `${trendEmoji} ${trendText}\n` +
                  `平均：${moodTrend.average}/10\n` +
                  `最高：${moodTrend.highest}/10 | 最低：${moodTrend.lowest}/10`,
                inline: false,
              },
              {
                name: '✨ 重點時刻',
                value: highlights
                  .slice(0, 3)
                  .map((h) => `**${h.title}** (${h.date})\n${h.description.substring(0, 80)}...`)
                  .join('\n\n'),
                inline: false,
              },
              {
                name: '💡 深度洞察',
                value: review.insights.substring(0, 500),
                inline: false,
              }
            )
            .setFooter({
              text: `期間：${review.startDate.toLocaleDateString('zh-TW')} - ${review.endDate.toLocaleDateString('zh-TW')}`,
            })
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
        } catch (error: any) {
          if (error.message?.includes('No emotion records')) {
            const embed = createInfoEmbed(
              '😊 還沒有足夠的記錄',
              `這個期間內還沒有情緒記錄。\n\n使用 \`/paint\` 開始記錄你的心情吧！`
            );
            await interaction.editReply({ embeds: [embed] });
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      log.error('Error in review command:', error);
      const embed = createErrorEmbed('生成回顧報告時發生錯誤');
      await interaction.editReply({ embeds: [embed] });
    }
  },
} as Command;

function getTypeLabel(type: ReviewType): string {
  return {
    WEEKLY: '週回顧',
    MONTHLY: '月回顧',
    QUARTERLY: '季回顧',
    YEARLY: '年回顧',
  }[type];
}
