# 使用官方 Node.js 20 LTS Alpine 映像
FROM node:20-alpine AS base

# 安裝 OpenSSL（Prisma 需要）
RUN apk add --no-cache openssl

# 設定工作目錄
WORKDIR /app

# ========================================
# 依賴安裝階段
# ========================================
FROM base AS dependencies

# 複製 package 文件
COPY package*.json ./
COPY prisma ./prisma/

# 安裝依賴
RUN npm ci --only=production && \
    npm cache clean --force

# 安裝開發依賴（用於建構）
RUN npm ci

# ========================================
# 建構階段
# ========================================
FROM base AS build

# 複製依賴
COPY --from=dependencies /app/node_modules ./node_modules

# 複製所有源代碼
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 建構 TypeScript
RUN npm run build

# ========================================
# 生產環境階段
# ========================================
FROM base AS production

# 設定環境變數
ENV NODE_ENV=production

# 複製生產依賴
COPY --from=dependencies /app/node_modules ./node_modules

# 複製 Prisma schema
COPY --from=build /app/prisma ./prisma

# 複製建構好的應用
COPY --from=build /app/dist ./dist

# 複製 package.json
COPY package*.json ./

# 生成 Prisma Client
RUN npx prisma generate

# 建立非 root 使用者
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 切換到非 root 使用者
USER nodejs

# 暴露端口（如果需要 webhook 或 API）
# EXPOSE 3000

# 啟動應用
CMD ["node", "dist/index.js"]

# ========================================
# 開發環境階段
# ========================================
FROM base AS development

# 設定環境變數
ENV NODE_ENV=development

# 複製 package 文件
COPY package*.json ./

# 安裝所有依賴（包括開發依賴）
RUN npm ci

# 複製所有文件
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 啟動開發伺服器
CMD ["npm", "run", "dev"]
