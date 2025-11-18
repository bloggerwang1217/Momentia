# Mementia Discord Bot - 完整實作計畫

> "Where memories live." - 在 Discord 上打造你的情緒宇宙

## 📋 目錄

- [技術選型](#技術選型)
- [系統架構](#系統架構)
- [資料庫設計](#資料庫設計)
- [核心功能模組](#核心功能模組)
- [專案結構](#專案結構)
- [開發路線圖](#開發路線圖)
- [環境設定](#環境設定)

---

## 🎯 技術選型

### 開發語言：TypeScript

**選擇理由：**
1. **類型安全**：複雜的業務邏輯需要強型別保護，減少執行期錯誤
2. **生態系統成熟**：Discord.js 是最完善的 Discord bot 框架
3. **LLM 整合便利**：OpenAI SDK、Anthropic SDK 都有優秀的 TypeScript 支援
4. **長期維護性**：TypeScript 的可讀性和可維護性優於 JavaScript
5. **團隊協作**：型別定義可作為文檔，降低溝通成本

### 技術棧

| 層級 | 技術選型 | 版本 | 用途 |
|------|---------|------|------|
| **運行環境** | Node.js | 20.x LTS | JavaScript 運行環境 |
| **開發語言** | TypeScript | 5.x | 主要開發語言 |
| **Discord 框架** | discord.js | 14.x | Discord Bot 開發框架 |
| **ORM** | Prisma | 5.x | PostgreSQL ORM，型別安全的資料庫操作 |
| **資料庫** | PostgreSQL | 16.x | 主資料庫 |
| **LLM SDK** | OpenAI SDK | 4.x | GPT-4o 系列 AI 模型 |
| **LLM SDK** | Anthropic SDK | 0.x | Claude Haiku 4.5 AI 模型 |
| **Email 服務** | Resend | 2.x | 信件送達的 Email 通知 |
| **任務排程** | node-cron | 3.x | 定時任務（每日提醒、週期回顧） |
| **環境變數** | dotenv | 16.x | 環境配置管理 |
| **日誌系統** | winston | 3.x | 結構化日誌記錄 |
| **驗證** | zod | 3.x | 運行時型別驗證 |
| **日期處理** | date-fns | 3.x | 日期時間處理 |

### AI 模型策略

**多模型混合使用**，針對不同場景選擇最適合的模型：

| 場景 | 推薦模型 | 理由 |
|------|---------|------|
| 日常情緒記錄分析 | GPT-5.1 Mini | 同理心高、超便宜、遵守指令 |
| 聊天記錄分析 | Claude Haiku 4.5 | 處理長文本能力強 |
| 歌曲推薦 | GPT-5.1 Mini | 快速且精準、成本最低 |
| 挑戰建議 | GPT-5.1 Mini | 創意與實用兼具 |
| 週期回顧報告 | GPT-5.1 | 同理心高、情緒價值好、遵守指令 |
| 年度總結 | Claude Sonnet 4.5 或 GPT-5.1 | Sonnet：真誠直接；GPT-5.1：同理心高 |

#### 價格比較（2024年12月最新）

| 模型 | Input | Output | Cached Input | 典型成本* | 特色 |
|------|-------|--------|--------------|----------|------|
| **GPT-5.1 Mini** ⭐ | $0.25/M | $2.00/M | $0.025/M | **$0.00125** | 💰 超值首選 |
| **GPT-4o-mini** | $0.15/M | $0.60/M | - | $0.00045 | 💸 最便宜 |
| **GPT-5.1** 🔥 | $1.25/M | $10.00/M | $0.125/M | **$0.00625** | ❤️ 同理心高、新 |
| **Claude Haiku 4.5** | $1.00/M | $5.00/M | - | $0.0035 | ✨ 聰明真誠 |
| GPT-4o | $2.50/M | $10.00/M | - | $0.0075 | 💎 前代旗艦 |
| **Claude Sonnet 4.5** | $3.00/M | $15.00/M | - | **$0.0105** | 🧠 真誠直接 |

*典型對話成本：1000 input + 500 output tokens（不含 cache）

#### 💡 Cached Input 優勢（GPT-5.1 系列獨有）

GPT-5.1 系列支援 **Cached Input**，對於系統 prompt 和重複內容可省 **90% 成本**！

**範例**：如果系統 prompt 有 2000 tokens，每次對話重複使用：
```
傳統模型：每次都要付 2000 tokens input 費用
GPT-5.1：第一次 $1.25/M，之後 $0.125/M（省 90%）
GPT-5.1 Mini：第一次 $0.25/M，之後 $0.025/M（省 90%）
```

**實際成本**（含 2000 tokens cached system prompt）：
- GPT-5.1 Mini: $0.00005 + $0.00025 + $0.001 = **$0.0013** ✨
- GPT-5.1: $0.00025 + $0.00125 + $0.005 = **$0.00650** 🔥

#### 🎯 推薦策略

**成本估算**：每位使用者每月約 100 次互動，平均成本：
- **推薦方案**（GPT-5.1 Mini + GPT-5.1 混合）：約 **$0.15/月** ⭐
- 純 GPT-5.1 Mini：約 **$0.13/月**
- Claude Haiku 4.5 為主：約 **$0.35/月**
- 全用 Claude Sonnet 4.5：約 **$1.05/月**

**結論**：GPT-5.1 系列性價比最高，同理心強且遵守指令，是情緒陪伴的最佳選擇！

---

## 🏗️ 系統架構

### 整體架構圖

```
┌─────────────────────────────────────────────────────────────────┐
│                         Discord Platform                         │
│                    (User Interface Layer)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Discord Gateway
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      Mementia Bot Core                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Command Handler (Slash Commands)             │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────┬──────────────┬──────────────┬─────────────┐  │
│  │  星球彩繪      │ 光年之外      │  星系團聚集   │  外星入侵    │  │
│  │  (Daily Log) │(Future Letter)│  (Review)   │ (Challenge) │  │
│  └──────┬───────┴──────┬───────┴──────┬───────┴──────┬──────┘  │
│         │              │              │              │          │
│  ┌──────▼──────────────▼──────────────▼──────────────▼──────┐  │
│  │              Business Logic Layer                         │  │
│  │  ┌──────────┬──────────┬──────────┬──────────────────┐   │  │
│  │  │ Emotion  │ Memory   │  Review  │   Challenge      │   │  │
│  │  │ Service  │ Service  │  Service │   Service        │   │  │
│  │  └──────────┴──────────┴──────────┴──────────────────┘   │  │
│  └────────────────────────┬──────────────────────────────────┘  │
│                            │                                     │
│  ┌────────────────────────▼──────────────────────────────────┐  │
│  │                  AI Integration Layer                      │  │
│  │  ┌──────────┬──────────┬──────────┬──────────────────┐   │  │
│  │  │ LLM      │ Song     │ Sentiment│   Summary        │   │  │
│  │  │ Service  │ Recommend│ Analysis │   Generator      │   │  │
│  │  └──────────┴──────────┴──────────┴──────────────────┘   │  │
│  └────────────────────────┬──────────────────────────────────┘  │
│                            │                                     │
│  ┌────────────────────────▼──────────────────────────────────┐  │
│  │                  Data Access Layer                         │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │              Prisma ORM Client                        │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └────────────────────────┬──────────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                     PostgreSQL Database                           │
│  ┌─────────┬──────────┬──────────┬───────────┬──────────────┐   │
│  │  Users  │ Emotions │ Memories │  Reviews  │  Challenges  │   │
│  └─────────┴──────────┴──────────┴───────────┴──────────────┘   │
└───────────────────────────────────────────────────────────────────┘

        ┌──────────────────────────────────────┐
        │    External Services                  │
        │  ┌──────────┬──────────────────────┐ │
        │  │ OpenAI   │  Resend Email API    │ │
        │  │   API    │  (Letter Delivery)   │ │
        │  └──────────┴──────────────────────┘ │
        └──────────────────────────────────────┘
```

### 核心設計原則

1. **分層架構**：清晰的職責分離，便於測試和維護
2. **依賴注入**：降低模組間耦合度
3. **錯誤處理**：統一的錯誤處理機制
4. **日誌系統**：完整的操作追蹤
5. **可擴展性**：模組化設計，便於新增功能

---

## 🗄️ 資料庫設計

### ER 圖概念

```
┌─────────────┐
│    User     │
│─────────────│
│ id          │◄──────┐
│ discord_id  │       │
│ username    │       │
│ created_at  │       │
└─────────────┘       │
                      │
      ┌───────────────┼───────────────┬───────────────┐
      │               │               │               │
      │               │               │               │
┌─────▼─────┐  ┌──────▼──────┐  ┌────▼──────┐  ┌────▼──────┐
│  Emotion  │  │FutureLetter │  │  Review   │  │ Challenge │
│───────────│  │─────────────│  │───────────│  │───────────│
│ id        │  │ id          │  │ id        │  │ id        │
│ user_id   │  │ user_id     │  │ user_id   │  │ user_id   │
│ date      │  │ content     │  │ type      │  │ type      │
│ mood      │  │ send_date   │  │ period    │  │ completed │
│ content   │  │ deliver_date│  │ content   │  │ reward    │
│ song_url  │  │ opened      │  │ created_at│  │ due_date  │
│ color     │  │ created_at  │  └───────────┘  └───────────┘
│ planet_id │  └─────────────┘
│ created_at│
└───────────┘
      │
      │
┌─────▼─────┐
│   Tag     │
│───────────│
│ id        │
│ emotion_id│
│ name      │
└───────────┘
```

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 使用者資料表
model User {
  id            String         @id @default(uuid())
  discordId     String         @unique @map("discord_id")
  username      String
  email         String?        // Email 地址（用於未來信件通知，可選）
  timezone      String         @default("Asia/Taipei")
  reminderTime  String?        @map("reminder_time") // 每日提醒時間 (HH:mm)

  // 獎勵系統
  stardust      Int            @default(0) // 星塵餘額
  level         Int            @default(1) // 當前等級
  totalRecords  Int            @default(0) @map("total_records") // 總記錄天數

  createdAt     DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime       @updatedAt @map("updated_at")

  // 關聯
  emotions           Emotion[]
  futureLetters      FutureLetter[]
  reviews            Review[]
  challenges         UserChallenge[]
  settings           UserSettings?
  stardustTransactions StardustTransaction[]
  userBadges         UserBadge[]

  @@map("users")
}

// 使用者設定
model UserSettings {
  id                String   @id @default(uuid())
  userId            String   @unique @map("user_id")
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  dailyReminder     Boolean  @default(true) @map("daily_reminder")
  weeklyReview      Boolean  @default(true) @map("weekly_review")
  monthlyReview     Boolean  @default(true) @map("monthly_review")
  challengeEnabled  Boolean  @default(true) @map("challenge_enabled")

  language          String   @default("zh-TW")

  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  @@map("user_settings")
}

// 情緒日記 (星球彩繪)
model Emotion {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  date        DateTime @default(now())
  mood        Int      // 1-10 情緒分數
  moodLabel   String   @map("mood_label") // 情緒標籤 (開心、平靜、焦慮等)
  content     String   @db.Text // 日記內容

  // AI 生成內容
  songUrl     String?  @map("song_url")
  songName    String?  @map("song_name")
  color       String?  // 星球顏色 (hex code)
  planetId    String?  @map("planet_id") // 星球編號
  aiInsight   String?  @db.Text @map("ai_insight") // AI 洞察

  // 元數據
  wordCount   Int      @default(0) @map("word_count")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // 關聯
  tags        EmotionTag[]

  @@index([userId, date])
  @@map("emotions")
}

// 情緒標籤
model EmotionTag {
  id        String   @id @default(uuid())
  emotionId String   @map("emotion_id")
  emotion   Emotion  @relation(fields: [emotionId], references: [id], onDelete: Cascade)

  name      String   // 標籤名稱

  createdAt DateTime @default(now()) @map("created_at")

  @@index([emotionId])
  @@map("emotion_tags")
}

// 給未來的信 (光年之外)
model FutureLetter {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  content      String   @db.Text
  sendDate     DateTime @map("send_date") // 寫信日期
  deliverDate  DateTime @map("deliver_date") // 預計送達日期

  opened       Boolean  @default(false)
  openedAt     DateTime? @map("opened_at")

  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@index([userId, deliverDate])
  @@map("future_letters")
}

// 回顧報告 (星系團聚集)
model Review {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  type        ReviewType // WEEKLY, MONTHLY, QUARTERLY, YEARLY
  period      String   // 期間標識 (e.g., "2024-W12", "2024-06")
  startDate   DateTime @map("start_date")
  endDate     DateTime @map("end_date")

  // AI 生成的回顧內容
  summary     String   @db.Text
  highlights  Json     // 重點時刻 []
  insights    String   @db.Text // 深度洞察
  moodTrend   Json     @map("mood_trend") // 情緒趨勢數據
  wordCloud   Json?    @map("word_cloud") // 詞雲數據

  createdAt   DateTime @default(now()) @map("created_at")

  @@index([userId, type, period])
  @@map("reviews")
}

enum ReviewType {
  WEEKLY
  MONTHLY
  QUARTERLY
  YEARLY
}

// 幸福挑戰 (外星生命入侵)
model Challenge {
  id          String   @id @default(uuid())

  title       String
  description String   @db.Text
  category    String   // 分類 (social, self-care, creativity, etc.)
  difficulty  Int      @default(1) // 1-3
  reward      Json     // 獎勵內容 {type, value}

  isActive    Boolean  @default(true) @map("is_active")

  createdAt   DateTime @default(now()) @map("created_at")

  // 關聯
  userChallenges UserChallenge[]

  @@map("challenges")
}

// 使用者挑戰紀錄
model UserChallenge {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  challengeId String   @map("challenge_id")
  challenge   Challenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)

  assignedAt  DateTime @default(now()) @map("assigned_at")
  dueDate     DateTime @map("due_date")

  completed   Boolean  @default(false)
  completedAt DateTime? @map("completed_at")
  proof       String?  @db.Text // 完成證明 (文字描述)

  rewardClaimed Boolean @default(false) @map("reward_claimed")

  @@index([userId, completed])
  @@map("user_challenges")
}

// 系統日誌 (可選)
model ActivityLog {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  action    String   // 動作類型
  details   Json?    // 詳細資料
  createdAt DateTime @default(now()) @map("created_at")

  @@index([userId, createdAt])
  @@map("activity_logs")
}

// ============================================
// 獎勵系統
// ============================================

// 星塵交易記錄
model StardustTransaction {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  amount    Int      // 正數為獲得，負數為花費
  reason    String   // 原因
  createdAt DateTime @default(now()) @map("created_at")

  @@index([userId, createdAt])
  @@map("stardust_transactions")
}

// 徽章定義
model Badge {
  id          String   @id @default(uuid())
  code        String   @unique // 徽章代碼（FIRST_RECORD, WEEK_STREAK 等）
  name        String   // 徽章名稱
  description String   // 徽章描述
  icon        String   // Emoji 圖示
  category    String   // 類別（record, challenge, explore, special）

  createdAt   DateTime @default(now()) @map("created_at")

  // 關聯
  userBadges  UserBadge[]

  @@map("badges")
}

// 使用者徽章
model UserBadge {
  id       String   @id @default(uuid())
  userId   String   @map("user_id")
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  badgeId  String   @map("badge_id")
  badge    Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)

  earnedAt DateTime @default(now()) @map("earned_at")

  @@unique([userId, badgeId])
  @@index([userId])
  @@map("user_badges")
}
```

---

## 🎨 核心功能模組

### 1. 星球彩繪 (Daily Emotion Log)

**功能描述：** 每日情緒日記，記錄心情並獲得 AI 推薦的歌曲。

**Discord 指令：**
- `/paint` - 開始今天的星球彩繪
- `/view-planet [日期]` - 查看特定日期的星球
- `/my-galaxy` - 查看我的星球圖譜（月曆視圖）

**互動流程 A：手動輸入**
```
User: /paint
Bot: 🌟 歡迎來到今天的星球！今天你想用什麼顏色彩繪它呢？

     你想怎麼記錄今天的心情？
     [✍️ 手動輸入] [📋 貼上聊天記錄]

User: [選擇 手動輸入]
Bot: 請告訴我你今天的心情（1-10分）：
     1-3: 低落 😔
     4-6: 平靜 😌
     7-8: 開心 😊
     9-10: 非常快樂 🌟

User: 7
Bot: 很好！你今天心情不錯 😊
     可以分享一下今天發生了什麼事嗎？
     (或輸入 /skip 跳過)

User: 今天完成了一個重要專案，同事們都很滿意...
Bot: 🎨 你的星球正在成形...

     ✨ 今日星球 #127
     顏色: 溫暖的橙黃色 🟡
     情緒: 成就感與喜悅

     🎵 為你推薦的歌曲：
     《Lovely Day》- Bill Withers
     🔗 [播放連結]

     💭 AI 洞察：
     你今天展現了出色的執行力和團隊合作精神。
     這種成就感來自於你的努力和他人的認可，
     記得為自己感到驕傲！

     已記錄到你的星系圖譜 ⭐
```

**互動流程 B：聊天記錄分析**
```
User: /paint
Bot: 🌟 歡迎來到今天的星球！

     你想怎麼記錄今天的心情？
     [✍️ 手動輸入] [📋 貼上聊天記錄]

User: [選擇 貼上聊天記錄]
Bot: 請貼上你的聊天記錄：
     （可以是你和朋友、ChatGPT、Claude 的對話，
     　或是你的日記片段）

User: [貼上大段聊天記錄]
     早上和朋友聊天說工作壓力很大...
     下午跟 ChatGPT 討論了一些想法...
     晚上跟家人視訊聊得很開心...

Bot: 📝 正在分析你的對話...

     [情況 A - AI 偵測到時間資訊]
     我從你的對話中發現了這些時間點和情緒：

     🌅 早上 9:00 左右
     情緒：焦慮、壓力 😰
     關鍵事件：工作專案進度落後

     🌤️ 下午 2:00 左右
     情緒：思考、期待 🤔
     關鍵事件：討論新想法，感到有希望

     🌙 晚上 8:00 左右
     情緒：溫暖、放鬆 😊
     關鍵事件：家人視訊，感受到支持

     這些時間點正確嗎？
     [✅ 完全正確] [✏️ 需要調整] [🔄 重新分析]

     [情況 B - AI 無法判斷具體時間]
     我從你的對話中整理出這些情緒變化：

     📍 片段 1
     情緒：焦慮、壓力 😰
     關鍵事件：工作專案進度落後

     請問這大約發生在什麼時候？
     [🌅 早上] [🌤️ 下午] [🌙 晚上] [✏️ 自訂時間]

User: [選擇 自訂時間]
Bot: 請輸入具體時間（例如：9:00、14:30）
User: 9:00
Bot: 好的！已記錄為早上 9:00

     繼續下一個片段...
     [重複確認流程，直到所有片段確認完成]

Bot: 太好了！所有時間都已確認。整體來看，你今天的情緒：

     平均心情指數：6/10
     主要情緒：從焦慮到放鬆的轉變

     你今天經歷了起伏，但最終找到了
     支持和安慰。這是很棒的情緒調節！

     🎨 你的星球正在成形...

     ✨ 今日星球 #127
     顏色: 漸層色（灰→藍→金黃）🌈
     代表：情緒的轉變與成長

     🎵 為你推薦的歌曲：
     《The Climb》- Miley Cyrus
     🔗 [Spotify 連結]

     💭 AI 洞察：
     你今天展現了很好的韌性。雖然早上
     感到壓力，但你主動尋求思考和支持，
     最終在家人的陪伴中找到了平靜。
     這種自我調節能力非常珍貴！

     已記錄到你的星系圖譜 ⭐
```

**技術實現：**
- 使用 Discord Modal 進行多步驟輸入
- **Claude Haiku 4.5** 分析長文本聊天記錄
  - **智能時間偵測**：LLM 自動判斷對話中的時間線索（「早上」「剛剛」「下午3點」等）
  - **無時間則詢問**：無法判斷時提供選項讓使用者補充
  - **互動式確認**：所有時間點都需使用者確認才儲存
  - 識別情緒波動點和關鍵事件
  - 生成結構化摘要
- **GPT-5.1 Mini** 生成深度洞察和歌曲推薦
- **GPT-5.1 Mini** 使用網路搜尋功能找尋歌曲連結和播放平台

**星球顏色生成策略：**
- **完全由 AI 創造**：根據使用者的情緒內容，讓 GPT-5.1 Mini 自由發揮想像力
- **無固定規則**：不設定情緒分數與顏色的對照表
- **AI Prompt 範例**：
  ```
  根據使用者的情緒日記內容，為他們的「今日星球」設計一個獨特的顏色。

  情緒內容：{user_content}
  情緒分數：{mood_score}/10

  請根據情緒的質感、氛圍和能量，自由創造一個最能代表今天的顏色。
  可以是：
  - 單一顏色（如：深海藍 #1B4D89）
  - 漸層色（如：黎明漸層 #FF6B6B → #FFD93D）
  - 複合色（如：雨後彩虹 🌈）

  請以 Hex code 格式回傳，並簡短說明這個顏色的意義。

  回傳格式：
  {
    "color": "#HEX或漸層描述",
    "meaning": "顏色代表的意義"
  }
  ```
- **創意優先**：鼓勵 AI 發揮創意，創造獨特且有意義的星球顏色
- **儲存格式**：將 Hex code 或漸層描述儲存在 `emotions.color` 欄位

**歌曲推薦策略：**
- **使用 LLM 網路搜尋功能**：利用 GPT-5.1 Mini 的網路搜尋能力（Web Search）
- **不使用 Spotify API**：簡化實作，避免 API 整合複雜度
- **推薦流程**：
  1. GPT-5.1 Mini 根據情緒內容推薦適合的歌曲
  2. 使用網路搜尋功能找出歌曲在各平台的連結
  3. 優先順序：Spotify > YouTube > Apple Music
  4. 儲存歌曲名稱和 URL 到資料庫
- **降級方案**：如果無法找到連結，只提供歌名和歌手
- **AI Prompt 範例**：
  ```
  根據使用者的情緒日記，推薦一首最適合的歌曲。

  情緒內容：{user_content}
  情緒分數：{mood_score}/10

  請推薦一首能夠共鳴、療癒或鼓勵使用者的歌曲。
  然後使用網路搜尋找出這首歌在 Spotify 或 YouTube 的播放連結。

  回傳格式：
  {
    "song_name": "歌曲名稱",
    "artist": "歌手",
    "url": "播放連結（Spotify/YouTube）",
    "reason": "推薦理由（一句話）"
  }
  ```

---

### 2. 來自光年之外 (Future Letter)

**功能描述：** 寫信給未來的自己，設定送達時間。

**Discord 指令：**
- `/write-letter` - 寫一封給未來的信
- `/my-letters` - 查看我的信箱（待送達/已開封）
- `/open-letter [ID]` - 打開已送達的信

**互動流程：**
```
User: /write-letter

[情況 A - 第一次使用（使用者未設定 Email）]
Bot: 📬 歡迎來到時光郵局！

     在開始之前，請先提供你的 Email 地址，
     這樣當信件送達時，我也能透過 Email 提醒你。

     請輸入你的 Email：

User: example@gmail.com
Bot: ✅ Email 已儲存！

     現在，你想寄信給多久後的自己？

     快速選擇：
     🔘 3個月後
     🔘 6個月後
     🔘 1年後
     🔘 自訂日期

[情況 B - 已設定過 Email]
Bot: 📬 你想寄信給多久後的自己？

     快速選擇：
     🔘 3個月後
     🔘 6個月後
     🔘 1年後
     🔘 自訂日期

User: [選擇 6個月後]
Bot: 很好！這封信將在 2025-05-17 送達。

     現在，請寫下你想對未來自己說的話：
     (你可以分享現在的心情、目標、期待...)

User: 親愛的未來的我，
     現在的我正在為新專案努力...
     希望半年後你已經...

Bot: ✉️ 信件已封存！

     📅 送達日期: 2025-05-17
     🔒 狀態: 已安全保存
     📬 通知方式: Discord DM + Email (example@gmail.com)

     這封信將在 183 天後送達。
     屆時我會透過 Discord 和 Email 同時提醒你 📮

     期待未來的重逢 🌠

     💡 提示：可使用 /settings 隨時修改 Email 地址
```

**信件送達流程：**
```
[2025-05-17 當天]

Discord DM:
Bot: 📬 你有一封來自 183 天前的信！

     ✉️ 寄件日期: 2024-11-17
     📅 今天是你設定的送達日期

     這封信裡藏著過去的你想對現在的你說的話...

     [📭 開啟信件] [⏰ 稍後再看]

User: [點擊 開啟信件]
Bot: [顯示完整信件內容]

     ━━━━━━━━━━━━━━━━━━━━
     📮 來自 183 天前的你

     親愛的未來的我，

     現在的我正在為新專案努力...
     希望半年後你已經...

     ━━━━━━━━━━━━━━━━━━━━

     💭 此時此刻，你有什麼想說的嗎？

     [💬 回信給過去的自己] [✍️ 寫新的信給未來]

同時寄送 Email:
主旨: 📬 一封來自 183 天前的你 | Mementia
內容:
  你好，

  在 2024-11-17，過去的你寫了一封信給現在的你。

  這封信現在已經送達，請到 Discord 開啟你的時光膠囊：

  👉 使用 /my-letters 指令查看信箱

  或者直接點擊下方按鈕：
  [開啟我的信件]

  祝你有個美好的一天！

  —— Mementia Bot
  Where memories live ✨
```

**技術實現：**
- **Email 設定**:
  - 第一次使用 `/write-letter` 時要求輸入 Email
  - Email 儲存在 `users.email` 欄位（可選欄位）
  - **不需要** Email 驗證（信任使用者輸入）
  - 可透過 `/settings` 修改 Email
- **排程系統**: node-cron 每小時檢查待送達信件
- **通知方式**:
  - Discord DM: 只傳提醒，不顯示內容（保持神秘感）
  - Email: 使用 **Resend** 服務發送通知信（如果有設定 Email）
- **Email 服務配置** (Resend):
  - 免費額度: 100 封/天（開發測試足夠）
  - 每封成本: $0.0001（生產環境）
  - API 簡單易用，開發者友善
  - Email 發送失敗不影響 Discord 通知
- **信件存儲**: PostgreSQL 儲存
- **開信追蹤**: 記錄 `openedAt` 時間戳

---

### 3. 本星系團聚集 (Periodic Review)

**功能描述：** 自動生成週期性回顧報告。

**Discord 指令：**
- `/review weekly` - 查看本週回顧
- `/review monthly` - 查看本月回顧
- `/review custom [開始日期] [結束日期]` - 自訂回顧期間

**回顧內容範例：**
```
📊 你的 11月 星系回顧

━━━━━━━━━━━━━━━━━━━━
📈 情緒趨勢
平均心情指數: 7.2/10 ↗️ (+0.8)

最開心的一天: 11/15 (9/10)
最低落的一天: 11/03 (4/10)

━━━━━━━━━━━━━━━━━━━━
✨ 本月亮點

🌟 完成了 3 個重要專案
🌟 和朋友聚會 5 次
🌟 運動 12 天

━━━━━━━━━━━━━━━━━━━━
💭 AI 深度洞察

這個月你展現了很強的韌性。雖然月初
經歷了一些挑戰，但你逐漸找回了節奏。
你的社交活動增加了，這對你的心情有
明顯的正面影響...

━━━━━━━━━━━━━━━━━━━━
🎨 情緒色盤

🟡🟡🟠🟡🟢🟡🟡🟠🟡🟢
🟡🔵🟡🟡🟢🟡🟠🟡🟡🟢
🟡🟡🟢🟡🟡🟠🟡🟡🟢🟡

━━━━━━━━━━━━━━━━━━━━
🏆 本月成就

✓ 連續記錄 28 天
✓ 完成 2 個幸福挑戰
✓ 解鎖徽章: 「星系探險家」

繼續保持！下個月見 🚀
```

**技術實現：**
- 定時 Cron job 自動生成
- 使用 LLM 生成摘要和洞察
- 數據可視化（文字版）

---

### 4. 外星生命入侵 (Happiness Challenge)

**功能描述：** 定期推送幸福挑戰，完成獲得獎勵。

**Discord 指令：**
- `/challenges` - 查看當前挑戰
- `/complete-challenge [ID]` - 完成挑戰
- `/challenge-history` - 挑戰歷史

**挑戰範例：**
```
🛸 外星生命來訪！

新挑戰已解鎖：

━━━━━━━━━━━━━━━━━━━━
🌱 挑戰: 微笑任務
難度: ⭐ (簡單)

今天對三個不同的人展現真誠的微笑，
並觀察他們的反應和你自己的感受。

⏰ 期限: 今天結束前
🎁 獎勵: 星塵 x50, 徽章「微笑使者」

[✅ 完成挑戰] [⏭️ 跳過]
━━━━━━━━━━━━━━━━━━━━

User: [點擊 完成挑戰]
Bot: 太棒了！請分享一下你的體驗：

User: 我對咖啡店員、同事和家人微笑了...
Bot: 🎉 挑戰完成！

     獲得獎勵：
     ⭐ 星塵 +50
     🏅 徽章: 「微笑使者」

     你的微笑讓世界更美好 ✨
```

**挑戰類別：**
- 社交類 (Social): 與他人互動
- 自我照顧 (Self-care): 關注自己
- 創意類 (Creativity): 創作表達
- 正念類 (Mindfulness): 覺察練習
- 行動類 (Action): 實際行動

**技術實現：**
- 隨機挑戰分配算法
- 獎勵系統（虛擬貨幣/徽章）
- 挑戰完成驗證（信任制）

### 🎁 獎勵系統詳細設計

**設計理念**：進度可見 + 里程碑獎勵，讓使用者有持續動力和成就感

#### 🌟 星塵（Stardust）系統

**性質**：可花費、可累積的虛擬貨幣

**獲得方式：**
- 完成情緒記錄：+10 星塵
- 連續記錄 7 天：+50 星塵
- 完成幸福挑戰：+20-50 星塵（依難度）
- 寫一封未來信件：+30 星塵
- 查看回顧報告：+5 星塵
- 等級提升獎勵：+100 星塵

**用途：**

1. **解鎖回顧功能**
   - 每週回顧：免費
   - 每月回顧：50 星塵
   - 自訂期間深度分析：100 星塵
   - 年度精美報告：500 星塵

2. **自訂星球外觀**
   - 解鎖特殊星球樣式：50-200 星塵
     - 星空紋理 🌌
     - 極光效果 ✨
     - 水彩風格 🎨
     - 賽博朋克 🌃
   - 解鎖自訂顏色功能：30 星塵

3. **進階 AI 功能**
   - 重新生成 AI 洞察：20 星塵
   - 請 AI 深入分析特定情緒：30 星塵
   - AI 生活建議：40 星塵

**儲存實現：**
```prisma
model User {
  // ... 現有欄位
  stardust      Int      @default(0)  // 星塵餘額
}

model StardustTransaction {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  amount      Int      // 正數為獲得，負數為花費
  reason      String   // 原因
  createdAt   DateTime @default(now()) @map("created_at")

  @@index([userId, createdAt])
  @@map("stardust_transactions")
}
```

#### 🏅 徽章（Badges）系統

**性質**：里程碑獎勵、展示成就

**徽章類別：**

**1. 記錄類徽章**
- 🌱 初次記錄：完成第一次情緒記錄
- 🌿 堅持一週：連續記錄 7 天
- 🌳 月度記錄者：連續記錄 30 天
- 🌲 百日記錄：連續記錄 100 天
- 🌍 年度守護者：連續記錄 365 天

**2. 挑戰類徽章**
- 🎯 挑戰新手：完成第一個挑戰
- 🏆 挑戰達人：完成 10 個挑戰
- 🌈 全面發展：完成所有類型的挑戰（社交、自我照顧、創意等）
- 💪 堅持不懈：連續完成挑戰 7 天

**3. 探索類徽章**
- 📮 時光旅人：寫下第一封未來信件
- 📬 重逢時刻：開啟第一封信
- 📊 回顧探索者：查看第一次回顧報告
- 🎨 星球藝術家：創造 50 個星球

**4. 特殊類徽章**
- 💎 勇氣之心：在情緒分數 ≤3 時仍記錄
- 🌟 成長之星：單月情緒進步最大（+3 分以上）
- 🌠 夜空守護者：在凌晨時段記錄
- 🔥 熱情燃燒：單日記錄字數超過 500 字

**儲存實現：**
```prisma
model Badge {
  id          String   @id @default(uuid())
  code        String   @unique // 徽章代碼（FIRST_RECORD, WEEK_STREAK 等）
  name        String   // 徽章名稱
  description String   // 徽章描述
  icon        String   // Emoji 圖示
  category    String   // 類別（record, challenge, explore, special）

  createdAt   DateTime @default(now()) @map("created_at")

  userBadges  UserBadge[]

  @@map("badges")
}

model UserBadge {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  badgeId     String   @map("badge_id")
  badge       Badge    @relation(fields: [badgeId], references: [id])

  earnedAt    DateTime @default(now()) @map("earned_at")

  @@unique([userId, badgeId])
  @@index([userId])
  @@map("user_badges")
}
```

#### 📊 等級（Level）系統

**性質**：根據總記錄天數自動升級

**等級列表：**
- Lv.1 **星際旅人** 🚀（1 天）→ 獎勵 50 星塵
- Lv.2 **星球探索者** 🌏（7 天）→ 獎勵 100 星塵
- Lv.3 **星系守護者** 🌌（30 天）→ 獎勵 200 星塵
- Lv.4 **宇宙觀察家** 🔭（100 天）→ 獎勵 500 星塵
- Lv.5 **時空記錄者** ⏳（365 天）→ 獎勵 1000 星塵

**展示位置：**
- 個人資料中顯示當前等級
- 使用 `/stats` 指令查看詳細進度
- 等級提升時發送特別通知

**儲存實現：**
```prisma
model User {
  // ... 現有欄位
  level         Int      @default(1)  // 當前等級
  totalRecords  Int      @default(0) @map("total_records") // 總記錄天數
}
```

#### 🎯 獎勵獲得通知範例

```
🎉 恭喜！你獲得了新徽章！

🌿 堅持一週
你已經連續記錄情緒 7 天了！
這是一個很棒的開始 ✨

獎勵：
⭐ +50 星塵
🏅 新徽章解鎖

當前星塵：230 💫
已獲得徽章：3/20

[查看我的成就] [繼續記錄]
```

---

### 5. 使用者設定 (User Settings)

**功能描述：** 個人化設定，包含時區、提醒時間、Email 等

**Discord 指令：**
- `/settings` - 開啟設定選單

**互動流程：**
```
User: /settings
Bot: ⚙️ Mementia 設定

     📋 當前設定：
     • 時區：Asia/Taipei (GMT+8)
     • 每日提醒：21:00
     • Email：example@gmail.com
     • 週報：已啟用
     • 月報：已啟用
     • 挑戰：已啟用

     請選擇要修改的項目：
     [🌍 時區設定] [⏰ 提醒時間] [📧 Email]
     [🔔 通知設定] [🌐 語言]

User: [選擇 時區設定]
Bot: 🌍 時區設定

     你目前的時區是：Asia/Taipei (GMT+8)

     請選擇你的時區：
     [常用時區列表...]
     或輸入時區代碼（如：America/New_York）

User: America/Los_Angeles
Bot: ✅ 時區已更新為 America/Los_Angeles (GMT-8)

     所有時間相關功能（提醒、信件送達等）
     都會以新時區為準。

User: [選擇 提醒時間]
Bot: ⏰ 每日提醒時間設定

     目前提醒時間：21:00

     你希望在什麼時候收到記錄提醒？
     [🌅 早上 08:00] [🌆 晚上 20:00]
     [🌙 晚上 22:00] [✏️ 自訂時間]

User: [選擇 自訂時間]
Bot: 請輸入時間（24小時制，例如：09:30）

User: 19:00
Bot: ✅ 每日提醒時間已設為 19:00

     從明天開始，我會在每天 19:00（你的時區）
     提醒你記錄今天的心情 🌟
```

**時區和提醒邏輯：**

**首次使用設定流程：**
```
[使用者第一次使用 /paint 或任何功能]
Bot: 👋 歡迎來到 Mementia！

     在開始之前，讓我們進行簡單的設定：

     1️⃣ 請選擇你的時區：
     [🇹🇼 台北 (GMT+8)] [🇺🇸 紐約 (GMT-5)]
     [🇬🇧 倫敦 (GMT+0)] [🇯🇵 東京 (GMT+9)]
     [✏️ 其他時區]

User: [選擇 台北]
Bot: ✅ 時區已設為 Asia/Taipei

     2️⃣ 你希望每天什麼時候收到記錄提醒？

     [🌅 早上 08:00] [🌆 晚上 20:00]
     [🌙 晚上 22:00] [🚫 不需要提醒]

User: [選擇 晚上 21:00]
Bot: ✅ 太棒了！設定完成 🎉

     • 時區：Asia/Taipei (GMT+8)
     • 每日提醒：21:00

     現在開始記錄你的第一個星球吧！
     [開始記錄 🎨]
```

**技術實現：**

1. **時區處理**
   - 使用 `date-fns-tz` 處理時區轉換
   - 所有時間戳以 UTC 儲存在資料庫
   - 顯示時轉換為使用者時區
   - 定時任務（提醒、信件）根據使用者時區執行

2. **提醒系統**
   - 使用 `node-cron` 每小時檢查待提醒使用者
   - 計算「當前 UTC 時間 + 使用者時區 = 使用者當地時間」
   - 如果符合提醒時間，發送 Discord DM
   - 已提醒的使用者當日不再重複提醒

3. **首次使用偵測**
   - 檢查 `users.timezone` 和 `users.reminderTime` 是否為預設值
   - 如為預設值，顯示歡迎設定流程
   - 設定完成後允許使用功能

4. **資料儲存**
   ```prisma
   model User {
     timezone     String   @default("Asia/Taipei")
     reminderTime String?  @map("reminder_time") // HH:mm 格式
   }

   model UserSettings {
     dailyReminder Boolean @default(true)
     // ... 其他設定
   }
   ```

**提醒訊息範例：**
```
🌟 Mementia 每日提醒

嗨！今天過得如何？ 😊

記得記錄今天的心情，
讓這一天成為你宇宙中獨特的星球 ✨

[開始記錄 🎨] [稍後提醒] [關閉提醒]
```

---

## 📂 專案結構

```
mementia/
├── src/
│   ├── commands/              # Discord 斜線指令
│   │   ├── paint.ts           # /paint 星球彩繪
│   │   ├── view-planet.ts     # /view-planet
│   │   ├── my-galaxy.ts       # /my-galaxy
│   │   ├── write-letter.ts    # /write-letter
│   │   ├── my-letters.ts      # /my-letters
│   │   ├── open-letter.ts     # /open-letter
│   │   ├── review.ts          # /review
│   │   ├── challenges.ts      # /challenges
│   │   ├── complete-challenge.ts
│   │   └── index.ts           # 指令註冊器
│   │
│   ├── services/              # 業務邏輯層
│   │   ├── emotion.service.ts      # 情緒日記服務
│   │   ├── letter.service.ts       # 未來信件服務
│   │   ├── review.service.ts       # 回顧報告服務
│   │   ├── challenge.service.ts    # 挑戰服務
│   │   └── user.service.ts         # 使用者服務
│   │
│   ├── ai/                    # AI 整合層
│   │   ├── llm.service.ts          # LLM 基礎服務
│   │   ├── song-recommender.ts     # 歌曲推薦
│   │   ├── sentiment-analyzer.ts   # 情緒分析
│   │   ├── insight-generator.ts    # 洞察生成
│   │   └── review-generator.ts     # 回顧生成
│   │
│   ├── jobs/                  # 定時任務
│   │   ├── daily-reminder.job.ts   # 每日提醒
│   │   ├── letter-delivery.job.ts  # 信件送達
│   │   ├── review-generation.job.ts # 回顧生成
│   │   └── challenge-assign.job.ts  # 挑戰分配
│   │
│   ├── utils/                 # 工具函數
│   │   ├── logger.ts               # 日誌系統
│   │   ├── embed-builder.ts        # Discord Embed 建構器
│   │   ├── date-utils.ts           # 日期處理
│   │   ├── validation.ts           # 輸入驗證
│   │   └── constants.ts            # 常數定義
│   │
│   ├── types/                 # TypeScript 型別定義
│   │   ├── discord.types.ts
│   │   ├── database.types.ts
│   │   └── ai.types.ts
│   │
│   ├── config/                # 配置檔案
│   │   ├── discord.config.ts
│   │   ├── database.config.ts
│   │   └── ai.config.ts
│   │
│   ├── middlewares/           # 中間件
│   │   ├── error-handler.ts
│   │   └── rate-limiter.ts
│   │
│   └── index.ts               # 應用程式入口
│
├── prisma/
│   ├── schema.prisma          # Prisma 資料庫模型
│   ├── migrations/            # 資料庫遷移檔案
│   └── seed.ts                # 種子資料
│
├── tests/                     # 測試檔案
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/                   # 腳本工具
│   ├── deploy-commands.ts     # 部署 Discord 指令
│   └── db-backup.ts           # 資料庫備份
│
├── .env.example               # 環境變數範例
├── .gitignore
├── package.json
├── tsconfig.json
├── docker-compose.yml         # Docker 配置
├── Dockerfile
└── README.md
```

---

## 🗺️ 開發路線圖

### Phase 1: 基礎設施建設 (Week 1-2)

**目標：** 建立專案骨架和核心基礎設施

- [ ] 專案初始化
  - [ ] TypeScript + Node.js 環境設定
  - [ ] ESLint + Prettier 配置
  - [ ] Git 版本控制設定

- [ ] Discord Bot 基礎
  - [ ] 建立 Discord Application
  - [ ] 實作 Bot 連線和事件監聽
  - [ ] 基礎指令框架（Command Handler）

- [ ] 資料庫設定
  - [ ] PostgreSQL 安裝和配置
  - [ ] Prisma ORM 設定
  - [ ] 資料庫 Schema 設計和遷移
  - [ ] 種子資料建立

- [ ] 日誌和錯誤處理
  - [ ] Winston 日誌系統
  - [ ] 統一錯誤處理中間件

**交付成果：**
- ✅ Bot 可以成功連線到 Discord
- ✅ 資料庫可以正常運作
- ✅ 基礎 `/ping` 指令可運行

---

### Phase 2: 核心功能 - 星球彩繪 (Week 3-4)

**目標：** 實作情緒日記核心功能

- [ ] 情緒記錄流程
  - [ ] `/paint` 指令實作
  - [ ] 互動式問答流程（Modal/Button）
  - [ ] 情緒資料儲存

- [ ] AI 整合
  - [ ] OpenAI API 整合
  - [ ] 情緒分析和洞察生成
  - [ ] 歌曲推薦邏輯
  - [ ] 星球顏色生成邏輯

- [ ] 查詢功能
  - [ ] `/view-planet` 查看單日記錄
  - [ ] `/my-galaxy` 月曆視圖
  - [ ] Embed 美化設計

**交付成果：**
- ✅ 使用者可以記錄每日情緒
- ✅ AI 可以生成洞察和推薦歌曲
- ✅ 使用者可以查看過往記錄

---

### Phase 3: 時光膠囊 - 光年之外 (Week 5)

**目標：** 實作未來信件功能

- [ ] 信件撰寫
  - [ ] `/write-letter` 指令
  - [ ] 日期選擇器
  - [ ] 信件內容儲存

- [ ] 信件送達系統
  - [ ] Cron Job 定時檢查
  - [ ] DM 私訊通知
  - [ ] `/open-letter` 開信功能

- [ ] 信箱管理
  - [ ] `/my-letters` 信件列表
  - [ ] 信件狀態追蹤

**交付成果：**
- ✅ 使用者可以寫信給未來的自己
- ✅ 系統會在指定日期自動送達
- ✅ 使用者可以管理所有信件

---

### Phase 4: 回顧系統 - 星系團聚集 (Week 6-7)

**目標：** 實作自動回顧報告

- [ ] 資料聚合
  - [ ] 週期性資料統計邏輯
  - [ ] 情緒趨勢分析
  - [ ] 關鍵詞提取

- [ ] AI 回顧生成
  - [ ] 使用 LLM 生成摘要
  - [ ] 亮點提取
  - [ ] 深度洞察生成

- [ ] 回顧展示
  - [ ] `/review` 指令實作
  - [ ] 精美的 Embed 報告
  - [ ] 資料視覺化（文字版）

- [ ] 自動生成排程
  - [ ] 週報 Cron Job
  - [ ] 月報 Cron Job

**交付成果：**
- ✅ 系統可以自動生成週報/月報
- ✅ 回顧報告有深度洞察
- ✅ 使用者可以查詢任意時段回顧

---

### Phase 5: 遊戲化 - 外星生命入侵 (Week 8)

**目標：** 實作幸福挑戰系統

- [ ] 挑戰系統
  - [ ] 挑戰資料庫設計
  - [ ] 挑戰池建立（至少 30 個挑戰）
  - [ ] 隨機分配演算法

- [ ] 挑戰互動
  - [ ] `/challenges` 查看挑戰
  - [ ] `/complete-challenge` 完成挑戰
  - [ ] 挑戰歷史記錄

- [ ] 獎勵系統
  - [ ] 虛擬貨幣（星塵）
  - [ ] 徽章系統
  - [ ] 等級系統（可選）

**交付成果：**
- ✅ 系統會定期推送挑戰
- ✅ 使用者可以完成挑戰並獲得獎勵
- ✅ 獎勵系統運作正常

---

### Phase 6: 優化和擴展 (Week 9-10)

**目標：** 優化體驗和新增進階功能

- [ ] 使用者體驗優化
  - [ ] 每日提醒系統
  - [ ] 使用者設定功能
  - [ ] 時區處理

- [ ] 進階功能
  - [ ] 匯出資料功能
  - [ ] 統計儀表板
  - [ ] 好友互動（可選）

- [ ] 效能優化
  - [ ] 資料庫索引優化
  - [ ] 快取機制
  - [ ] 查詢效能優化

- [ ] 測試和文檔
  - [ ] 單元測試
  - [ ] 整合測試
  - [ ] 使用者手冊
  - [ ] API 文檔

**交付成果：**
- ✅ 系統穩定運行
- ✅ 完整的測試覆蓋
- ✅ 完善的文檔

---

### Phase 7: 部署和上線 (Week 11-12)

**目標：** 生產環境部署

- [ ] 部署準備
  - [ ] Docker 容器化
  - [ ] CI/CD Pipeline
  - [ ] 環境變數管理

- [ ] 生產部署
  - [ ] 伺服器配置（VPS/Cloud）
  - [ ] PostgreSQL 生產配置
  - [ ] SSL 憑證設定
  - [ ] 監控和告警系統

- [ ] 上線檢查
  - [ ] 效能測試
  - [ ] 安全性檢查
  - [ ] 備份機制

- [ ] 維運準備
  - [ ] 日誌監控
  - [ ] 錯誤追蹤
  - [ ] 使用者支援流程

**交付成果：**
- ✅ Bot 在生產環境穩定運行
- ✅ 完整的監控和告警
- ✅ 備份和災難恢復計畫

---

## ⚙️ 環境設定

### 必要環境變數 (.env)

```bash
# Discord 配置
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_GUILD_ID=your_test_server_id  # 開發用

# 資料庫配置
DATABASE_URL="postgresql://user:password@localhost:5432/mementia?schema=public"

# AI 配置 - OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.1-mini
# 可選模型: gpt-5.1-mini, gpt-5.1, gpt-4o

# AI 配置 - Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-3-5-haiku-20241022
# 可選模型: claude-3-5-haiku-20241022, claude-sonnet-4.5

# AI 模型分配策略（針對不同場景使用最適合的模型）
AI_MODEL_DAILY=gpt-5.1-mini              # 日常情緒記錄（同理心高、超便宜）
AI_MODEL_REVIEW=gpt-5.1                   # 週期回顧報告（同理心高、遵守指令）
AI_MODEL_CHAT_ANALYSIS=claude-3-5-haiku-20241022  # 聊天記錄分析（長文本處理強）
AI_MODEL_SONG=gpt-5.1-mini                # 歌曲推薦（快速精準）
AI_MODEL_CHALLENGE=gpt-5.1-mini           # 挑戰建議（創意實用）
AI_MODEL_ANNUAL_REVIEW=claude-sonnet-4.5  # 年度總結（真誠直接，可選）

# Email 服務 - Resend
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
# 註冊: https://resend.com/
# 免費額度: 100 封/天, 3000 封/月

# 應用配置
NODE_ENV=development  # development | production
TZ=Asia/Taipei
LOG_LEVEL=info  # debug | info | warn | error

# 功能開關
ENABLE_DAILY_REMINDER=true
ENABLE_AUTO_REVIEW=true
ENABLE_CHALLENGES=true
ENABLE_EMAIL_NOTIFICATION=true

# AI 回應設定
AI_MAX_TOKENS=1000
AI_TEMPERATURE=0.7

# 提醒時間設定（24小時制）
DEFAULT_REMINDER_TIME=21:00

# 挑戰系統設定
CHALLENGE_ASSIGN_HOUR=9        # 每天幾點分配新挑戰
CHALLENGES_PER_WEEK=3          # 每週分配多少個挑戰

# 回顧生成時間
WEEKLY_REVIEW_DAY=0            # 0=週日, 1=週一, ..., 6=週六
MONTHLY_REVIEW_DAY=1           # 每月第幾天生成月報

# 速率限制
RATE_LIMIT_PER_MINUTE=10       # 每位使用者每分鐘可執行的指令數

# 其他整合（可選）
SPOTIFY_CLIENT_ID=optional_spotify_client_id
SPOTIFY_CLIENT_SECRET=optional_spotify_client_secret
```

### 開發環境需求

- **Node.js**: >= 20.x LTS
- **PostgreSQL**: >= 14.x
- **npm** 或 **pnpm**: 最新版本
- **Git**: >= 2.x

### 快速開始

```bash
# 1. 安裝依賴
npm install

# 2. 設定環境變數
cp .env.example .env
# 編輯 .env 填入你的配置

# 3. 資料庫遷移
npx prisma migrate dev

# 4. 生成 Prisma Client
npx prisma generate

# 5. 註冊 Discord 指令
npm run deploy-commands

# 6. 啟動開發伺服器
npm run dev
```

---

## 📊 進階功能規劃

### 未來可擴展功能

1. **社群功能**
   - 好友系統
   - 匿名分享廣場
   - 星球互訪

2. **數據分析**
   - 個人化洞察報告
   - 情緒預測
   - 幸福指數追蹤

3. **多媒體支援**
   - 語音日記
   - 圖片上傳
   - 視覺化星球圖

4. **整合擴展**
   - Google Calendar 同步
   - Notion/Obsidian 匯出
   - Webhook 通知

5. **多語言支援**
   - 英文版本
   - 日文版本
   - i18n 國際化

---

## 🎯 成功指標

### 技術指標
- ✅ 99.9% 正常運行時間
- ✅ API 回應時間 < 2 秒
- ✅ 資料庫查詢 < 100ms
- ✅ 測試覆蓋率 > 80%

### 產品指標
- ✅ 使用者留存率 > 30% (30天)
- ✅ 日活躍使用者 DAU
- ✅ 每日平均記錄次數
- ✅ 挑戰完成率

---

## 📚 參考資源

### Discord.js
- [官方文檔](https://discord.js.org/)
- [指南](https://discordjs.guide/)

### Prisma
- [官方文檔](https://www.prisma.io/docs)
- [PostgreSQL 連接器](https://www.prisma.io/docs/concepts/database-connectors/postgresql)

### OpenAI
- [API 文檔](https://platform.openai.com/docs)
- [Node.js SDK](https://github.com/openai/openai-node)

### 心理學研究
- 懷舊與幸福感研究
- 情緒日記的心理效益
- 正向心理學應用

---

## 🤝 貢獻指南

歡迎貢獻！請參考以下流程：

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

---

## 📝 授權

MIT License

---

**Mementia** - Where memories live. 🌟

讓每一天都成為值得記住的星球，讓每段記憶都在你的宇宙中閃耀。
