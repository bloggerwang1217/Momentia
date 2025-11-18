/**
 * Mementia Discord Bot - Main Entry Point
 *
 * "Where memories live." - 在 Discord 上打造你的情緒宇宙
 */

import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';

// 載入環境變數
dotenv.config();

// 驗證必要的環境變數
const requiredEnvVars = ['DISCORD_TOKEN', 'DATABASE_URL', 'OPENAI_API_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ 錯誤: 缺少必要的環境變數 ${envVar}`);
    console.error('請檢查你的 .env 檔案');
    process.exit(1);
  }
}

// 創建 Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

// TODO: 載入指令處理器
// client.commands = new Collection();
// const commandsPath = path.join(__dirname, 'commands');
// ... (指令載入邏輯)

/**
 * Bot 就緒事件
 */
client.once(Events.ClientReady, (c) => {
  console.log('🌟 ================================');
  console.log('✨ Mementia Bot is online!');
  console.log(`🤖 Logged in as: ${c.user.tag}`);
  console.log(`🏰 Serving ${c.guilds.cache.size} guilds`);
  console.log('🌟 ================================');

  // 設定 Bot 狀態
  c.user.setPresence({
    activities: [{ name: '記錄你的星球 🌍 | /paint' }],
    status: 'online',
  });
});

/**
 * 互動事件處理（斜線指令）
 */
client.on(Events.InteractionCreate, async (interaction) => {
  // 處理斜線指令
  if (interaction.isChatInputCommand()) {
    console.log(`📝 [Command] ${interaction.user.tag} used /${interaction.commandName}`);

    // TODO: 執行對應的指令處理器
    // const command = client.commands.get(interaction.commandName);
    // if (!command) return;
    // await command.execute(interaction);

    // 臨時回應（開發階段）
    await interaction.reply({
      content: '🚧 這個功能還在開發中！請稍候...',
      ephemeral: true,
    });
  }

  // 處理按鈕互動
  if (interaction.isButton()) {
    console.log(`🔘 [Button] ${interaction.user.tag} clicked ${interaction.customId}`);
    // TODO: 處理按鈕邏輯
  }

  // 處理選單互動
  if (interaction.isStringSelectMenu()) {
    console.log(`📋 [Select Menu] ${interaction.user.tag} selected from ${interaction.customId}`);
    // TODO: 處理選單邏輯
  }

  // 處理 Modal 提交
  if (interaction.isModalSubmit()) {
    console.log(`📝 [Modal] ${interaction.user.tag} submitted ${interaction.customId}`);
    // TODO: 處理 Modal 邏輯
  }
});

/**
 * 錯誤處理
 */
client.on(Events.Error, (error) => {
  console.error('❌ Discord Client Error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

/**
 * 優雅關閉
 */
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  client.destroy();
  // TODO: 關閉資料庫連線
  // await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  client.destroy();
  // TODO: 關閉資料庫連線
  // await prisma.$disconnect();
  process.exit(0);
});

/**
 * 登入 Discord
 */
client.login(process.env.DISCORD_TOKEN)
  .catch((error) => {
    console.error('❌ Failed to login to Discord:', error);
    process.exit(1);
  });

// 匯出 client（供其他模組使用）
export default client;
