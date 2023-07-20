const { startLoop } = require('../util/notif-loop.js')
const allow = true

module.exports = {
    name: "start",
    run: async ({bot, message, args}) => {
        try {
            if (allow) {
                !allow
                console.log('Start command received.')
                startLoop(message.channel, args, bot)
                message.reply({ content: 'Starting!', allowedMentions: { repliedUser: false }})
            } else message.reply({ content: 'The bot is already running!', allowedMentions: { repliedUser: false }})
        } catch (e) {
            console.error(e)
            message.reply({ content: `__An error has occurred__: ${e}`, allowedMentions: { repliedUser: false }})
        }
    }
}