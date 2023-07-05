// eslint-disable-next-line unicorn/prevent-abbreviations
import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export default {
	command: new SlashCommandBuilder()
		.setName('mod')
		.setDescription('botモデレーター専用コマンド')
		.addSubcommand((input) =>
			input
				.setName('globalmessagedelete')
				.setDescription('(botモデレーター専用コマンド)グローバルチャットのメッセージを削除します。')
				.addStringOption((input) => input.setName('mid').setDescription('メッセージのid').setRequired(true)),
		)
		.addSubcommand((input) =>
			input
				.setName('globalchatban')
				.setDescription('(botモデレーター専用コマンド)グローバルチャットBanを行います。')
				.addUserOption((input) => input.setName('user').setDescription('対象ユーザー').setRequired(true))
				.addStringOption((input) =>
					input.setName('reason').setDescription('グローバルチャットBanする理由').setRequired(true),
				),
		)
		.addSubcommand((input) =>
			input
				.setName('globalchatunban')
				.setDescription('(botモデレーター専用コマンド)グローバルチャットBan解除を行います。')
				.addUserOption((input) => input.setName('user').setDescription('対象ユーザー').setRequired(true)),
		),
	ownersOnly: false,
	modOnly: true,
	permissions: false,

	async execute(interaction: ChatInputCommandInteraction) {
		switch (interaction.options.getSubcommand()) {
			case 'globalmessagedelete': {
				const messages: undefined | { channelId: string; messageId: string }[] =
					await interaction.client.botData.globalChat.messages.get(interaction.options.getString('mid'));
				if (!messages) await interaction.error('削除できません', 'メッセージが見つかりません。', true);
				for (const value of messages) {
					const channel = interaction.client.channels.cache.get(value.channelId);
					if (!channel) continue;
					if (channel.type !== ChannelType.GuildText) continue;
					channel.messages.fetch(value.messageId).then((message) => message.delete());
				}
				await interaction.ok('削除しました。', 'メッセージを削除しました。', true);
				break;
			}
			case 'globalchatban': {
				const { blocks } = interaction.client.botData.globalChat;
				const user = interaction.options.getUser('user');
				const reason = interaction.options.getString('reason');
				await blocks.set(user.id, reason);
				await interaction.ok('グローバルチャットBanに成功', 'グローバルチャットBanが完了しました。', true);
				break;
			}
			case 'globalchatunban': {
				const { blocks } = interaction.client.botData.globalChat;
				const user = interaction.options.getUser('user');
				await blocks.delete(user.id);
				await interaction.ok('グローバルチャットBan解除に成功', 'グローバルチャットBan解除が完了しました。', true);
				break;
			}
		}
	},
};
