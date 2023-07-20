module.exports = {
    name: "ping",
    desc: "Measures how fast my connection to Discord is.",
    run: async ({bot, message, args}) => {
        message.reply({ content: `Pong!  \`Discord Bot Latency: ${Date.now() - message.createdTimestamp}ms\` | \`Discord API Latency: ${Math.round(bot.client.ws.ping)}ms\``, allowedMentions: { repliedUser: false }})
    }
}