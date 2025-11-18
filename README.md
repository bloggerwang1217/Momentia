# Mementia - Where memories live 🌟

<div align="center">

一個運用 AI 技術的 Discord 情緒陪伴機器人，讓你在繁忙生活中記錄幸福、回顧自己、獲得鼓勵。

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-14.x-7289DA.svg)](https://discord.js.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-336791.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

## ✨ 核心功能

### 🎨 星球彩繪 (Daily Emotion Log)
視覺化情緒日記，每天記錄心情，AI 自動分析並推薦歌曲。將每一天轉化為獨特的星球，累積你的情緒宇宙。

### 💌 來自光年之外 (Future Letter)
寫信給未來的自己，跨越時空的自我對話。讓過去的感動成為前行的力量。

### 📊 本星系團聚集 (Periodic Review)
AI 自動整理你的情緒記錄，生成週報、月報、年度回顧。用數據和洞察看見自己的成長軌跡。

### 🛸 外星生命入侵 (Happiness Challenge)
定期推送幸福挑戰任務，完成後獲得虛擬獎勵。讓累積幸福成為一場充滿驚喜的冒險！

## 🚀 快速開始

### 前置需求

- Node.js >= 20.x
- PostgreSQL >= 14.x
- Discord Bot Token ([如何創建](https://discord.com/developers/applications))
- OpenAI API Key ([獲取方式](https://platform.openai.com/api-keys))

### 安裝步驟

```bash
# 1. Clone 專案
git clone https://github.com/your-username/momentia.git
cd momentia

# 2. 安裝依賴
npm install

# 3. 設定環境變數
cp .env.example .env
# 編輯 .env 填入你的配置

# 4. 啟動資料庫（使用 Docker）
docker-compose up -d postgres

# 5. 執行資料庫遷移
npm run db:migrate

# 6. 註冊 Discord 斜線指令
npm run deploy-commands

# 7. 啟動 Bot
npm run dev
```

### 使用 Docker（推薦）

```bash
# 啟動所有服務（PostgreSQL + Bot + Prisma Studio）
docker-compose up -d

# 查看日誌
docker-compose logs -f bot

# 停止服務
docker-compose down
```

## 📖 文檔

- [完整實作計畫](IMPLEMENTATION_PLAN.md) - 詳細的技術架構和開發路線圖
- [快速開始指南](QUICK_START.md) - 手把手教學
- [API 文檔](docs/API.md) - Discord 指令和功能說明（即將推出）

## 🏗️ 技術架構

```
TypeScript + Discord.js + PostgreSQL + Prisma + OpenAI
```

- **前端界面**: Discord (斜線指令 + 互動式按鈕/選單)
- **後端邏輯**: Node.js + TypeScript
- **資料庫**: PostgreSQL + Prisma ORM
- **AI 引擎**: OpenAI GPT-4
- **任務排程**: node-cron

詳細架構請參考 [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)

## 🎯 開發路線圖

- [x] Phase 1: 基礎設施建設
- [ ] Phase 2: 星球彩繪功能
- [ ] Phase 3: 未來信件功能
- [ ] Phase 4: 回顧系統
- [ ] Phase 5: 幸福挑戰
- [ ] Phase 6: 優化和擴展
- [ ] Phase 7: 生產部署

查看完整路線圖：[開發路線圖](IMPLEMENTATION_PLAN.md#開發路線圖)

## 🤝 貢獻

歡迎貢獻！請查看 [貢獻指南](CONTRIBUTING.md) 了解詳情。

## 📄 授權

本專案採用 [MIT 授權](LICENSE)

## 🙏 致謝

- 基於正向心理學和懷舊研究的科學基礎
- 感謝所有開源社群的貢獻者

---

<div align="center">

**Mementia** - 讓每一段時光都值得珍藏 ✨

Made with ❤️ for mental wellbeing

</div>
