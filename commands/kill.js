const { checkHTTPKARepl } = require('../util/keepalive.js')
const { stopLoop } = require('../util/notif-loop.js')

module.exports = {
  name: "kill",
  desc: "Shuts me down and prevents me from auto-restarting.  Be sure to manually restart me using the directions I'll give you.",
  run: async ({ bot, message, args }) => {
    await checkHTTPKARepl(bot.host, true)
    console.log(`[${Date.now()}] Kill command received, shutting down and preventing auto-restart.`)
    await message.reply({ content: 'Killing...', allowedMentions: { repliedUser: false } })
    stopLoop(message.channel, bot.host, true)
  }
}