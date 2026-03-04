const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const bots = [
  { token: process.env.TOKEN1, channel: process.env.CHANNEL1 },
  { token: process.env.TOKEN2, channel: process.env.CHANNEL2 },
  { token: process.env.TOKEN3, channel: process.env.CHANNEL3 },
  { token: process.env.TOKEN4, channel: process.env.CHANNEL4 },
];

const controllers = [];

async function registerCommand(token, clientId, guildId) {
  const commands = [
    new SlashCommandBuilder()
      .setName('joinall')
      .setDescription('تدخل كل البوتات الرومات')
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: '10' }).setToken(token);
  await rest.put(
    Routes.applicationGuildCommands(clientId, guildId),
    { body: commands },
  );
}

function startBot(botData, index) {

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

  let currentChannelId = null;

  async function connect(channelId) {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel) return;

      joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: true
      });

      currentChannelId = channelId;
      console.log(`Bot ${index + 1} joined voice ✅`);
    } catch (err) {
      console.log(`Bot ${index + 1} join error`);
    }
  }

  client.once('ready', async () => {
    console.log(`Bot ${index + 1} ready`);

    if (index === 0) {
      await registerCommand(
        botData.token,
        client.user.id,
        process.env.GUILD_ID
      );
      console.log("Slash command registered");
    }
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'joinall') return;

    if (index === 0) {
      bots.forEach((b, i) => {
        controllers[i].connect(b.channel);
      });

      await interaction.reply('دخلوا كلهم ✅');
    }
  });

  client.on('voiceStateUpdate', (oldState, newState) => {
    if (oldState.member?.id === client.user.id && !newState.channelId && currentChannelId) {
      setTimeout(() => connect(currentChannelId), 3000);
    }
  });

  controllers[index] = { connect };

  client.login(botData.token);
}

bots.forEach((botData, index) => {
  startBot(botData, index);
});
