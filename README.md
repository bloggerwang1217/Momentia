# 🌟 Mementia - Where Memories Live

<div align="center">

**A Discord bot that transforms your daily emotions into a personal universe of memories.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-14.x-7289DA)](https://discord.js.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Features](#-features) • [Getting Started](#-getting-started) • [Commands](#-commands) • [Tech Stack](#-tech-stack)

</div>

---

## 📖 About

Mementia is an interactive Discord bot that helps you track, visualize, and reflect on your emotional journey. Every day becomes a unique planet in your personal galaxy, with AI-powered insights, music recommendations, and thoughtful challenges to enhance your well-being.

### ✨ Core Features

- **🎨 Planet Painting (星球彩繪)** - Daily emotion logging with AI-generated planets
- **✉️ Time Capsule Letters (光年之外)** - Write letters to your future self
- **📊 Periodic Reviews (星系團聚集)** - AI-generated weekly/monthly/quarterly/yearly insights
- **👾 Happiness Challenges (外星生命入侵)** - Gamified well-being activities
- **⭐ Reward System** - Earn stardust, level up, and collect badges
- **🤖 AI Integration** - GPT-5.1 and Claude for sentiment analysis and insights

---

## 🚀 Features

### 1. 🎨 Daily Emotion Logging

Transform your mood into beautiful planets:

- **Manual Input**: Rate your mood 1-10 and write about your day
- **Chat Analysis**: Paste conversation logs and let AI analyze your emotions
- **AI Insights**: Get personalized music recommendations and emotional insights
- **Unique Planets**: Each day generates a unique planet with color and ID

**Commands**: `/paint`, `/view-planet`, `/my-galaxy`

### 2. ✉️ Future Letters

Create time capsules for your future self:

- Write letters that deliver in 1-12 months
- Receive notifications via Discord and Email
- Reflect on your past thoughts and growth
- Earn rewards for sending and opening letters

**Commands**: `/write-letter`, `/my-letters`, `/open-letter`

### 3. 📊 AI-Powered Reviews

Get comprehensive emotional insights with mood trends, highlights, and AI-generated recommendations.

**Commands**: `/review`

### 4. 👾 Happiness Challenges

Gamify your well-being journey with weekly challenges, difficulty levels, and badge rewards.

**Commands**: `/challenges`, `/complete-challenge`, `/challenge-history`

### 5. ⭐ Progression System

**Stardust** - Earn through daily activities (10-500 ✨)
**Levels** - Progress as you engage
**Badges** - Unlock achievements

### 6. ⚙️ Customization

Manage settings for email, timezone, reminders, and preferences.

**Commands**: `/settings`, `/stats`, `/help`

---

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+ with TypeScript 5.3
- **Framework**: Discord.js 14.x
- **Database**: PostgreSQL + Prisma ORM
- **AI**: OpenAI GPT-5.1, Anthropic Claude Haiku 4.5
- **Services**: Resend (Email), Winston (Logging)
- **Scheduling**: node-cron

---

## 📦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Discord Bot Token
- OpenAI API Key
- Anthropic API Key (optional)
- Resend API Key (optional)

### Installation

1. **Clone and install**
   ```bash
   git clone https://github.com/yourusername/Momentia.git
   cd Momentia
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Setup database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Run**
   ```bash
   npm run build
   npm start
   # Or for development:
   npm run dev
   ```

### Discord Bot Setup

1. Create bot at [Discord Developer Portal](https://discord.com/developers/applications)
2. Enable intents: Server Members, Message Content
3. Invite with permissions: Send Messages, Embed Links, Use Slash Commands

---

## 📚 Commands

### Emotion Tracking
- `/paint` - Start planet painting
- `/view-planet [date]` - View specific planet
- `/my-galaxy [year] [month]` - Monthly calendar

### Future Letters
- `/write-letter` - Write to future self
- `/my-letters` - View all letters
- `/open-letter <id>` - Open delivered letter

### Reviews
- `/review <type>` - Generate/view reviews

### Challenges
- `/challenges` - View active challenges
- `/complete-challenge <id>` - Complete challenge
- `/challenge-history` - View history

### Settings
- `/settings` - Manage preferences
- `/stats` - View statistics
- `/help` - Get help

---

## 🗂️ Project Structure

```
Momentia/
├── prisma/           # Database schema & seeds
├── src/
│   ├── ai/          # AI services
│   ├── commands/    # Slash commands
│   ├── config/      # Configuration
│   ├── jobs/        # Cron jobs
│   ├── services/    # Business logic
│   ├── utils/       # Utilities
│   └── index.ts     # Entry point
└── ...
```

---

## 📊 Scheduled Tasks

- **Hourly**: Letter delivery, Daily reminders
- **Daily 2 AM**: Review generation
- **Monday 9 AM**: Challenge assignment

---

## 🐛 Troubleshooting

**Bot doesn't respond**
- Verify bot permissions and token
- Register commands: `npm run deploy-commands`

**Database errors**
- Check `DATABASE_URL`
- Run `npx prisma generate`

**AI errors**
- Verify API keys
- Check rate limits

---

## 🤝 Contributing

Contributions welcome! Fork, create feature branch, commit, push, and open PR.

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

<div align="center">

Made with ❤️ by the Mementia Team

**[⬆ Back to Top](#-mementia---where-memories-live)**

</div>
