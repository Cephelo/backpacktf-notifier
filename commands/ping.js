module.exports = {
    name: "ping",
    run: async ({bot, message, args}) => {
        message.reply({ content: `Pong!  \`Discord Bot Latency: ${Date.now() - message.createdTimestamp}ms\` \`Discord API Latency: ${Math.round(bot.client.ws.ping)}ms\``, allowedMentions: { repliedUser: false }})
    }
}