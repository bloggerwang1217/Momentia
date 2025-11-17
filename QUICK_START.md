# Mementia - 快速開始指南 🚀

這份指南將帶你從零開始，在 30 分鐘內運行 Mementia Discord Bot。

## 📋 準備工作清單

在開始之前，請確保你已經準備好以下項目：

- [ ] 安裝了 Node.js 20.x 或更新版本
- [ ] 安裝了 PostgreSQL（或使用 Docker）
- [ ] 安裝了 Git
- [ ] 有一個 Discord 帳號
- [ ] 有一個 OpenAI 帳號

---

## 步驟 1: 創建 Discord Bot

### 1.1 創建 Discord Application

1. 前往 [Discord Developer Portal](https://discord.com/developers/applications)
2. 點擊 "New Application"
3. 輸入名稱：`Mementia`
4. 點擊 "Create"

### 1.2 配置 Bot

1. 在左側選單點擊 "Bot"
2. 點擊 "Add Bot" → "Yes, do it!"
3. 在 Bot 設定頁面：
   - **Public Bot**: 關閉（除非你要公開）
   - **Requires OAuth2 Code Grant**: 關閉
   - 向下捲動到 "Privileged Gateway Intents"，啟用以下選項：
     - ✅ Presence Intent
     - ✅ Server Members Intent
     - ✅ Message Content Intent

### 1.3 獲取 Bot Token

1. 在 Bot 頁面點擊 "Reset Token"
2. 複製 Token（只會顯示一次！）
3. **重要**: 保密此 Token，不要分享給任何人

### 1.4 獲取 Client ID

1. 在左側選單點擊 "General Information"
2. 複製 "Application ID"（這就是你的 Client ID）

### 1.5 邀請 Bot 到你的伺服器

使用以下 URL（替換 `YOUR_CLIENT_ID`）：

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=277025770496&scope=bot%20applications.commands
```

1. 在瀏覽器中打開上面的 URL
2. 選擇你要邀請 Bot 的伺服器
3. 點擊 "授權"

---

## 步驟 2: 獲取 OpenAI API Key

1. 前往 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 登入你的帳號
3. 點擊 "Create new secret key"
4. 輸入名稱：`Mementia Bot`
5. 複製 API Key（只會顯示一次！）

> **注意**: 使用 OpenAI API 會產生費用。建議使用 `gpt-4o-mini` 模型以節省成本。

---

## 步驟 3: 設定專案

### 3.1 Clone 專案

```bash
git clone https://github.com/your-username/momentia.git
cd momentia
```

### 3.2 安裝依賴

```bash
npm install
```

### 3.3 配置環境變數

```bash
# 複製環境變數範例檔案
cp .env.example .env
```

使用文字編輯器打開 `.env`，填入以下資訊：

```bash
# Discord 配置
DISCORD_TOKEN=你的_Discord_Bot_Token
DISCORD_CLIENT_ID=你的_Discord_Client_ID
DISCORD_GUILD_ID=你的_測試伺服器_ID  # 右鍵點擊伺服器圖示 → 複製 ID

# 資料庫配置
DATABASE_URL="postgresql://postgres:password@localhost:5432/mementia?schema=public"

# AI 配置
OPENAI_API_KEY=你的_OpenAI_API_Key
OPENAI_MODEL=gpt-4o-mini

# 應用配置
NODE_ENV=development
TZ=Asia/Taipei
LOG_LEVEL=info

# 功能開關
ENABLE_DAILY_REMINDER=true
ENABLE_AUTO_REVIEW=true
ENABLE_CHALLENGES=true
```

> **如何獲取伺服器 ID**: 在 Discord 中啟用開發者模式（設定 → 進階 → 開發者模式），然後右鍵點擊伺服器圖示，選擇「複製 ID」。

---

## 步驟 4: 設定資料庫

### 方法 A: 使用 Docker（推薦）

這是最簡單的方法，不需要手動安裝 PostgreSQL。

```bash
# 啟動 PostgreSQL 容器
docker-compose up -d postgres

# 等待幾秒讓資料庫啟動
sleep 5

# 執行資料庫遷移
npm run db:migrate

# 生成 Prisma Client
npm run db:generate
```

### 方法 B: 使用本地 PostgreSQL

如果你已經安裝了 PostgreSQL：

1. 創建資料庫：

```bash
# 登入 PostgreSQL
psql -U postgres

# 創建資料庫
CREATE DATABASE mementia;

# 退出
\q
```

2. 執行遷移：

```bash
npm run db:migrate
npm run db:generate
```

### 驗證資料庫

啟動 Prisma Studio 查看資料庫：

```bash
npm run db:studio
```

在瀏覽器中打開 http://localhost:5555，你應該可以看到所有資料表。

---

## 步驟 5: 註冊 Discord 指令

在啟動 Bot 之前，需要註冊斜線指令：

```bash
npm run deploy-commands
```

你應該會看到類似的輸出：

```
✅ Successfully registered 10 application commands.
```

---

## 步驟 6: 啟動 Bot

### 開發模式

```bash
npm run dev
```

你應該會看到：

```
[INFO] Mementia Bot is online!
[INFO] Logged in as: Mementia#1234
[INFO] Serving 1 guilds
```

### 測試 Bot

在你的 Discord 伺服器中輸入 `/`，你應該會看到 Mementia 的指令列表：

- `/paint` - 開始今天的星球彩繪
- `/view-planet` - 查看特定日期的星球
- `/my-galaxy` - 查看我的星球圖譜
- `/write-letter` - 寫一封給未來的信
- `/my-letters` - 查看我的信箱
- `/challenges` - 查看當前挑戰

試著執行 `/paint` 開始你的第一次情緒記錄！

---

## 🎉 恭喜！

你已經成功啟動 Mementia Bot！現在你可以：

1. 使用 `/paint` 記錄今天的心情
2. 探索其他功能
3. 查看 [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) 了解完整功能

---

## 📝 開發提示

### 資料庫管理

```bash
# 查看資料庫（圖形界面）
npm run db:studio

# 創建新的遷移
npm run db:migrate

# 重置資料庫（警告：會刪除所有資料）
npx prisma migrate reset
```

### 日誌查看

日誌會輸出到 console 和 `logs/` 資料夾：

```bash
# 查看最新日誌
tail -f logs/combined.log

# 查看錯誤日誌
tail -f logs/error.log
```

### 程式碼檢查

```bash
# 執行 ESLint
npm run lint

# 自動修復
npm run lint:fix

# 格式化程式碼
npm run format
```

### 使用 Docker 完整環境

```bash
# 啟動所有服務（Bot + PostgreSQL + Prisma Studio）
docker-compose up -d

# 查看 Bot 日誌
docker-compose logs -f bot

# 重新啟動 Bot
docker-compose restart bot

# 停止所有服務
docker-compose down

# 完全清除（包括資料庫）
docker-compose down -v
```

---

## ❓ 常見問題

### Q: Bot 無法連線到 Discord

**A**: 檢查以下項目：
1. `DISCORD_TOKEN` 是否正確
2. Bot 的 Intents 是否都已啟用
3. 網路連線是否正常

### Q: 資料庫連線失敗

**A**: 檢查：
1. PostgreSQL 是否正在運行（`docker-compose ps` 或 `pg_isready`）
2. `DATABASE_URL` 是否正確
3. 資料庫是否已創建

### Q: OpenAI API 錯誤

**A**: 檢查：
1. API Key 是否正確
2. OpenAI 帳號是否有餘額
3. 網路是否可以訪問 OpenAI API

### Q: 指令沒有出現

**A**:
1. 確認已執行 `npm run deploy-commands`
2. 等待 1-5 分鐘讓 Discord 更新指令
3. 嘗試重新啟動 Discord 客戶端

### Q: 修改程式碼後沒有生效

**A**:
1. 開發模式 (`npm run dev`) 應該會自動重新載入
2. 如果沒有，手動重新啟動
3. 確認沒有語法錯誤

---

## 🆘 需要幫助？

- 查看 [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) 了解完整架構
- 查看程式碼中的註解
- 開啟 GitHub Issue 回報問題

---

## 🎯 下一步

現在 Bot 已經運行了，你可以：

1. **開發新功能**: 參考 [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) 的開發路線圖
2. **自訂設定**: 修改 `.env` 中的配置
3. **新增挑戰**: 在資料庫中新增自訂的幸福挑戰
4. **部署到生產環境**: 參考文檔的部署章節

Happy coding! 🚀
