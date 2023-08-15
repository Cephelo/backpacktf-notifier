module.exports = {
    name: "ping",
    desc: "Returns my Discord connection speed, and links the backpack.tf API status and backpack TF2 Inventory API status pages.",
    run: async ({bot, message, args}) => {
        if (args != false) args = true
        message.reply({ content: `${args ? 'Pong!  ' : ''}\`Discord Bot Latency: ${Date.now() - message.createdTimestamp}ms\` | \`Discord API Latency: ${Math.round(bot.client.ws.ping)}ms\`` +
        `\nbackpack.tf API Status: <https://status.backpack.tf>\nTF2 Inventory API Status: <https://next.backpack.tf/almanac/steam-api-health>`, allowedMentions: { repliedUser: false }})
    }
}