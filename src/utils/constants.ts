/**
 * Constants
 *
 * 應用程式常數定義
 */

// ============================================
// 情緒相關常數
// ============================================

/**
 * 情緒標籤對照表（根據分數）
 */
export const MOOD_LABELS = {
  1: '非常低落',
  2: '低落',
  3: '有些難過',
  4: '平淡',
  5: '還好',
  6: '平靜',
  7: '愉快',
  8: '開心',
  9: '非常開心',
  10: '超級快樂',
} as const;

/**
 * 情緒 Emoji 對照表
 */
export const MOOD_EMOJIS = {
  1: '😢',
  2: '😔',
  3: '😕',
  4: '😐',
  5: '🙂',
  6: '😌',
  7: '😊',
  8: '😄',
  9: '😁',
  10: '🌟',
} as const;

/**
 * 情緒分數範圍
 */
export const MOOD_RANGES = {
  LOW: { min: 1, max: 3, label: '低落', emoji: '😔' },
  NEUTRAL: { min: 4, max: 6, label: '平靜', emoji: '😌' },
  GOOD: { min: 7, max: 8, label: '開心', emoji: '😊' },
  EXCELLENT: { min: 9, max: 10, label: '非常快樂', emoji: '🌟' },
} as const;

// ============================================
// 獎勵系統常數
// ============================================

/**
 * 星塵獲得規則
 */
export const STARDUST_REWARDS = {
  DAILY_RECORD: 10,
  WEEK_STREAK: 50,
  MONTH_STREAK: 200,
  WRITE_LETTER: 30,
  VIEW_REVIEW: 5,
  LEVEL_UP: 100,
  CHALLENGE_EASY: 20,
  CHALLENGE_MEDIUM: 35,
  CHALLENGE_HARD: 50,
} as const;

/**
 * 星塵花費規則
 */
export const STARDUST_COSTS = {
  MONTHLY_REVIEW: 50,
  CUSTOM_REVIEW: 100,
  ANNUAL_REVIEW: 500,
  CUSTOM_PLANET_STYLE: 50,
  CUSTOM_COLOR: 30,
  REGENERATE_INSIGHT: 20,
  DEEP_ANALYSIS: 30,
  AI_ADVICE: 40,
} as const;

/**
 * 等級系統
 */
export const LEVELS = [
  { level: 1, name: '星際旅人', emoji: '🚀', requiredDays: 1, reward: 50 },
  { level: 2, name: '星球探索者', emoji: '🌏', requiredDays: 7, reward: 100 },
  { level: 3, name: '星系守護者', emoji: '🌌', requiredDays: 30, reward: 200 },
  { level: 4, name: '宇宙觀察家', emoji: '🔭', requiredDays: 100, reward: 500 },
  { level: 5, name: '時空記錄者', emoji: '⏳', requiredDays: 365, reward: 1000 },
] as const;

// ============================================
// 徽章系統常數
// ============================================

/**
 * 徽章定義
 */
export const BADGES = {
  // 記錄類
  FIRST_RECORD: {
    code: 'FIRST_RECORD',
    name: '初次記錄',
    description: '完成第一次情緒記錄',
    icon: '🌱',
    category: 'record',
  },
  WEEK_STREAK: {
    code: 'WEEK_STREAK',
    name: '堅持一週',
    description: '連續記錄 7 天',
    icon: '🌿',
    category: 'record',
  },
  MONTH_STREAK: {
    code: 'MONTH_STREAK',
    name: '月度記錄者',
    description: '連續記錄 30 天',
    icon: '🌳',
    category: 'record',
  },
  HUNDRED_DAYS: {
    code: 'HUNDRED_DAYS',
    name: '百日記錄',
    description: '連續記錄 100 天',
    icon: '🌲',
    category: 'record',
  },
  YEAR_GUARDIAN: {
    code: 'YEAR_GUARDIAN',
    name: '年度守護者',
    description: '連續記錄 365 天',
    icon: '🌍',
    category: 'record',
  },

  // 挑戰類
  FIRST_CHALLENGE: {
    code: 'FIRST_CHALLENGE',
    name: '挑戰新手',
    description: '完成第一個挑戰',
    icon: '🎯',
    category: 'challenge',
  },
  CHALLENGE_MASTER: {
    code: 'CHALLENGE_MASTER',
    name: '挑戰達人',
    description: '完成 10 個挑戰',
    icon: '🏆',
    category: 'challenge',
  },
  ALL_ROUND: {
    code: 'ALL_ROUND',
    name: '全面發展',
    description: '完成所有類型的挑戰',
    icon: '🌈',
    category: 'challenge',
  },

  // 探索類
  TIME_TRAVELER: {
    code: 'TIME_TRAVELER',
    name: '時光旅人',
    description: '寫下第一封未來信件',
    icon: '📮',
    category: 'explore',
  },
  REUNION: {
    code: 'REUNION',
    name: '重逢時刻',
    description: '開啟第一封信',
    icon: '📬',
    category: 'explore',
  },
  PLANET_ARTIST: {
    code: 'PLANET_ARTIST',
    name: '星球藝術家',
    description: '創造 50 個星球',
    icon: '🎨',
    category: 'explore',
  },

  // 特殊類
  COURAGE_HEART: {
    code: 'COURAGE_HEART',
    name: '勇氣之心',
    description: '在情緒分數 ≤3 時仍記錄',
    icon: '💎',
    category: 'special',
  },
  GROWTH_STAR: {
    code: 'GROWTH_STAR',
    name: '成長之星',
    description: '單月情緒進步最大（+3 分以上）',
    icon: '🌟',
    category: 'special',
  },
  NIGHT_GUARDIAN: {
    code: 'NIGHT_GUARDIAN',
    name: '夜空守護者',
    description: '在凌晨時段記錄',
    icon: '🌠',
    category: 'special',
  },
} as const;

// ============================================
// 挑戰系統常數
// ============================================

/**
 * 挑戰類別
 */
export const CHALLENGE_CATEGORIES = {
  SOCIAL: { name: '社交互動', emoji: '👥', color: '#FF6B6B' },
  SELF_CARE: { name: '自我照顧', emoji: '💆', color: '#4ECDC4' },
  CREATIVITY: { name: '創意表達', emoji: '🎨', color: '#FFE66D' },
  MINDFULNESS: { name: '正念覺察', emoji: '🧘', color: '#95E1D3' },
  ACTION: { name: '實際行動', emoji: '🏃', color: '#F38181' },
} as const;

/**
 * 挑戰難度
 */
export const CHALLENGE_DIFFICULTIES = {
  1: { name: '簡單', emoji: '⭐', color: '#A8E6CF' },
  2: { name: '中等', emoji: '⭐⭐', color: '#FFD3B6' },
  3: { name: '困難', emoji: '⭐⭐⭐', color: '#FFAAA5' },
} as const;

// ============================================
// 時間相關常數
// ============================================

/**
 * 時區列表（常用）
 */
export const COMMON_TIMEZONES = [
  { name: '台北', value: 'Asia/Taipei', offset: '+8' },
  { name: '東京', value: 'Asia/Tokyo', offset: '+9' },
  { name: '首爾', value: 'Asia/Seoul', offset: '+9' },
  { name: '香港', value: 'Asia/Hong_Kong', offset: '+8' },
  { name: '新加坡', value: 'Asia/Singapore', offset: '+8' },
  { name: '倫敦', value: 'Europe/London', offset: '+0' },
  { name: '紐約', value: 'America/New_York', offset: '-5' },
  { name: '洛杉磯', value: 'America/Los_Angeles', offset: '-8' },
] as const;

/**
 * 提醒時間選項
 */
export const REMINDER_TIME_OPTIONS = [
  { label: '早上 08:00', value: '08:00' },
  { label: '早上 09:00', value: '09:00' },
  { label: '晚上 20:00', value: '20:00' },
  { label: '晚上 21:00', value: '21:00' },
  { label: '晚上 22:00', value: '22:00' },
] as const;

// ============================================
// Discord 相關常數
// ============================================

/**
 * Embed 顏色
 */
export const EMBED_COLORS = {
  PRIMARY: 0x5865f2, // Discord Blurple
  SUCCESS: 0x57f287, // Green
  WARNING: 0xfee75c, // Yellow
  ERROR: 0xed4245, // Red
  INFO: 0x5865f2, // Blue
  NEUTRAL: 0x99aab5, // Gray
} as const;

/**
 * 最大長度限制
 */
export const MAX_LENGTHS = {
  DIARY_CONTENT: 2000,
  LETTER_CONTENT: 2000,
  CHALLENGE_PROOF: 500,
  USERNAME: 32,
  TAG_NAME: 20,
} as const;

// ============================================
// API 限制常數
// ============================================

/**
 * 速率限制
 */
export const RATE_LIMITS = {
  COMMANDS_PER_MINUTE: 10,
  AI_REQUESTS_PER_HOUR: 100,
} as const;
