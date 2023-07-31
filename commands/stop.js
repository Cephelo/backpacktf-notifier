const { stopLoop } = require('../util/notif-loop.js')

module.exports = {
  name: "stop",
  desc: "Shuts me down.  You can restart me using the directions I'll give you.",
  run: async ({ bot, message, args }) => {
    console.log(`[${Date.now()}] Stop command received, shutting down.`)
    await message.reply({ content: 'Stopping!', allowedMentions: { repliedUser: false } })
    stopLoop(message.channel, bot.host)
  }
}