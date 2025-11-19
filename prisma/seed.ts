/**
 * Database Seed Script
 *
 * 初始化資料庫種子資料（徽章和挑戰）
 */

import { PrismaClient } from '@prisma/client';
import { BADGES } from '../src/utils/constants';

const prisma = new PrismaClient();

/**
 * 種子徽章資料
 */
async function seedBadges() {
  console.log('🌱 Seeding badges...');

  const badgeData = Object.values(BADGES).map((badge) => ({
    code: badge.code,
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    category: badge.category,
  }));

  for (const badge of badgeData) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: badge,
      create: badge,
    });
  }

  console.log(`✅ Created/updated ${badgeData.length} badges`);
}

/**
 * 種子挑戰資料
 */
async function seedChallenges() {
  console.log('🌱 Seeding challenges...');

  const challenges = [
    // 社交類 (Social)
    {
      title: '微笑任務',
      description: '今天對三個不同的人展現真誠的微笑，並觀察他們的反應和你自己的感受。',
      category: 'social',
      difficulty: 1,
      reward: { type: 'stardust', value: 20 },
    },
    {
      title: '讚美他人',
      description: '真誠地讚美兩個人，可以是他們的外表、能力或行為。',
      category: 'social',
      difficulty: 1,
      reward: { type: 'stardust', value: 20 },
    },
    {
      title: '主動聯繫',
      description: '主動聯繫一位你很久沒聯繫的朋友，問候對方近況。',
      category: 'social',
      difficulty: 2,
      reward: { type: 'stardust', value: 35 },
    },
    {
      title: '傾聽時刻',
      description: '今天至少花 15 分鐘專注傾聽一個人說話，不打斷、不急著給建議。',
      category: 'social',
      difficulty: 2,
      reward: { type: 'stardust', value: 35 },
    },
    {
      title: '陌生對話',
      description: '與一位陌生人進行一次友善的對話（可以是店員、鄰居等）。',
      category: 'social',
      difficulty: 3,
      reward: { type: 'stardust', value: 50 },
    },

    // 自我照顧 (Self-care)
    {
      title: '深呼吸練習',
      description: '找一個安靜的地方，進行 5 分鐘的深呼吸練習。',
      category: 'self-care',
      difficulty: 1,
      reward: { type: 'stardust', value: 20 },
    },
    {
      title: '充足睡眠',
      description: '今晚確保自己睡滿 7-8 小時，並記錄睡醒後的感受。',
      category: 'self-care',
      difficulty: 1,
      reward: { type: 'stardust', value: 20 },
    },
    {
      title: '營養早餐',
      description: '為自己準備一份營養均衡的早餐，慢慢享用。',
      category: 'self-care',
      difficulty: 1,
      reward: { type: 'stardust', value: 20 },
    },
    {
      title: '戶外散步',
      description: '到戶外散步至少 20 分鐘，觀察周圍的自然環境。',
      category: 'self-care',
      difficulty: 2,
      reward: { type: 'stardust', value: 35 },
    },
    {
      title: '放鬆泡澡',
      description: '為自己準備一個舒適的泡澡時光，放鬆身心。',
      category: 'self-care',
      difficulty: 2,
      reward: { type: 'stardust', value: 35 },
    },
    {
      title: '數位排毒',
      description: '今天晚上 6 點後不使用任何社群媒體，專注於現實生活。',
      category: 'self-care',
      difficulty: 3,
      reward: { type: 'stardust', value: 50 },
    },

    // 創意類 (Creativity)
    {
      title: '自由書寫',
      description: '花 10 分鐘不間斷地自由書寫，不需要在意文法或結構。',
      category: 'creativity',
      difficulty: 1,
      reward: { type: 'stardust', value: 20 },
    },
    {
      title: '隨手塗鴉',
      description: '用手邊的紙筆，花 15 分鐘隨意塗鴉或畫畫。',
      category: 'creativity',
      difficulty: 1,
      reward: { type: 'stardust', value: 20 },
    },
    {
      title: '創意料理',
      description: '嘗試製作一道你從沒做過的料理或點心。',
      category: 'creativity',
      difficulty: 2,
      reward: { type: 'stardust', value: 35 },
    },
    {
      title: '照片故事',
      description: '用手機拍 5 張照片，記錄今天的生活片段，並為它們寫一段故事。',
      category: 'creativity',
      difficulty: 2,
      reward: { type: 'stardust', value: 35 },
    },
    {
      title: '學習新技能',
      description: '花 30 分鐘學習一個你一直想學的新技能（樂器、繪畫、程式等）。',
      category: 'creativity',
      difficulty: 3,
      reward: { type: 'stardust', value: 50 },
    },

    // 正念類 (Mindfulness)
    {
      title: '感恩三件事',
      description: '寫下今天你感恩的三件事，無論大小。',
      category: 'mindfulness',
      difficulty: 1,
      reward: { type: 'stardust', value: 20 },
    },
    {
      title: '正念進食',
      description: '選擇一餐，專注於食物的味道、質地和香氣，不看手機或電視。',
      category: 'mindfulness',
      difficulty: 1,
      reward: { type: 'stardust', value: 20 },
    },
    {
      title: '五感觀察',
      description: '停下來，用五感觀察周圍環境：你看到、聽到、聞到、感受到什麼？',
      category: 'mindfulness',
      difficulty: 1,
      reward: { type: 'stardust', value: 20 },
    },
    {
      title: '冥想練習',
      description: '進行 10 分鐘的冥想或正念練習。',
      category: 'mindfulness',
      difficulty: 2,
      reward: { type: 'stardust', value: 35 },
    },
    {
      title: '身體掃描',
      description: '進行一次完整的身體掃描練習，從頭到腳感受身體各部位的狀態。',
      category: 'mindfulness',
      difficulty: 3,
      reward: { type: 'stardust', value: 50 },
    },

    // 行動類 (Action)
    {
      title: '整理空間',
      description: '整理你的房間或工作桌，丟掉或捐贈不再需要的物品。',
      category: 'action',
      difficulty: 2,
      reward: { type: 'stardust', value: 35 },
    },
    {
      title: '幫助他人',
      description: '主動幫助一個人完成一件事，可以是朋友、家人或陌生人。',
      category: 'action',
      difficulty: 2,
      reward: { type: 'stardust', value: 35 },
    },
    {
      title: '運動 30 分鐘',
      description: '進行至少 30 分鐘的運動（跑步、瑜珈、健身等）。',
      category: 'action',
      difficulty: 2,
      reward: { type: 'stardust', value: 35 },
    },
    {
      title: '完成拖延任務',
      description: '完成一件你已經拖延很久的任務。',
      category: 'action',
      difficulty: 3,
      reward: { type: 'stardust', value: 50 },
    },
    {
      title: '志願服務',
      description: '參與至少 2 小時的志願服務或社區活動。',
      category: 'action',
      difficulty: 3,
      reward: { type: 'stardust', value: 50 },
    },
  ];

  for (const challenge of challenges) {
    await prisma.challenge.create({
      data: challenge,
    });
  }

  console.log(`✅ Created ${challenges.length} challenges`);
}

/**
 * 執行種子資料
 */
async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    await seedBadges();
    await seedChallenges();

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
