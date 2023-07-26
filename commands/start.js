const { startLoop } = require('../util/notif-loop.js')
let allow = true
async function isRunning() { return allow }

module.exports = {
    name: "start",
    desc: `I'll start automatically waiting for backpack.tf notifications, and send them here every ${process.env.CHECKING_INTERVAL_IN_SECONDS} seconds.\n` + 
        `\tEnter a number with the command to make me automatically turn off after that many minutes!  __Ex: ${process.env.DISCORD_PREFIX}start 5__`,
    run: async ({bot, message, args}) => {
        try {
            if (allow) {
                allow = false
                console.log(`[${Date.now()}] Start command received.`)
                startLoop(message.channel, args, bot)
                message.reply({ content: 
                    `Starting!  *I'll be automatically checking your notifications every __${process.env.CHECKING_INTERVAL_IN_SECONDS}__ seconds.  ` + 
                    `You can also manually check using the \`${bot.prefix}check\` command.*\n- *Keep in mind, when I detect unread notifications, ` + 
                    `they will appear as read from that point on.*\n- *Notifications will appear in this channel.  To use a different channel, ` + 
                    `use \`${bot.prefix}stop\`, restart me, and use the \`${bot.prefix}start\` command there instead.*\n- __Keep your computer on, ` + 
                    `or I will stop running__!`, allowedMentions: { repliedUser: false }})
            } else message.reply({ content: 'I\'m already running, silly!', allowedMentions: { repliedUser: false }})
        } catch (e) {
            console.error(`[${Date.now()}] ${e}`)
            message.reply({ content: `__An error has occurred__: ${e}`, allowedMentions: { repliedUser: false }})
        }
    },
    isRunning
}