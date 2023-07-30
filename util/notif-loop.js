const { EmbedBuilder } = require("discord.js");
const config = JSON.parse(require("fs").readFileSync(`./config.json`))

const enableMentions = config.PING_USER.toLowerCase() == 'false' ? false : true
const checkFreq = parseInt(config.CHECKING_INTERVAL_IN_SECONDS)
const debug = false
let ignoreErrors = 0
async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

async function stopLoop(channel) {
  console.log(`[${Date.now()}] Stopping!`)
  await channel.send('To restart me, go to <https://replit.com>, click on your backpacktf-notifier repl project, and click Run.  You can also restart me on the Replit mobile app.')
  process.exit(0)
}

async function startIgnore(minutes) {
  ignoreErrors = Date.now() + (minutes * 60000)
  console.log(`Ignoring errors for ${minutes} minute${minutes == 1 ? '' : 's'}`)
}

async function startLoop(bot, channel) {
  if (checkFreq < 10 || !Number.isInteger(checkFreq)) {
    console.log(`"CHECKING_INTERVAL_IN_SECONDS" is set to ${checkFreq}, it must be 10 or more.  Shutting down.`)
    await channel.send(`<@${bot.owner}> \`CHECKING_INTERVAL_IN_SECONDS\` is set to ${checkFreq}, it must be 10 or more.  Stopping!`)
    stopLoop(channel)
  }
  console.log(`[${Date.now()}] Starting!\n-\nI'll check your notifs every ${checkFreq} seconds.\nYou can manually check by using ${bot.prefix}check in discord.\nKeep in mind, when I detect unread notifications, they will appear as read from that point on.\nHere are some of my commands:\n${bot.prefix}commands\n${bot.prefix}help\n${bot.prefix}stop\n-`)
  channel.send('Restarting!  (I was offline)')
  
  let notifs = undefined
  for (let i = 0; i < Number.MAX_SAFE_INTEGER; i++) {
    if (ignoreErrors > 0 && Date.now() > ignoreErrors) {
      console.log('Allocated time has passed, re-enabling error reporting in discord.')
      await channel.send('**I am no longer ignoring errors, as the allocated time has passed.**')
      ignoreErrors = 0
    }

    notifs = await getNotifsJson(`#${i + 1}`, false, channel, 'notifications', bot)
    if (notifs != undefined) {
      /* Debug */ if (debug) console.log(`${notifs.length} unread notification${notifs.length == 1 ? '' : 's'}. (#${i + 1})`)
      if (notifs.length > 0) {
        const haveNotifMessage = `${enableMentions ? '<@' + bot.owner + '> ' : ''}You have ${notifs.length == 1 ? 'a backpack.tf notification' : notifs.length + ' backpack.tf notifications'}!`
        if (enableMentions) await channel.send(haveNotifMessage)
        else await channel.send({ content: haveNotifMessage, allowedMentions: { repliedUser: false } })
      }
      for (const notif of notifs) {
        let notifEmbed = new EmbedBuilder()
        if (notif.bundle.listing.intent == 'sell') notifEmbed.setColor(0x389902)
        else if (notif.bundle.listing.intent == 'buy') notifEmbed.setColor(0x0c8cc3)
        else notifEmbed.setColor(0x233246)
        notifEmbed.setTitle(notif.targetUser.name)
        notifEmbed.setURL(bot.next ? 'https://next.backpack.tf/alerts' : 'https://backpack.tf/notifications')
        notifEmbed.setThumbnail(notif.targetUser.avatar)
        notifEmbed.setAuthor({ name: notif.contents.subject, url: bot.next ? `https://next.backpack.tf${notif.contents.nuxtUrl}` : `https://backpack.tf${notif.contents.url}` })
        notifEmbed.setDescription(`**${notif.contents.message}**\n\nListed <t:${notif.bundle.listing.listedAt}:R> - <t:${notif.bundle.listing.listedAt}:F>\n*Bumped <t:${notif.bundle.listing.bumpedAt}:R> - <t:${notif.bundle.listing.bumpedAt}:F>*`)

        await channel.send({ embeds: [notifEmbed] })
        await delay(500)
        if (Math.floor(Math.random() * 100) < 5) await channel.send(`Too many alerts?  If so, you can always change them: <${bot.next ? 'https://next.backpack.tf/account/classifieds-alerts' : 'https://backpack.tf/alerts'}>`)
        else if (Math.floor(Math.random() * 100) < 5) await channel.send(`Remeber to delete your read notifcations once in a while!  <${bot.next ? 'https://next.backpack.tf/alerts' : 'https://backpack.tf/notifications'}>`)
        else if (Math.floor(Math.random() * 100) < 6) await channel.send(`Getting any errors?  Be sure to report them on the github, or join the discord!  <https://github.com/Cephelo/backpacktf-notifier/issues> <https://discord.gg/${bot.invite}>`)
        else if (Math.floor(Math.random() * 100) < 7) await channel.send(`Remember to check the github for updates!  <https://github.com/Cephelo/backpacktf-notifier/releases>`)
        else if (Math.floor(Math.random() * 100) < 5) await channel.send(`We now have a discord server!  Join to get pinged for updates, report bugs, recommend or discuss new features, or just talk!  https://discord.gg/${bot.invite}`)
      }
      await delay((notifs.length > checkFreq * 2 ? 500 : (checkFreq * 1000) - (500 * notifs.length)))
    }
  }
}

async function getNotifsJson(num, isCommand, channel, category, bot) {
  const fetchJson = await fetch(`https://backpack.tf/api/${category}${isCommand ? '' : '/unread'}?token=${process.env.BACKPACKTF_USER_TOKEN}`, { method: isCommand ? 'GET' : 'POST' }
  ).then((response) => {
    if (!response.ok) {
      let errorMessage = `**Status code ${response.status}**.  Here's what that means: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${response.status}>`
      if (response.status == 401) errorMessage = '**Your backpack.tf User Token is invalid or incorrect.**  (401)'
      else if (response.status == 504) errorMessage = '**Request timed out.**  (504)'
      else if (response.status == 502) errorMessage = '**Invalid response received from backpacktf.**  (502)  *If this keeps happening multiple times, the backpack.tf API might be having trouble.  If not, this was just a hiccup.*'
      else if (response.status == 503) errorMessage = '**Service Unavailable.**  (503)  *Something might be wrong with the backpack.tf API.*'

      if (Math.floor(Math.random() * 100) < 5) channel.send(`Are you getting the same error over and over again?  If your backpack.tf User Token is valid, there could be something wrong on backpack.tf's side of things.  Check for yourself: https://status.backpack.tf\n` +
        `*If the errors are annoying, you can use the command \`${bot.prefix}ignoreerrors 10\` to stop the  bot from sending error messages for 10 minutes.  You can change \`10\` to any number, but I wouldn't do more than 60.*`)
      if (Date.now() > ignoreErrors) channel.send(`${enableMentions ? '<@' + bot.owner + '> ' : ''}__An error has occurred__: ${errorMessage}`)
      throw new Error(`[${Date.now()}] HTTP error! (${num}) Status: ${response.status}`);
    } else if (debug) console.log(`Response OK! (${num})`)
    return response;
  }).catch(
    err => console.error(`[${Date.now()}] ${err}`),
    err => channel.send(`${enableMentions ? '<@' + bot.owner + '> ' : ''}__An error has occurred__.  *${err}*`)
  )

  try {
    //* Debug */ if (debug) console.log(`fileJson (${num}): ${JSON.stringify(await fetchJson.json())}`)
    return await fetchJson.json()
  } catch (error) {
    console.log(`[${Date.now()}] Error parsing JSON:`)
    console.error(error)
    if (fetchJson == undefined) {
      console.log('Notifications have returned as undefined.  The error can be seen above.')
      if (Date.now() > ignoreErrors) {
        const failMessage = await channel.send(`Notifications have returned as undefined.  ${isCommand ? '*Try the command again.  If there is not another error message, ' +
          'this was just a hiccup.*' : '__Retrying ' + `<t:${((Date.now() / 1000) + checkFreq + 2).toString().split('.')[0]}:R>` + '...__'}`)
        if (!isCommand) {
          await delay(checkFreq * 1000)
          await failMessage.edit('*~~Notifications have returned as undefined.~~*  __Retry attempted__.  *If there is not another error message, ' +
            'the attempt was successful, and this was just a hiccup.*')
        }
      } else if (!isCommand) await delay(checkFreq * 1000)
    } else channel.send(`${enableMentions ? '<@' + bot.owner + '> ' : ''}__An error has occurred while parsing notification input__: \`${error}\``)
    return undefined
  }
}

module.exports = { startLoop, stopLoop, getNotifsJson, startIgnore }