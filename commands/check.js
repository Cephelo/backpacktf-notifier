const { getNotifsJson } = require('../util/notif-loop.js')

module.exports = {
    name: "check",
    desc: "Lets you manually check for notifications.",
    run: async ({bot, message, args}) => {
        try {
            console.log(`[${Date.now()}] Check command received.`)

            const notifs = await getNotifsJson('manual check', true, 'get', message.channel, 'notifications?limit=1000', bot)
            if (notifs != undefined) {
                const notCount = notifs.results.length
                const unrCount = notifs.results.filter(el => el.unread == true).length
                await message.reply({ content: `You have ${unrCount} unread notification${unrCount == 1 ? '' : 's'} (${notCount} total).  Want to check for yourself?  ` +
                    `<${bot.next ? 'https://next.backpack.tf/alerts' : 'https://backpack.tf/notifications'}>\n*Keep in mind, when I automatically detect unread notifications, ` + 
                    `they will appear as read from that point on.*`, allowedMentions: { repliedUser: false }})
            }                
        } catch (e) {
            console.error(e)
            message.reply({ content: `__An error has occurred__: ${e}`, allowedMentions: { repliedUser: false }})
        }
    }
}