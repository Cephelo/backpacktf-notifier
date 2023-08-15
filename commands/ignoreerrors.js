const { startIgnore } = require('../util/notif-loop.js')

module.exports = {
    name: "ignoreerrors",
    desc: "",
    run: async ({bot, message, args}) => {
        let numberMinutes = 0
        let moreThan = false
        try {
            numberMinutes = parseInt(args)
            if (numberMinutes > 0) {
                console.log(`[${Date.now()}] IgnoreErrors command received, disabling error reporting in discord.`)
                if (numberMinutes > 1440) {
                    numberMinutes = 1440
                    moreThan = true
                }
                await message.reply({ content: `I will now be ignoring errors for the next ${numberMinutes == 1 ? 'minute' : '\`' + numberMinutes + '\` minutes'}.  You may want to manually check your notifications, ` +
                    `just in case: <${bot.next ? 'https://next.backpack.tf/alerts' : 'https://backpack.tf/notifications'}>${moreThan ? '\n*Note: You cannot have me ignore errors for more than 24 hours (aka 1440 minutes).*' : '' }`, allowedMentions: { repliedUser: false }})
                await startIgnore(numberMinutes)
            } else await message.reply({ content: `\`${args}\` isn't a whole number!  Try the command again with a valid number.  No decimals or fractions.`, allowedMentions: { repliedUser: false }})
        } catch (e) {
            if (numberMinutes = 0) {
                await message.reply({ content: `\`${args}\` isn't a whole number!  Try the command again with a valid number.  No decimals or fractions.`, allowedMentions: { repliedUser: false }})
            }
        }
    }
}