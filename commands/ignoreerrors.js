const { startIgnore } = require('../util/notif-loop.js')

module.exports = {
    name: "ignoreerrors",
    desc: "",
    run: async ({bot, message, args}) => {
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