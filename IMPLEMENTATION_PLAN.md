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
| **LLM SDK** | OpenAI SDK | 4.x | AI 功能整合 |
| **任務排程** | node-cron | 3.x | 定時任務（每日提醒、週期回顧） |
| **環境變數** | dotenv | 16.x | 環境配置管理 |
| **日誌系統** | winston | 3.x | 結構化日誌記錄 |
| **驗證** | zod | 3.x | 運行時型別驗證 |
| **日期處理** | date-fns | 3.x | 日期時間處理 |

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
        │    External Services (Optional)       │
        │  ┌──────────┬──────────────────────┐ │
        │  │ OpenAI   │  Spotify/YouTube API │ │
        │  │   API    │  (Song Recommend)    │ │
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
  timezone      String         @default("Asia/Taipei")
  reminderTime  String?        @map("reminder_time") // 每日提醒時間 (HH:mm)
  createdAt     DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime       @updatedAt @map("updated_at")

  // 關聯
  emotions      Emotion[]
  futureLetters FutureLetter[]
  reviews       Review[]
  challenges    UserChallenge[]
  settings      UserSettings?

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
```

---

## 🎨 核心功能模組

### 1. 星球彩繪 (Daily Emotion Log)

**功能描述：** 每日情緒日記，記錄心情並獲得 AI 推薦的歌曲。

**Discord 指令：**
- `/paint` - 開始今天的星球彩繪
- `/view-planet [日期]` - 查看特定日期的星球
- `/my-galaxy` - 查看我的星球圖譜（月曆視圖）

**互動流程：**
```
User: /paint
Bot: 🌟 歡迎來到今天的星球！今天你想用什麼顏色彩繪它呢？

     請告訴我你今天的心情（1-10分）：
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

**技術實現：**
- 使用 Discord Modal 進行多步驟輸入
- LLM 分析情緒關鍵字和生成洞察
- 歌曲推薦邏輯（基於情緒標籤）

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
Bot: 📬 你想寄信給多久後的自己？

     快速選擇：
     🔘 3個月後
     🔘 6個月後
     🔘 1年後
     🔘 自訂日期

User: [選擇 6個月後]
Bot: 很好！這封信將在 2024-05-17 送達。

     現在，請寫下你想對未來自己說的話：
     (你可以分享現在的心情、目標、期待...)

User: 親愛的未來的我，
     現在的我正在為新專案努力...
     希望半年後你已經...

Bot: ✉️ 信件已封存！

     📅 送達日期: 2024-05-17
     🔒 狀態: 已加密保存

     這封信將在 183 天後送達你的信箱。
     屆時我會提醒你 ⏰

     期待未來的重逢 🌠
```

**技術實現：**
- Cron job 每日檢查待送達信件
- DM 私訊通知使用者
- 加密存儲（可選）

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

# AI 配置
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4  # 或 gpt-3.5-turbo

# 應用配置
NODE_ENV=development  # development | production
TZ=Asia/Taipei
LOG_LEVEL=info  # debug | info | warn | error

# 功能開關
ENABLE_DAILY_REMINDER=true
ENABLE_AUTO_REVIEW=true
ENABLE_CHALLENGES=true

# 其他
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
   - Spotify 完整整合
   - Google Calendar 同步
   - Notion/Obsidian 匯出

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
