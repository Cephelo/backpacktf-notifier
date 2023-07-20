const { EmbedBuilder } = require("discord.js");
require("dotenv").config()

const debug = false
const checkFreq = parseInt(process.env.CHECKING_INTERVAL_IN_SECONDS) // amount of time in between each notif check
const delay = async (ms = checkFreq*500) => new Promise(resolve => setTimeout(resolve, ms))
const shortDelay = async (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))
const longDelay = async (ms = checkFreq*1000) => new Promise(resolve => setTimeout(resolve, ms))

async function startLoop(channel, minutes, bot) { // 'minutes' is how long the bot should run for before automatically shutting down.

    if (checkFreq < 10) {
        console.log(`\`CHECKING_INTERVAL_IN_SECONDS\` is set to ${checkFreq}, it must be 10 or more.  Shutting down.`)
        await channel.send(`\`CHECKING_INTERVAL_IN_SECONDS\` is set to ${checkFreq}, it must be 10 or more.  Stopping!`)
        process.exit(0)
    }

    /* Debug */ if (debug) {
        if (minutes != '') console.log(`Minutes to run: ${minutes ? minutes : 'Until Stop'}; is Number: ${!isNaN(minutes)}`)
        else console.log('Running until a stop command is received or the bot is turned off.')
    }

    const count = (!isNaN(minutes) && minutes != '' && minutes > 0) ? minutes * (60/checkFreq) : Number.MAX_SAFE_INTEGER

    let notifs = undefined
    for (let i = 0; i < count; i++) {
        notifs = await getNotifs(`#${i+1}`, false, channel)
        if (notifs != undefined) {
            /* Debug */ if (debug) console.log(`${notifs.length} unread notification${notifs.length == 1 ? '' : 's'}. (#${i+1})`)
            if (notifs.length > 0) await channel.send(`<@${bot.owner}> You have ${notifs.length == 1 ? 'a backpack.tf notification' : notifs.length + ' backpack.tf notifications'}!`)

            for (const notif of notifs) {
                let notifEmbed = new EmbedBuilder()
                if (notif.bundle.listing.intent == 'sell') notifEmbed.setColor(0x389902)
                else if (notif.bundle.listing.intent == 'buy') notifEmbed.setColor(0x0c8cc3)
                else notifEmbed.setColor(0x233246)
                notifEmbed.setTitle(notif.targetUser.name)
                const next = process.env.NEXT.toLowerCase() == 'true'
                notifEmbed.setURL(next ? 'https://next.backpack.tf/alerts' : 'https://backpack.tf/notifications')
                notifEmbed.setThumbnail(notif.targetUser.avatar)
                notifEmbed.setAuthor({ name: notif.contents.subject, url: next ? `https://next.backpack.tf${notif.contents.nuxtUrl}`: `https://backpack.tf${notif.contents.url}` })
                notifEmbed.setDescription(`**${notif.contents.message}**\n\nListed <t:${notif.bundle.listing.listedAt}:R> - <t:${notif.bundle.listing.listedAt}:F>\n*Bumped <t:${notif.bundle.listing.bumpedAt}:R> - <t:${notif.bundle.listing.bumpedAt}:F>*`)
            
                await channel.send({ embeds: [notifEmbed] })
                await shortDelay();
                if (Math.floor(Math.random() * 100) < 5) await channel.send(`Too many alerts?  If so, you can always change your them: <${next ? 'https://next.backpack.tf/account/classifieds-alerts' : 'https://backpack.tf/alerts'}>`)
                if (Math.floor(Math.random() * 100) < 3) await channel.send(`Remeber to delete your read alerts once in a while!  <${next ? 'https://next.backpack.tf/account/classifieds-alerts' : 'https://backpack.tf/alerts'}>`)
            }
            await delay();
        }
    }
    console.log(`${minutes} minute${minutes == 1 ? ' has' : 's have'} passed, shutting down.`)
    await channel.send({ content: `${minutes} minute${minutes == 1 ? ' has' : 's have'} passed.  Stopping!`, allowedMentions: { repliedUser: false }})
    process.exit(0)
}

async function getNotifs(num, check, channel) {
    const fetchJson = await fetch(`https://backpack.tf/api/notifications${check ? '' : '/unread'}?token=${process.env.BACKPACKTF_USER_TOKEN}`, { method: check ? 'GET' : 'POST' }
    ).then((response) => {
        if (!response.ok) {
            channel.send(`Error: ${response.status == 401 ? 'Your backpack.tf User Token is invalid or incorrect.' : 
            '**Status code ' + response.status + '**.  To see what that means, read here: <https://backpack.tf/developer/pages/api_conventions>'}`)
            throw new Error(`HTTP error! (${num}) Status: ${response.status}`);
        } else if (debug) console.log(`Response OK! (${num})`)
        return response;
    }).catch(
        err => console.error(err),
        err => channel.send(`Error: *${err}*`)
        )

    let fileJson = undefined
    try {
        fileJson = await fetchJson.json()
        //* Debug */ if (debug) console.log(`fileJson (${num}): ${JSON.stringify(fileJson)}`)
    } catch (error) { 
        if (fetchJson == undefined) {
            const timeUntilRetry =  `<t:${((Date.now() / 1000) + checkFreq + 2).toString().split('.')[0]}:R>`
            const failMessage = await channel.send(`Notifications have returned as \`undefined\`.  ${check ? '' : '__Retrying ' + timeUntilRetry + '...__'}`)
            await longDelay();
            if (!check) await failMessage.edit('~~Notifications have returned as \`undefined\`.~~  __Retry attempted__.  *If there is no error message, the attempt was successful.*')
        } else {
            console.log(`Error parsing JSON: ${error}`) }
            channel.send(`Error parsing notification input: ${error}`)
        }
    return fileJson
}

module.exports = { startLoop, getNotifs }