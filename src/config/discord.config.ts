/**
 * Discord Configuration
 *
 * 管理 Discord Bot 的設定
 */

import { ActivityType, PresenceStatusData } from 'discord.js';

export const discordConfig = {
  // Bot Token
  token: process.env.DISCORD_TOKEN!,

  // Client ID
  clientId: process.env.DISCORD_CLIENT_ID!,

  // Guild ID（開發用）
  guildId: process.env.DISCORD_GUILD_ID,

  // Bot Presence
  presence: {
    activities: [
      {
        name: '記錄你的星球 🌍 | /paint',
        type: ActivityType.Custom,
      },
    ],
    status: 'online' as PresenceStatusData,
  },

  // 指令權限設定
  permissions: {
    // 所有指令的預設權限（無特殊限制）
    defaultMemberPermissions: null,

    // 是否可在 DM 中使用
    dmPermission: true,
  },

  // 互動回應設定
  interaction: {
    // 回應是否為 ephemeral（僅自己可見）
    ephemeral: {
      default: false,
      error: true, // 錯誤訊息僅自己可見
      settings: true, // 設定訊息僅自己可見
    },

    // 延遲回應時間限制（Discord 要求 3 秒內回應）
    deferTimeout: 2500, // 2.5 秒後自動 defer
  },
};

// 驗證必要的設定
export function validateDiscordConfig(): void {
  const required = ['DISCORD_TOKEN'];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}
