/**
 * Help Command - 幫助文檔
 */

import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Command } from '../types';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('❓ 查看 Mementia 的使用說明')
    .addStringOption((option) =>
      option
        .setName('category')
        .setDescription('選擇分類')
        .setRequired(false)
        .addChoices(
          { name: '🎨 情緒記錄', value: 'emotion' },
          { name: '✉️ 未來的信', value: 'letter' },
          { name: '📊 回顧報告', value: 'review' },
          { name: '👾 幸福挑戰', value: 'challenge' },
          { name: '⚙️ 設定與其他', value: 'settings' }
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const category = interaction.options.getString('category');

    if (!category) {
      await showMainHelp(interaction);
    } else {
      await showCategoryHelp(interaction, category);
    }
  },
} as Command;

async function showMainHelp(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#6366f1')
    .setTitle('🌟 歡迎來到 Mementia')
    .setDescription(
      '**"Where memories live."**\n\n' +
      'Mementia 是你的情緒宇宙，在這裡每一天的心情都會化為獨特的星球，' +
      '每一份回憶都值得被珍藏。\n\n' +
      '選擇下方的分類查看詳細說明，或使用 `/help <category>` 直接查看特定功能。'
    )
    .addFields(
      {
        name: '🎨 情緒記錄 (星球彩繪)',
        value:
          '每天記錄你的心情，AI 會為你創造獨特的星球\n' +
          '`/paint` `/view-planet` `/my-galaxy`',
        inline: false,
      },
      {
        name: '✉️ 未來的信 (光年之外)',
        value:
          '寫一封給未來的自己的信\n' +
          '`/write-letter` `/my-letters` `/open-letter`',
        inline: false,
      },
      {
        name: '📊 回顧報告 (星系團聚集)',
        value:
          '查看週/月/季/年的情緒回顧\n' +
          '`/review`',
        inline: false,
      },
      {
        name: '👾 幸福挑戰 (外星生命入侵)',
        value:
          '接受幸福挑戰，獲得星塵和徽章\n' +
          '`/challenges` `/complete-challenge` `/challenge-history`',
        inline: false,
      },
      {
        name: '⚙️ 設定與其他',
        value:
          '管理你的設定和查看統計\n' +
          '`/settings` `/stats` `/help`',
        inline: false,
      }
    )
    .addFields({
      name: '💡 小提示',
      value:
        '• 每天記錄心情可獲得 10 星塵\n' +
        '• 連續記錄 7 天可獲得特殊徽章\n' +
        '• 完成挑戰可獲得豐厚獎勵\n' +
        '• 記得設定提醒，不要錯過每一天！',
    })
    .setFooter({
      text: '使用 /help <category> 查看詳細說明',
    });

  await interaction.reply({ embeds: [embed] });
}

async function showCategoryHelp(interaction: ChatInputCommandInteraction, category: string) {
  const embeds: { [key: string]: EmbedBuilder } = {
    emotion: new EmbedBuilder()
      .setColor('#ec4899')
      .setTitle('🎨 情緒記錄 (星球彩繪)')
      .setDescription(
        '每天記錄你的心情，AI 會分析你的情緒並創造獨特的星球。\n' +
        '每個星球都有自己的顏色、編號和專屬音樂。'
      )
      .addFields(
        {
          name: '/paint',
          value:
            '開始今天的星球彩繪\n\n' +
            '**兩種記錄方式：**\n' +
            '• ✍️ 手動輸入：直接輸入心情分數(1-10)和內容\n' +
            '• 📋 貼上聊天記錄：AI 會分析你的對話並自動評分\n\n' +
            '**獎勵：**\n' +
            '• 10 星塵\n' +
            '• AI 生成的音樂推薦\n' +
            '• 情緒洞察和建議',
          inline: false,
        },
        {
          name: '/view-planet',
          value:
            '查看過去某一天的星球\n\n' +
            '輸入日期（YYYY-MM-DD）來查看那天的心情記錄',
          inline: false,
        },
        {
          name: '/my-galaxy',
          value:
            '查看整個月的星球集合\n\n' +
            '顯示月曆視圖，包含：\n' +
            '• 每天的心情分數\n' +
            '• 當月統計（平均分數、最高/最低）\n' +
            '• 記錄天數和連續記錄',
          inline: false,
        }
      )
      .setFooter({ text: '💡 每天只能記錄一次，珍惜每一天！' }),

    letter: new EmbedBuilder()
      .setColor('#8b5cf6')
      .setTitle('✉️ 未來的信 (光年之外)')
      .setDescription(
        '寫一封給未來的自己的信，在指定的時間收到。\n' +
        '這是一個時光膠囊，記錄現在的你想對未來說的話。'
      )
      .addFields(
        {
          name: '/write-letter',
          value:
            '寫一封給未來的信\n\n' +
            '**步驟：**\n' +
            '1. 選擇幾個月後送達（1-12個月）\n' +
            '2. 寫下你想說的話\n' +
            '3. 信件會被安全保存\n\n' +
            '**獎勵：**\n' +
            '• 寫信：20 星塵\n' +
            '• 開信：30 星塵\n' +
            '• 時光旅行者徽章',
          inline: false,
        },
        {
          name: '/my-letters',
          value:
            '查看你的所有信件\n\n' +
            '包含：\n' +
            '• 待送達的信件（未來）\n' +
            '• 已送達的信件（可開啟）\n' +
            '• 已開啟的信件',
          inline: false,
        },
        {
          name: '/open-letter',
          value:
            '開啟一封已送達的信\n\n' +
            '只有已經到達送達日期的信才能開啟\n' +
            '開信後獲得 30 星塵',
          inline: false,
        }
      )
      .setFooter({ text: '💡 如果設定了 Email，送達時會同時通知' }),

    review: new EmbedBuilder()
      .setColor('#6366f1')
      .setTitle('📊 回顧報告 (星系團聚集)')
      .setDescription(
        'AI 會定期為你生成情緒回顧報告，幫助你了解自己的情緒模式。'
      )
      .addFields(
        {
          name: '/review',
          value:
            '查看或生成回顧報告\n\n' +
            '**類型：**\n' +
            '• 📅 週回顧（50 星塵）\n' +
            '• 📆 月回顧（100 星塵）\n' +
            '• 📊 季回顧（200 星塵）\n' +
            '• 🎊 年回顧（500 星塵）\n\n' +
            '**包含內容：**\n' +
            '• AI 生成的總結\n' +
            '• 情緒趨勢分析（上升/下降/平穩）\n' +
            '• 重點時刻回顧\n' +
            '• 深度洞察和建議\n' +
            '• 詞雲分析',
          inline: false,
        },
        {
          name: '自動生成',
          value:
            '系統會在適當時間自動生成：\n' +
            '• 週回顧：每週一\n' +
            '• 月回顧：每月1號\n' +
            '• 季回顧：每季第一天\n' +
            '• 年回顧：每年1月1號\n\n' +
            '生成後會透過 Discord 通知你',
          inline: false,
        }
      ),

    challenge: new EmbedBuilder()
      .setColor('#f59e0b')
      .setTitle('👾 幸福挑戰 (外星生命入侵)')
      .setDescription(
        '接受各種幸福挑戰，完成後獲得星塵和徽章獎勵。\n' +
        '挑戰會幫助你培養積極的生活習慣。'
      )
      .addFields(
        {
          name: '/challenges',
          value:
            '查看你的活躍挑戰\n\n' +
            '顯示：\n' +
            '• 當前進行中的挑戰（最多3個）\n' +
            '• 挑戰統計資訊\n' +
            '• 接受新挑戰按鈕',
          inline: false,
        },
        {
          name: '/complete-challenge',
          value:
            '完成一個挑戰\n\n' +
            '**步驟：**\n' +
            '1. 輸入挑戰 ID（前8位即可）\n' +
            '2. 寫下完成證明（你的經驗和感受）\n' +
            '3. 獲得獎勵！\n\n' +
            '**注意：**\n' +
            '• 逾期完成獎勵減半\n' +
            '• 但逾期也能完成喔！',
          inline: false,
        },
        {
          name: '/challenge-history',
          value:
            '查看已完成的挑戰歷史\n\n' +
            '包含你的完成記錄和獲得的獎勵',
          inline: false,
        },
        {
          name: '難度等級',
          value:
            '⭐ 簡單（50-100 星塵）\n' +
            '⭐⭐ 中等（100-200 星塵）\n' +
            '⭐⭐⭐ 困難（200-300 星塵或特殊徽章）',
          inline: false,
        }
      )
      .setFooter({ text: '💡 每週一早上 9 點會自動分配新挑戰' }),

    settings: new EmbedBuilder()
      .setColor('#8b5cf6')
      .setTitle('⚙️ 設定與其他')
      .setDescription('管理你的個人設定和查看統計資訊')
      .addFields(
        {
          name: '/settings',
          value:
            '管理你的設定\n\n' +
            '**可設定項目：**\n' +
            '• `/settings view` - 查看當前設定\n' +
            '• `/settings email` - 設定 Email\n' +
            '• `/settings timezone` - 設定時區\n' +
            '• `/settings reminder` - 設定每日提醒',
          inline: false,
        },
        {
          name: '/stats',
          value:
            '查看你的統計資訊\n\n' +
            '包含：\n' +
            '• 等級和星塵\n' +
            '• 連續記錄天數\n' +
            '• 情緒統計\n' +
            '• 挑戰完成情況\n' +
            '• 信件統計\n' +
            '• 獲得的徽章',
          inline: false,
        },
        {
          name: '⭐ 星塵系統',
          value:
            '星塵是 Mementia 的貨幣，通過各種活動獲得：\n' +
            '• 記錄情緒：10 星塵\n' +
            '• 寫信：20 星塵\n' +
            '• 開信：30 星塵\n' +
            '• 完成挑戰：50-300 星塵\n' +
            '• 生成回顧：50-500 星塵',
          inline: false,
        },
        {
          name: '🏆 徽章系統',
          value:
            '完成特定成就可獲得徽章：\n' +
            '• 首次記錄、連續記錄\n' +
            '• 完成挑戰\n' +
            '• 寫信、開信\n' +
            '• 特殊節日\n' +
            '等等...',
          inline: false,
        }
      ),
  };

  const embed = embeds[category];
  if (!embed) {
    await interaction.reply({
      content: '❌ 找不到該分類',
      ephemeral: true,
    });
    return;
  }

  await interaction.reply({ embeds: [embed] });
}
