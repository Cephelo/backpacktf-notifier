const { stopLoop } = require('../util/notif-loop.js')

module.exports = {
    name: "stop",
    desc: "Shuts me down.  You'll need to restart me in VSCode Terminal by typing \`node index\`.",
    run: async ({bot, message, args}) => {
        console.log('Stop command received, shutting down.')
        await message.reply({ content: 'Stopping!', allowedMentions: { repliedUser: false }})
        stopLoop(message.channel)
    }
}