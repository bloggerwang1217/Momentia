/**
 * Discord 斜線指令部署腳本
 *
 * 使用方式：npm run deploy-commands
 */

import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';

// 載入環境變數
dotenv.config();

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  console.error('❌ 錯誤: 缺少 DISCORD_TOKEN 或 DISCORD_CLIENT_ID');
  process.exit(1);
}

/**
 * 定義所有斜線指令
 */
const commands = [
  // ============================================
  // 星球彩繪 (Daily Emotion Log)
  // ============================================
  new SlashCommandBuilder()
    .setName('paint')
    .setDescription('🎨 開始今天的星球彩繪，記錄你的心情'),

  new SlashCommandBuilder()
    .setName('view-planet')
    .setDescription('🔍 查看特定日期的星球')
    .addStringOption(option =>
      option
        .setName('date')
        .setDescription('日期（格式：YYYY-MM-DD）')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('my-galaxy')
    .setDescription('🌌 查看我的星球圖譜（月曆視圖）')
    .addStringOption(option =>
      option
        .setName('month')
        .setDescription('月份（格式：YYYY-MM，預設為本月）')
        .setRequired(false)
    ),

  // ============================================
  // 來自光年之外 (Future Letter)
  // ============================================
  new SlashCommandBuilder()
    .setName('write-letter')
    .setDescription('✉️ 寫一封給未來的信'),

  new SlashCommandBuilder()
    .setName('my-letters')
    .setDescription('📬 查看我的信箱（待送達/已開封）'),

  new SlashCommandBuilder()
    .setName('open-letter')
    .setDescription('📭 打開已送達的信')
    .addStringOption(option =>
      option
        .setName('id')
        .setDescription('信件 ID')
        .setRequired(true)
    ),

  // ============================================
  // 本星系團聚集 (Periodic Review)
  // ============================================
  new SlashCommandBuilder()
    .setName('review')
    .setDescription('📊 查看回顧報告')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('回顧類型')
        .setRequired(true)
        .addChoices(
          { name: '📅 本週回顧', value: 'weekly' },
          { name: '📆 本月回顧', value: 'monthly' },
          { name: '📈 季度回顧', value: 'quarterly' },
          { name: '🎊 年度回顧', value: 'yearly' }
        )
    ),

  // ============================================
  // 外星生命入侵 (Happiness Challenge)
  // ============================================
  new SlashCommandBuilder()
    .setName('challenges')
    .setDescription('🛸 查看當前的幸福挑戰'),

  new SlashCommandBuilder()
    .setName('complete-challenge')
    .setDescription('✅ 完成挑戰')
    .addStringOption(option =>
      option
        .setName('id')
        .setDescription('挑戰 ID')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('challenge-history')
    .setDescription('📜 查看挑戰歷史記錄'),

  // ============================================
  // 設定與其他
  // ============================================
  new SlashCommandBuilder()
    .setName('settings')
    .setDescription('⚙️ 設定 Mementia'),

  new SlashCommandBuilder()
    .setName('stats')
    .setDescription('📈 查看我的統計數據'),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('❓ 查看使用說明'),

].map(command => command.toJSON());

/**
 * 註冊指令
 */
const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log('🔄 開始註冊斜線指令...');
    console.log(`📝 共 ${commands.length} 個指令`);

    // 如果有指定 GUILD_ID，則只註冊到該伺服器（開發用，立即生效）
    if (DISCORD_GUILD_ID) {
      console.log(`🏰 註冊到伺服器: ${DISCORD_GUILD_ID}`);

      const data = await rest.put(
        Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
        { body: commands }
      ) as any[];

      console.log(`✅ 成功註冊 ${data.length} 個指令到伺服器`);
    }
    // 否則註冊到全域（生產用，需要 1 小時生效）
    else {
      console.log('🌍 註冊到全域（需要約 1 小時生效）');

      const data = await rest.put(
        Routes.applicationCommands(DISCORD_CLIENT_ID),
        { body: commands }
      ) as any[];

      console.log(`✅ 成功註冊 ${data.length} 個全域指令`);
    }

    console.log('🎉 指令註冊完成！');

  } catch (error) {
    console.error('❌ 註冊指令時發生錯誤:', error);
    process.exit(1);
  }
})();
