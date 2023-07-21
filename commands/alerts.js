const { getNotifsJson } = require('../util/notif-loop.js')

module.exports = {
    name: "alerts",
    desc: "Lists your active alerts and gives a link to your alerts page.",
    run: async ({bot, message, args}) => {
        try {
            console.log('Alerts command received.')

            const alerts = await getNotifsJson('alerts check', true, message.channel, 'classifieds/alerts', bot)
            if (alerts != undefined) {
                let alertsStrings = []
                alertsStrings.push(`__You currently have ${alerts.results.length} active alert${alerts.results.length == 1 ? '' : 's'}__.`)
                for (const alert of alerts.results) {
                    if (alertsStrings.length > 20) {
                        alertsStrings.push(`*and ${alerts.results.length-20} more...*`)
                        break
                    }
                    try {
                        alertsStrings.push(`**${alertsStrings.length}.** ${alert.item_name} for ${alert.intent} listings between ${alert.price.min} and ${alert.price.max} ${alert.price.currency}`)
                    } catch {
                        try { if (alert.blanket == 1) alertsStrings.push(`**${alertsStrings.length}.** ${alert.item_name} for all ${alert.intent} listings`) } 
                        catch { alertsStrings.push(`**${alertsStrings.length}.** *An alert I failed to retrieve for an unknown reason.  Whoops!*`) }
                    }
                }
                alertsStrings.push(`Want to see for yourself?  <${process.env.NEXT.toLowerCase() == 'true' ? 'https://next.backpack.tf/account/classifieds-alerts' : 'https://backpack.tf/alerts'}>`)
                await message.reply({ content: alertsStrings.join('\n'), allowedMentions: { repliedUser: false }})
            }
        } catch (e) {
            console.error(e)
            message.reply({ content: `__An error has occurred__: ${e}`, allowedMentions: { repliedUser: false }})
        }
    }
}