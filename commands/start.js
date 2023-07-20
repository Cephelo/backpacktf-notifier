const { startLoop } = require('../util/notif-loop.js')
const allow = true

module.exports = {
    name: "start",
    desc: `I'll start automatically waiting for backpack.tf notifications, and send them here every ${process.env.CHECKING_INTERVAL_IN_SECONDS} seconds.\n` + 
        `\tEnter a number with the command to make me automatically turn off after that many minutes!  __Ex: ${process.env.DISCORD_PREFIX}start 5__`,
    run: async ({bot, message, args}) => {
        try {
            if (allow) {
                !allow
                console.log('Start command received.')
                startLoop(message.channel, args, bot)
                message.reply({ content: 
                    `Starting!  *I'll be automatically checking your notifications every __${process.env.CHECKING_INTERVAL_IN_SECONDS}__ seconds.  ` + 
                    `You can also manually check using the \`${bot.prefix}check\` command.  Keep in mind, when I detect unread notifications, ` + 
                    `they will appear as read from that point on.*`, allowedMentions: { repliedUser: false }})
            } else message.reply({ content: 'The bot is already running!', allowedMentions: { repliedUser: false }})
        } catch (e) {
            console.error(e)
            message.reply({ content: `__An error has occurred__: ${e}`, allowedMentions: { repliedUser: false }})
        }
    }
}