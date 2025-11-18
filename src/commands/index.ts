/**
 * Command Handler
 *
 * 載入和管理所有 Discord 斜線指令
 */

import { Collection, REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { Command, ExtendedClient } from '../types';
import { log } from '../utils/logger';
import { discordConfig } from '../config';

/**
 * 載入所有指令
 */
export async function loadCommands(client: ExtendedClient): Promise<void> {
  client.commands = new Collection();

  const commandsPath = __dirname;
  const commandFiles = readdirSync(commandsPath).filter(
    (file) => (file.endsWith('.ts') || file.endsWith('.js')) && file !== 'index.ts' && file !== 'index.js'
  );

  log.info(`Loading ${commandFiles.length} commands...`);

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);

    try {
      const commandModule = await import(filePath);
      const command: Command = commandModule.default || commandModule;

      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        log.info(`✅ Loaded command: ${command.data.name}`);
      } else {
        log.warn(`⚠️  Command file ${file} is missing required "data" or "execute" property`);
      }
    } catch (error) {
      log.error(`❌ Failed to load command ${file}:`, error);
    }
  }

  log.info(`✅ Successfully loaded ${client.commands.size} commands`);
}

/**
 * 註冊指令到 Discord
 */
export async function registerCommands(client: ExtendedClient): Promise<void> {
  const commands = Array.from(client.commands.values()).map((command) => command.data.toJSON());

  const rest = new REST().setToken(discordConfig.token);

  try {
    log.info(`Started refreshing ${commands.length} application (/) commands.`);

    if (discordConfig.guildId) {
      // 開發環境：註冊到特定伺服器（立即生效）
      const data = await rest.put(
        Routes.applicationGuildCommands(discordConfig.clientId!, discordConfig.guildId),
        { body: commands }
      );

      log.info(`✅ Successfully registered ${(data as any[]).length} guild commands.`);
    } else {
      // 生產環境：註冊到全域（需要時間同步）
      const data = await rest.put(Routes.applicationCommands(discordConfig.clientId!), {
        body: commands,
      });

      log.info(`✅ Successfully registered ${(data as any[]).length} global commands.`);
      log.warn('⚠️  Global commands may take up to 1 hour to sync across all servers.');
    }
  } catch (error) {
    log.error('❌ Failed to register commands:', error);
    throw error;
  }
}

/**
 * 處理指令互動
 */
export async function handleCommandInteraction(
  client: ExtendedClient,
  interaction: any
): Promise<void> {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    log.warn(`Unknown command: ${interaction.commandName}`);
    await interaction.reply({
      content: '❌ 未知的指令！',
      ephemeral: true,
    });
    return;
  }

  try {
    log.info(`Executing command: ${interaction.commandName} by ${interaction.user.tag}`);
    await command.execute(interaction);
  } catch (error) {
    log.error(`Error executing command ${interaction.commandName}:`, error);

    const errorMessage = '❌ 執行指令時發生錯誤！';

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
}
