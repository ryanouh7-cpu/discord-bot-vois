const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const bots = [
  { token: process.env.TOKEN1, channel: process.env.CHANNEL1 },
  { token: process.env.TOKEN2, channel: process.env.CHANNEL2 },
  { token: process.env.TOKEN3, channel: process.env.CHANNEL3 },
  { token: process.env.TOKEN4, channel: process.env.CHANNEL4 },
];

function startBot(botData, index) {

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

  client.once('ready', async () => {
    console.log(`Bot ${index + 1} logged in as ${client.user.tag}`);

    try {
      const channel = await client.channels.fetch(botData.channel);

      if (!channel || channel.type !== 2) {
        console.log(`Bot ${index + 1}: Channel not valid voice`);
        return;
      }

      joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: true
      });

      console.log(`Bot ${index + 1} joined voice ✅`);

    } catch (err) {
      console.log(`Bot ${index + 1} failed to join`, err.message);
    }
  });

  client.login(botData.token);
}

bots.forEach((botData, index) => {
  startBot(botData, index);
});
