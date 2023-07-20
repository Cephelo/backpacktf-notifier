const { getNotifs } = require('../util/notif-loop.js')

module.exports = {
    name: "check",
    run: async ({bot, message, args}) => {
        try {
            console.log('Check command received.')

            const notifs = await getNotifs('manual check', true, message.channel)
            if (notifs != undefined) {
                const notCount = notifs.results.length
                const unrCount = notifs.results.filter(el => el.unread == true).length
                await message.reply({ content: `You have ${unrCount} unread notification${unrCount == 1 ? '' : 's'} (${notCount} total).`, allowedMentions: { repliedUser: false }})
            }
        } catch (e) {
            console.error(e)
            message.reply({ content: `__An error has occurred__: ${e}`, allowedMentions: { repliedUser: false }})
        }
    }
}