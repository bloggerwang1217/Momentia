/**
 * TypeScript Type Definitions
 *
 * 全域型別定義
 */

import { ChatInputCommandInteraction, SlashCommandBuilder, Collection } from 'discord.js';
import { Client as DiscordClient } from 'discord.js';

// ============================================
// Discord 相關型別
// ============================================

/**
 * 擴展 Discord Client 以支援指令集合
 */
export interface ExtendedClient extends DiscordClient {
  commands: Collection<string, Command>;
}

/**
 * 指令介面
 */
export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

// ============================================
// AI 相關型別
// ============================================

/**
 * AI Provider
 */
export type AIProvider = 'openai' | 'anthropic';

/**
 * AI 請求選項
 */
export interface AIRequestOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

/**
 * AI 回應
 */
export interface AIResponse {
  content: string;
  tokensUsed?: {
    input: number;
    output: number;
    cached?: number;
  };
  cost?: number;
  model: string;
}

/**
 * 情緒分析結果
 */
export interface EmotionAnalysis {
  mood: number; // 1-10
  moodLabel: string; // 情緒標籤
  aiInsight: string; // AI 洞察
  color?: string; // 星球顏色
  tags?: string[]; // 情緒標籤
}

/**
 * 歌曲推薦結果
 */
export interface SongRecommendation {
  songName: string;
  artist: string;
  url?: string;
  reason: string;
}

/**
 * 聊天記錄分析結果
 */
export interface ChatAnalysisResult {
  segments: ChatSegment[];
  overallMood: number;
  summary: string;
}

/**
 * 聊天片段
 */
export interface ChatSegment {
  time?: string; // 時間（可選）
  mood: number; // 情緒分數
  moodLabel: string; // 情緒標籤
  content: string; // 內容摘要
  keyEvent: string; // 關鍵事件
}

// ============================================
// 回顧相關型別
// ============================================

/**
 * 回顧統計資料
 */
export interface ReviewStats {
  averageMood: number;
  totalRecords: number;
  highestMood: { date: Date; mood: number };
  lowestMood: { date: Date; mood: number };
  moodTrend: number[]; // 情緒趨勢數組
  topTags: { tag: string; count: number }[];
}

/**
 * 回顧生成選項
 */
export interface ReviewGenerateOptions {
  userId: string;
  type: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate: Date;
  endDate: Date;
}

// ============================================
// 挑戰相關型別
// ============================================

/**
 * 挑戰類別
 */
export type ChallengeCategory =
  | 'social'
  | 'self-care'
  | 'creativity'
  | 'mindfulness'
  | 'action';

/**
 * 挑戰難度
 */
export type ChallengeDifficulty = 1 | 2 | 3;

/**
 * 獎勵類型
 */
export interface Reward {
  type: 'stardust' | 'badge';
  value: number | string;
}

// ============================================
// 使用者相關型別
// ============================================

/**
 * 使用者初始化選項
 */
export interface UserInitOptions {
  discordId: string;
  username: string;
  timezone?: string;
  reminderTime?: string;
}

/**
 * 使用者統計資料
 */
export interface UserStats {
  level: number;
  stardust: number;
  totalRecords: number;
  badges: number;
  currentStreak: number;
  longestStreak: number;
}

// ============================================
// 徽章相關型別
// ============================================

/**
 * 徽章類別
 */
export type BadgeCategory = 'record' | 'challenge' | 'explore' | 'special';

/**
 * 徽章資訊
 */
export interface BadgeInfo {
  code: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
}

// ============================================
// 錯誤相關型別
// ============================================

/**
 * 應用錯誤
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 驗證錯誤
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, true);
  }
}

/**
 * 資料庫錯誤
 */
export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 500, true);
  }
}

/**
 * AI 服務錯誤
 */
export class AIServiceError extends AppError {
  constructor(message: string) {
    super(message, 503, true);
  }
}
