const { stopLoop } = require('../util/notif-loop.js')

module.exports = {
  name: "restart",
  desc: "Shuts me down for a bit so I can restart.  If I don't restart, you can manually do so with the directions I'll give you.",
  run: async ({ bot, message, args }) => {
    console.log(`[${Date.now()}] Restart command received, shutting down.`)
    await message.reply({ content: 'Attempting to restart!', allowedMentions: { repliedUser: false } })
    stopLoop(message.channel, bot.host, false)
  }
}