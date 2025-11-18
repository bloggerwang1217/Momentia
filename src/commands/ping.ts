/**
 * Ping Command
 *
 * 測試指令 - 檢查 Bot 是否正常運作
 */

import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../types';
import { createSuccessEmbed } from '../utils/embed-builder';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('檢查 Bot 是否正常運作'),

  async execute(interaction: ChatInputCommandInteraction) {
    const sent = await interaction.reply({
      content: '🏓 Pinging...',
      fetchReply: true,
    });

    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    const embed = createSuccessEmbed(
      `🏓 Pong!\n\n` +
        `📡 延遲: ${latency}ms\n` +
        `🌐 API 延遲: ${apiLatency}ms\n` +
        `✨ Bot 運作正常！`
    );

    await interaction.editReply({ content: '', embeds: [embed] });
  },
} as Command;
