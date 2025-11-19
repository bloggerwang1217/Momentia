/**
 * Interaction Handler
 *
 * 處理按鈕、選單和 Modal 互動
 */

import {
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalSubmitInteraction,
} from 'discord.js';
import { getOrCreateUser } from '../services/user.service';
import { createEmotionRecord, createEmotionFromChat } from '../services/emotion.service';
import { createPlanetEmbed, createSuccessEmbed, createErrorEmbed } from '../utils/embed-builder';
import { log } from '../utils/logger';
import { validateMood } from '../utils/validation';

/**
 * 處理按鈕互動
 */
export async function handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
  const { customId } = interaction;

  try {
    // Paint 指令相關按鈕
    if (customId === 'paint_manual') {
      await handlePaintManual(interaction);
    } else if (customId === 'paint_chat') {
      await handlePaintChat(interaction);
    }
  } catch (error) {
    log.error('Error handling button interaction:', error);
    await interaction.reply({
      content: '❌ 發生錯誤，請稍後再試。',
      ephemeral: true,
    });
  }
}

/**
 * 處理 Modal 提交
 */
export async function handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
  const { customId } = interaction;

  try {
    if (customId === 'paint_manual_modal') {
      await handlePaintManualSubmit(interaction);
    } else if (customId === 'paint_chat_modal') {
      await handlePaintChatSubmit(interaction);
    }
  } catch (error) {
    log.error('Error handling modal submit:', error);
    await interaction.reply({
      content: '❌ 發生錯誤，請稍後再試。',
      ephemeral: true,
    });
  }
}

/**
 * 處理手動輸入按鈕
 */
async function handlePaintManual(interaction: ButtonInteraction): Promise<void> {
  const modal = new ModalBuilder()
    .setCustomId('paint_manual_modal')
    .setTitle('🎨 星球彩繪 - 手動輸入');

  const moodInput = new TextInputBuilder()
    .setCustomId('mood')
    .setLabel('今天的心情分數 (1-10)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('輸入 1-10 的數字')
    .setRequired(true)
    .setMinLength(1)
    .setMaxLength(2);

  const contentInput = new TextInputBuilder()
    .setCustomId('content')
    .setLabel('今天發生了什麼？')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('分享你今天的心情和想法...')
    .setRequired(true)
    .setMinLength(10)
    .setMaxLength(2000);

  const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(moodInput);
  const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(contentInput);

  modal.addComponents(row1, row2);

  await interaction.showModal(modal);
}

/**
 * 處理貼上聊天記錄按鈕
 */
async function handlePaintChat(interaction: ButtonInteraction): Promise<void> {
  const modal = new ModalBuilder()
    .setCustomId('paint_chat_modal')
    .setTitle('🎨 星球彩繪 - 聊天記錄分析');

  const chatInput = new TextInputBuilder()
    .setCustomId('chat_content')
    .setLabel('貼上你的聊天記錄')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder(
      '可以是你和朋友、ChatGPT、Claude 的對話，或是你的日記片段...'
    )
    .setRequired(true)
    .setMinLength(50)
    .setMaxLength(2000);

  const row = new ActionRowBuilder<TextInputBuilder>().addComponents(chatInput);

  modal.addComponents(row);

  await interaction.showModal(modal);
}

/**
 * 處理手動輸入 Modal 提交
 */
async function handlePaintManualSubmit(
  interaction: ModalSubmitInteraction
): Promise<void> {
  await interaction.deferReply();

  const moodStr = interaction.fields.getTextInputValue('mood');
  const content = interaction.fields.getTextInputValue('content');

  // 驗證心情分數
  const mood = parseInt(moodStr, 10);
  const validation = validateMood(mood);

  if (!validation.valid) {
    await interaction.editReply({
      content: `❌ ${validation.error || '心情分數必須是 1-10 的整數'}`,
    });
    return;
  }

  try {
    // 取得使用者
    const user = await getOrCreateUser(interaction.user.id, interaction.user.username);

    // 創建情緒記錄
    await interaction.editReply({
      content: '🎨 正在創作你的星球...\n✨ AI 正在分析你的情緒...',
    });

    const emotion = await createEmotionRecord(user.id, mood, content, user.timezone);

    // 顯示結果
    const embed = createPlanetEmbed({
      planetId: emotion.planetId || '#???',
      mood: emotion.mood,
      moodLabel: emotion.moodLabel,
      color: emotion.color || undefined,
      songName: emotion.songName || undefined,
      songUrl: emotion.songUrl || undefined,
      aiInsight: emotion.aiInsight || undefined,
      date: emotion.date,
    });

    // 添加獲得的星塵
    embed.setFooter({
      text: `已獲得 10 星塵 ⭐ | ${embed.data.footer?.text || 'Mementia'}`,
    });

    await interaction.editReply({
      content: '🎉 你的星球創作完成了！',
      embeds: [embed],
    });

    log.info(`User ${user.id} created planet via manual input`);
  } catch (error) {
    log.error('Error creating emotion from manual input:', error);
    await interaction.editReply({
      content: '❌ 創建星球時發生錯誤，請稍後再試。',
    });
  }
}

/**
 * 處理聊天記錄 Modal 提交
 */
async function handlePaintChatSubmit(
  interaction: ModalSubmitInteraction
): Promise<void> {
  await interaction.deferReply();

  const chatContent = interaction.fields.getTextInputValue('chat_content');

  try {
    // 取得使用者
    const user = await getOrCreateUser(interaction.user.id, interaction.user.username);

    // 分析聊天記錄並創建記錄
    await interaction.editReply({
      content:
        '🎨 正在分析你的聊天記錄...\n✨ AI 正在識別情緒變化...\n\n這可能需要一點時間...',
    });

    const emotions = await createEmotionFromChat(user.id, chatContent, user.timezone);

    if (emotions.length === 0) {
      await interaction.editReply({
        content: '❌ 無法從聊天記錄中分析出情緒，請嘗試手動輸入。',
      });
      return;
    }

    // 顯示結果（通常只有一個）
    const emotion = emotions[0];

    const embed = createPlanetEmbed({
      planetId: emotion.planetId || '#???',
      mood: emotion.mood,
      moodLabel: emotion.moodLabel,
      color: emotion.color || undefined,
      songName: emotion.songName || undefined,
      songUrl: emotion.songUrl || undefined,
      aiInsight: emotion.aiInsight || undefined,
      date: emotion.date,
    });

    embed.setFooter({
      text: `已獲得 10 星塵 ⭐ | ${embed.data.footer?.text || 'Mementia'}`,
    });

    await interaction.editReply({
      content: '🎉 從你的對話中創造了今日星球！',
      embeds: [embed],
    });

    log.info(`User ${user.id} created planet via chat analysis`);
  } catch (error) {
    log.error('Error creating emotion from chat:', error);
    await interaction.editReply({
      content: '❌ 分析聊天記錄時發生錯誤，請稍後再試。',
    });
  }
}
