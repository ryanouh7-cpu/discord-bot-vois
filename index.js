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

  async function connectToVoice() {
    try {
      const channel = await client.channels.fetch(botData.channel);
      if (!channel) return console.log(`Channel ${index + 1} not found`);

      joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false
      });

      console.log(`Bot ${index + 1} joined voice ✅`);
    } catch (err) {
      console.log(`Reconnect error Bot ${index + 1}`);
      setTimeout(connectToVoice, 5000);
    }
  }

  client.once('ready', () => {
    console.log(`Bot ${index + 1} logged in as ${client.user.tag}`);
    connectToVoice();
  });

  client.on('voiceStateUpdate', (oldState, newState) => {
    if (oldState.member?.id === client.user.id && !newState.channelId) {
      console.log(`Bot ${index + 1} disconnected. Rejoining...`);
      setTimeout(connectToVoice, 3000);
    }
  });

  client.on('error', () => {
    console.log(`Error in Bot ${index + 1}. Restarting...`);
    setTimeout(() => startBot(botData, index), 5000);
  });

  client.login(botData.token);
}

bots.forEach((botData, index) => {
  startBot(botData, index);
});
