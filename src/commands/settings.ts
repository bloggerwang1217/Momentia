/**
 * Settings Command - 使用者設定
 */

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from 'discord.js';
import { Command } from '../types';
import { getOrCreateUser, updateUserEmail } from '../services/user.service';
import { prisma } from '../config/prisma';
import { createInfoEmbed } from '../utils/embed-builder';
import { log } from '../utils/logger';

export default {
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('⚙️ 管理你的設定')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('view')
        .setDescription('查看當前設定')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('email')
        .setDescription('設定 Email（用於接收通知）')
        .addStringOption((option) =>
          option
            .setName('address')
            .setDescription('你的 Email 地址')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('timezone')
        .setDescription('設定時區')
        .addStringOption((option) =>
          option
            .setName('zone')
            .setDescription('時區（如：Asia/Taipei, America/New_York）')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('reminder')
        .setDescription('設定每日提醒')
        .addBooleanOption((option) =>
          option
            .setName('enabled')
            .setDescription('是否啟用提醒')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('time')
            .setDescription('提醒時間（格式：HH:MM，如：20:00）')
            .setRequired(false)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const user = await getOrCreateUser(interaction.user.id, interaction.user.username);
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'view') {
        await handleViewSettings(interaction, user);
      } else if (subcommand === 'email') {
        await handleSetEmail(interaction, user);
      } else if (subcommand === 'timezone') {
        await handleSetTimezone(interaction, user);
      } else if (subcommand === 'reminder') {
        await handleSetReminder(interaction, user);
      }
    } catch (error) {
      log.error('Error in settings command:', error);
      await interaction.reply({
        content: '❌ 設定時發生錯誤',
        ephemeral: true,
      });
    }
  },
} as Command;

async function handleViewSettings(interaction: ChatInputCommandInteraction, user: any) {
  const settings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  const embed = new EmbedBuilder()
    .setColor('#8b5cf6')
    .setTitle('⚙️ 你的設定')
    .addFields(
      {
        name: '📧 Email',
        value: user.email || '未設定',
        inline: true,
      },
      {
        name: '🌍 時區',
        value: user.timezone,
        inline: true,
      },
      {
        name: '🔔 每日提醒',
        value: settings?.dailyReminder
          ? `✅ 已啟用\n⏰ ${user.reminderTime || '未設定時間'}`
          : '❌ 已關閉',
        inline: false,
      },
      {
        name: '🤖 AI 分析',
        value: settings?.aiAnalysis ? '✅ 已啟用' : '❌ 已關閉',
        inline: true,
      },
      {
        name: '🎵 音樂推薦',
        value: settings?.songRecommendation ? '✅ 已啟用' : '❌ 已關閉',
        inline: true,
      }
    )
    .setFooter({ text: '使用 /settings <subcommand> 修改設定' });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleSetEmail(interaction: ChatInputCommandInteraction, user: any) {
  const email = interaction.options.getString('address', true);

  // 簡單的 Email 驗證
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    await interaction.reply({
      content: '❌ Email 格式不正確',
      ephemeral: true,
    });
    return;
  }

  await updateUserEmail(user.id, email);

  const embed = createInfoEmbed(
    '✅ Email 已更新',
    `你的 Email 已設定為：${email}\n\n你將會在以下情況收到 Email 通知：\n• 未來的信件送達時\n• 重要的系統通知`
  );

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleSetTimezone(interaction: ChatInputCommandInteraction, user: any) {
  const timezone = interaction.options.getString('zone', true);

  // 驗證時區（簡單驗證）
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
  } catch (error) {
    await interaction.reply({
      content: '❌ 無效的時區。請使用標準時區名稱，如：Asia/Taipei, America/New_York',
      ephemeral: true,
    });
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { timezone },
  });

  const embed = createInfoEmbed(
    '✅ 時區已更新',
    `你的時區已設定為：${timezone}\n\n這將影響：\n• 每日提醒時間\n• 情緒記錄的日期計算\n• 回顧報告的期間劃分`
  );

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleSetReminder(interaction: ChatInputCommandInteraction, user: any) {
  const enabled = interaction.options.getBoolean('enabled', true);
  const time = interaction.options.getString('time');

  let reminderTime = user.reminderTime;

  if (enabled && time) {
    // 驗證時間格式
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      await interaction.reply({
        content: '❌ 時間格式不正確。請使用 HH:MM 格式（如：20:00）',
        ephemeral: true,
      });
      return;
    }
    reminderTime = time;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { reminderTime: enabled ? reminderTime : user.reminderTime },
  });

  await prisma.userSettings.update({
    where: { userId: user.id },
    data: { dailyReminder: enabled },
  });

  const embed = createInfoEmbed(
    enabled ? '✅ 提醒已啟用' : '✅ 提醒已關閉',
    enabled
      ? `每日提醒時間：${reminderTime || '未設定（使用預設）'}\n\n我會在每天的這個時間提醒你記錄心情 🌟`
      : '你將不會再收到每日提醒'
  );

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
