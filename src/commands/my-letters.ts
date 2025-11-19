/**
 * My Letters Command - 查看信箱
 */

import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../types';
import { getOrCreateUser } from '../services/user.service';
import { getUserLetters } from '../services/letter.service';
import { createBaseEmbed } from '../utils/embed-builder';
import { EMBED_COLORS } from '../utils/constants';
import { getRelativeTimeDescription } from '../utils/date-utils';

export default {
  data: new SlashCommandBuilder()
    .setName('my-letters')
    .setDescription('📬 查看我的信箱（待送達/已開封）'),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply();
      const user = await getOrCreateUser(interaction.user.id, interaction.user.username);
      const { pending, delivered } = await getUserLetters(user.id);

      const embed = createBaseEmbed('📬 我的時光郵局', undefined, EMBED_COLORS.INFO);

      if (pending.length > 0) {
        const pendingList = pending.map((l, i) =>
          `${i + 1}. 送達日期: ${l.deliverDate.toLocaleDateString('zh-TW')} (${getRelativeTimeDescription(l.deliverDate, user.timezone)})\n   ID: \`${l.id}\``
        ).join('\n\n');
        embed.addFields({ name: '📮 待送達的信', value: pendingList });
      }

      if (delivered.length > 0) {
        const deliveredList = delivered.slice(0, 5).map((l, i) =>
          `${i + 1}. ${l.opened ? '✅' : '📭'} ${l.deliverDate.toLocaleDateString('zh-TW')}\n   ID: \`${l.id}\``
        ).join('\n\n');
        embed.addFields({ name: '📬 已送達的信 (最近5封)', value: deliveredList });
      }

      if (pending.length === 0 && delivered.length === 0) {
        embed.setDescription('你還沒有任何信件。\n\n使用 `/write-letter` 寫一封給未來的信吧！');
      } else {
        embed.setDescription(`總共 ${pending.length} 封待送達，${delivered.length} 封已送達\n\n使用 \`/open-letter [ID]\` 開啟信件`);
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: '❌ 發生錯誤' });
    }
  },
} as Command;
