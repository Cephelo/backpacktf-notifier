const { EmbedBuilder } = require("discord.js");
const config = JSON.parse(require("fs").readFileSync(`./config.json`))
require("dotenv").config()

const enableMentions = config.PING_USER.toLowerCase() == 'false' ? false : true
const errorPings = config.ERROR_PINGS.toLowerCase() == 'true' ? true : false
const wakeupPings = config.WAKEUP_PINGS.toLowerCase() == 'true' ? true : false
const checkFreq = parseInt(config.CHECKING_INTERVAL_IN_SECONDS)
const debug = false
let ignoreErrors = 0
async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

async function stopLoop(channel, host, kill) {
  console.log(`[${Date.now()}] Stopping!`)
  await channel.send(`${kill ? 'Go' : 'If I don\'t auto-restart in 10 minutes, go'} to <${host}> and wait for the "I'm running!" message to pop up to manually restart me.  You can also restart me directly from replit.com, or the Replit mobile app.`)
  if (kill) process.kill(1)
  else process.exit(0)
}

async function startIgnore(minutes) {
  ignoreErrors = Date.now() + (minutes * 60000)
  console.log(`Ignoring errors for ${minutes} minute${minutes == 1 ? '' : 's'}`)
}

async function startString(owner, host) {
  return `${wakeupPings ? '<@' + owner + '> ' : ''}**Waking back up!**\n*__I was just offline for a bit__.  If I ever go offline for more than 10 minutes, restart me by going to <${host}> and wait for the "I'm running!" message to pop up.  You can also restart me directly from replit.com, or the Replit mobile app.*\n__Reminder: When I detect unread notifications, they will appear as read from that point on.__\n*__Last check: <t:${(Date.now() / 1000).toString().split('.')[0]}:R>__ (Only valid for current session)*`
}

function sendTip(num, ignore) {
  return (Math.floor(Math.random() * 100) < num) && (ignore ? Date.now() > ignoreErrors : true)
}

async function startLoop(bot, channel) {
  if (checkFreq < 10 || !Number.isInteger(checkFreq)) {
    console.log(`"CHECKING_INTERVAL_IN_SECONDS" is set to ${checkFreq}, it must be 10 or more.  Shutting down.`)
    await channel.send(`<@${bot.owner}> \`CHECKING_INTERVAL_IN_SECONDS\` is set to ${checkFreq}, it must be 10 or more.  Stopping!`)
    await stopLoop(channel, bot.host, true)
  }
  console.log(`[${Date.now()}] Starting!\n-\nI'll check your notifs every ${checkFreq} seconds.\nYou can check manually with ${bot.prefix}check in discord.\nKeep in mind, when I detect unread notifications, they'll appear as read from that point on.\nHere are some of my commands:\n${bot.prefix}commands\n${bot.prefix}help\n${bot.prefix}discord\n-`)
  const startMessage = await channel.send(await startString(bot.owner, bot.host))

  // Check for updates
  let masterVersion = await fetch('http://backpacktf-notifier-public.cephelo.repl.co', { method: 'GET' }
  ).then((response) => {
    if (!response.ok) {
      console.log(`Error ${response.status}: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${response.status}`)
      throw new Error(`[${Date.now()}] HTTP error! Status: ${response.status}`);
    }
    return response.text()
  }).catch(err => console.error(`[${Date.now()}] ${err}`))
  masterVersion = masterVersion.replace('VERSION ', '').trim()
  if (`${masterVersion}` != `${bot.version}` && `${masterVersion}` != 'undefined') {
    console.log(`--------\nNOTICE: There is an update available!\nLatest Version: ${masterVersion}\nCurrent Version: ${bot.version}\nFollow the instructions in the README.md file on github to update this bot!\n--------`)
    channel.send(`<@${bot.owner}> **A new version has been released!  Please update me using the instructions at <https://github.com/Cephelo/backpacktf-notifier/blob/main/README.md#updates>**\nUpdates can contain new features, fixes, and other goodies, so it's recommended to update ASAP!\n[\`Latest version: ${masterVersion}\`] - [\`Current version: ${bot.version}\`]`)
    bot.version = bot.version + ' (UPDATE AVAILABLE!)'
  } else if (`${masterVersion}` == 'undefined') console.log(`Failed to check latest BPTFNotifier version.`)
  else console.log(`Version ${masterVersion} (Up to date!)`)

  let notifs = undefined
  for (let i = 0; i < Number.MAX_SAFE_INTEGER; i++) {
    if (ignoreErrors > 0 && Date.now() > ignoreErrors) {
      console.log('Allocated time has passed, re-enabling error reporting in discord.')
      await channel.send(`${errorPings ? '<@' + bot.owner + '> ' : ''}**I am no longer ignoring errors, as the allocated time has passed.**`)
      ignoreErrors = 0
    }

    notifs = await getNotifsJson(`#${i + 1}`, false, channel, 'notifications', bot)
    await startMessage.edit(await startString(bot.owner, bot.host))
    if (notifs != undefined) {
      /* Debug */ if (debug) console.log(`${notifs.length} unread notification${notifs.length == 1 ? '' : 's'}. (#${i + 1})`)
      if (notifs.length > 0) {
        let haveNotifMessage = `${enableMentions ? '<@' + bot.owner + '> ' : ''}You have ${notifs.length == 1 ? 'a backpack.tf notification' : notifs.length + ' backpack.tf notifications'}!`
        for (const notif of notifs) {
          let mesAmount = notif.bundle.listing.value.short
          if ((notif.contents.message.includes(' keys, $') || notif.contents.message.includes(' 1.00 key, ')) && !notif.contents.message.includes('Mann Co. Supply Crate Key')) {
            mesAmount = notif.contents.message.split(', ').find(x => x.includes('key'))
          }
          let baseName = notif.bundle.listing.item.name
          if (baseName.includes('The')) baseName = baseName.replace('The ', '')
          const headersRemove = ['Taunt', 'Strange Part']
          for (const x of headersRemove) if (baseName.includes(`${x}:`)) baseName = `${baseName.replace(`${x}: `, '')} ${x}`
          haveNotifMessage += `\n> ${notif.bundle.listing.intent.substr(0, 1).toUpperCase()}${notif.bundle.listing.intent.substr(1)}ing: ${baseName} for ${mesAmount}`
        }
        await channel.send(haveNotifMessage)
      }
      for (const notif of notifs) {
        let notifEmbed = new EmbedBuilder()
        if (notif.bundle.listing.intent == 'sell') notifEmbed.setColor(bot.next ? 0x0c8cc3/*5b8baf*/ : 0x389902)
        else if (notif.bundle.listing.intent == 'buy') notifEmbed.setColor(bot.next ? 0x389902/*5d9a4b*/ : 0x0c8cc3)
        else notifEmbed.setColor(0x233246)
        notifEmbed.setTitle(notif.targetUser.name)
        notifEmbed.setURL(bot.next ? 'https://next.backpack.tf/alerts' : 'https://backpack.tf/notifications')
        notifEmbed.setThumbnail(notif.targetUser.avatar)
        notifEmbed.setFooter({ text: notif.bundle.listing.details == undefined ? 'No Message.' : notif.bundle.listing.details })
        if (notif.contents.subject.includes('listing removed')) notifEmbed.setAuthor({ name: notif.contents.subject })
        else notifEmbed.setAuthor({ name: notif.contents.subject, url: bot.next ? `https://next.backpack.tf${notif.contents.nuxtUrl}` : `https://backpack.tf${notif.contents.url}` })
        notifEmbed.setDescription(`**${notif.contents.message}**\n\nListed <t:${notif.bundle.listing.listedAt}:R> - <t:${notif.bundle.listing.listedAt}:F>\n*Bumped <t:${notif.bundle.listing.bumpedAt}:R> - <t:${notif.bundle.listing.bumpedAt}:F>*`)

        await channel.send({ embeds: [notifEmbed] })
        await delay(500)
      }
      for (let i = 0; i < notifs.length; i++) {
        if (sendTip(5, true)) await channel.send(`Too many alerts?  If so, you can always change them: <${bot.next ? 'https://next.backpack.tf/account/classifieds-alerts' : 'https://backpack.tf/alerts'}>`)
        else if (sendTip(5, false)) await channel.send(`Remember to delete your read notifcations once in a while!  <${bot.next ? 'https://next.backpack.tf/alerts' : 'https://backpack.tf/notifications'}>`)
        else if (sendTip(6, true)) await channel.send({ content: `Getting any errors?  Be sure to report them on the github, or join the discord!  <https://github.com/Cephelo/backpacktf-notifier/issues>\nJoin the discord here:`, embeds: [bot.invite] })
        else if (sendTip(6, false)) await channel.send(`Remember to check the github for updates!  <https://github.com/Cephelo/backpacktf-notifier/releases>`)
        else if (sendTip(5, true)) await bot.client.commands.get('discord').run({ bot, message, args: false })
      }
      await delay((notifs.length > checkFreq * 2 ? 500 : (checkFreq * 1000) - (500 * notifs.length)))
    }
  }
}

async function getNotifsJson(num, isCommand, channel, category, bot) {
  const fetchJson = await fetch(`https://backpack.tf/api/${category}${isCommand ? '' : '/unread'}?token=${process.env.BACKPACKTF_USER_TOKEN}`, { method: isCommand ? 'GET' : 'POST' }
  ).then((response) => {
    if (!response.ok) {
      let errorMessage = `**Status code ${response.status}**.  Here's what that means: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${response.status}> *This probably shouldn't` + shouldNot
      const hiccup = '  *If this keeps happening multiple times, the backpack.tf API might be having trouble.  If not, this was just a hiccup.*'
      const shouldNot = ` be happening, please submit an issue on the github or discord.  Use \`${bot.prefix}github\` or \`${bot.prefix}discord\`.`
      if (response.status == 401) errorMessage = '**Your backpack.tf User Token is invalid or incorrect.**  (401)'
      else if (response.status == 404) errorMessage = '**Not found.**  (404)  *This should not' + shouldNot
      else if (response.status == 408) errorMessage = '**Request timed out.**  (408)' + hiccup
      else if (response.status == 429) errorMessage = `**Too many requests.**  (429)  *You are making too many requests.  Increase the Checking Interval in the config, or turn the bot off for a while with \`${bot.prefix}kill\'; You'll have to manually restart the bot later.*`
      else if (response.status == 504) errorMessage = '**Gateway timed out.**  (504)' + hiccup
      else if (response.status == 502) errorMessage = '**Invalid response received from backpacktf.**  (502)' + hiccup
      else if (response.status == 503) errorMessage = '**Service Unavailable.**  (503)  *Something might be wrong with the backpack.tf API.*'
      else if (response.status == 500) errorMessage = '**Internal Server Error.**  (500)  *Something might be wrong with the backpack.tf API.*'

      if (sendTip(8, false)) channel.send(`${errorPings ? '<@' + bot.owner + '> ' : ''}Are you getting the same error over and over again?  If your backpack.tf User Token is valid, there could be something wrong on backpack.tf's side of things.  Check for yourself: https://status.backpack.tf\n` +
        `*If the errors are annoying, you can use the command \`${bot.prefix}ignoreerrors 10\` to stop the bot from sending error messages for 10 minutes.  You can change \`10\` to any number, but I wouldn't do more than 120.*`)
      if (Date.now() > ignoreErrors) channel.send(`${errorPings ? '<@' + bot.owner + '> ' : ''}__An error has occurred__: ${errorMessage}`)
      throw new Error(`[${Date.now()}] HTTP error! (${num}) Status: ${response.status}`);
    } else if (debug) console.log(`Response OK! (${num})`)
    return response;
  }).catch(
    err => console.error(`[${Date.now()}] ${err}`),
    err => channel.send(`${errorPings ? '<@' + bot.owner + '> ' : ''}__An error has occurred__.  *${err}*`)
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
    } else channel.send(`${errorPings ? '<@' + bot.owner + '> ' : ''}__An error has occurred while parsing notification input__: \`${error}\``)
    return undefined
  }
}

module.exports = { startLoop, stopLoop, getNotifsJson, startIgnore }
