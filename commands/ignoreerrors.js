const { startIgnore } = require('../util/notif-loop.js')
const { isRunning } = require('./start.js')

require("dotenv").config()

module.exports = {
    name: "ignoreerrors",
    desc: "",
    run: async ({bot, message, args}) => {
        if (await isRunning()) message.reply({ content: `This command can only be sent while I am running.  Use \`${bot.prefix}start\` to do that.`, allowedMentions: { repliedUser: false }})
        else {
            let numberMinutes = 0
            try {
                numberMinutes = parseInt(args)
                if (numberMinutes > 0) {
                    console.log(`[${Date.now()}] IgnoreErrors command received, disabling error reporting in discord.`)
                    await message.reply({ content: `I will now be ignoring errors for the next ${numberMinutes == 1 ? 'minute' : '\`' + numberMinutes + '\` minutes'}.  You may want to manually check your notifications, ` +
                        `just in case: <${bot.next ? 'https://next.backpack.tf/alerts' : 'https://backpack.tf/notifications'}>`, allowedMentions: { repliedUser: false }})
                    await startIgnore(numberMinutes)
                } else await message.reply({ content: `\`${args}\` isn't a whole number!  Try the command again with a valid number.  No decimals or fractions.`, allowedMentions: { repliedUser: false }})
            } catch (e) {
                if (numberMinutes = 0) {
                    await message.reply({ content: `\`${args}\` isn't a whole number!  Try the command again with a valid number.  No decimals or fractions.`, allowedMentions: { repliedUser: false }})
                }
            }
        }
    }
}