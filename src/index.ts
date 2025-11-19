/**
 * Mementia Discord Bot - Main Entry Point
 *
 * "Where memories live." - 在 Discord 上打造你的情緒宇宙
 */

import { Client, GatewayIntentBits, Events } from 'discord.js';
import dotenv from 'dotenv';
import { ExtendedClient } from './types';
import { log, logCommand } from './utils/logger';
import { validateAllConfigs, discordConfig } from './config';
import { connectDatabase, disconnectDatabase } from './config/prisma';
import { loadCommands, handleCommandInteraction } from './commands';
import {
  handleUnhandledRejection,
  handleUncaughtException,
  handleInteractionError,
} from './middlewares/error-handler';
import {
  handleButtonInteraction,
  handleModalSubmit,
} from './middlewares/interaction-handler';

// 載入環境變數
dotenv.config();

/**
 * 初始化應用程式
 */
async function initialize(): Promise<void> {
  try {
    // 驗證環境配置
    log.info('Validating configuration...');
    validateAllConfigs();
    log.info('✅ Configuration validated');

    // 連接資料庫
    log.info('Connecting to database...');
    await connectDatabase();
    log.info('✅ Database connected');

    log.info('✅ Initialization complete');
  } catch (error) {
    log.error('❌ Initialization failed:', error);
    process.exit(1);
  }
}

/**
 * 創建並設定 Discord Client
 */
function createClient(): ExtendedClient {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
    ],
  }) as ExtendedClient;

  return client;
}

/**
 * 設定事件監聽器
 */
function setupEventListeners(client: ExtendedClient): void {
  /**
   * Bot 就緒事件
   */
  client.once(Events.ClientReady, async (c) => {
    log.info('🌟 ================================');
    log.info('✨ Mementia Bot is online!');
    log.info(`🤖 Logged in as: ${c.user.tag}`);
    log.info(`🏰 Serving ${c.guilds.cache.size} guilds`);
    log.info('🌟 ================================');

    // 載入指令
    await loadCommands(client);

    // 設定 Bot 狀態
    c.user.setPresence(discordConfig.presence);

    log.info('✅ Bot is ready to serve!');
  });

  /**
   * 互動事件處理
   */
  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      // 處理斜線指令
      if (interaction.isChatInputCommand()) {
        logCommand(interaction.user.id, interaction.user.tag, interaction.commandName);
        await handleCommandInteraction(client, interaction);
      }

      // 處理按鈕互動
      if (interaction.isButton()) {
        log.debug(`Button clicked: ${interaction.customId} by ${interaction.user.tag}`);
        await handleButtonInteraction(interaction);
      }

      // TODO: 處理選單互動
      if (interaction.isStringSelectMenu()) {
        log.debug(`Select menu: ${interaction.customId} by ${interaction.user.tag}`);
      }

      // 處理 Modal 提交
      if (interaction.isModalSubmit()) {
        log.debug(`Modal submitted: ${interaction.customId} by ${interaction.user.tag}`);
        await handleModalSubmit(interaction);
      }
    } catch (error) {
      if (interaction.isChatInputCommand()) {
        await handleInteractionError(error, interaction);
      } else {
        log.error('Error handling interaction:', error);
      }
    }
  });

  /**
   * Discord Client 錯誤處理
   */
  client.on(Events.Error, (error) => {
    log.error('Discord Client Error:', error);
  });

  client.on(Events.Warn, (warning) => {
    log.warn('Discord Client Warning:', warning);
  });

  /**
   * 全域錯誤處理
   */
  process.on('unhandledRejection', handleUnhandledRejection);
  process.on('uncaughtException', handleUncaughtException);

  /**
   * 優雅關閉
   */
  const shutdown = async (signal: string) => {
    log.info(`\n🛑 Received ${signal}, shutting down gracefully...`);

    try {
      // 關閉 Discord 連線
      client.destroy();
      log.info('✅ Discord client destroyed');

      // 關閉資料庫連線
      await disconnectDatabase();

      log.info('✅ Graceful shutdown complete');
      process.exit(0);
    } catch (error) {
      log.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

/**
 * 啟動 Bot
 */
async function start(): Promise<void> {
  try {
    // 初始化
    await initialize();

    // 創建 Client
    const client = createClient();

    // 設定事件監聽器
    setupEventListeners(client);

    // 登入 Discord
    log.info('Logging in to Discord...');
    await client.login(discordConfig.token);
  } catch (error) {
    log.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

// 啟動應用程式
start();

