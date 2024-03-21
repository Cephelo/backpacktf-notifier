const { EmbedBuilder } = require("discord.js");
const { checkAdjustments } = require("../util/checkAdjustments.js")
const config = JSON.parse(require("fs").readFileSync("./config.json"))
const checkFreq = parseInt(config.CHECKING_INTERVAL_IN_SECONDS)
require("dotenv").config()

async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }
let ignoreErrors = 0
const debug = false
const debugTime = false

// ping settings from config
const mentions = config.PING_USER.toLowerCase() == 'false' ? false : true
const errors = config.ERROR_PINGS.toLowerCase() == 'true' ? true : false
const wakeups = config.WAKEUP_PINGS.toLowerCase() == 'true' ? true : false
function ping(bool) { return bool ? '<@' + config.YOUR_DISCORD_USER_ID + '> ' : '' }

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

async function startString(host) {
  return `${ping(wakeups)}**Waking back up!**\n*__I was just offline for a bit__.  If I ever go offline for more than 10 minutes, restart me by going to <${host}> and wait for the "I'm running!" message to pop up.  You can also restart me directly from replit.com, or the Replit mobile app.*\n__Reminder: When I detect unread notifications, they will appear as read from that point on.__\n*__Last check: <t:${(Date.now() / 1000).toString().split('.')[0]}:R>__ (Only valid for current session)*`
}

function sendTip(num, ignore) {
  return (Math.floor(Math.random() * 100) < num) && (ignore ? Date.now() > ignoreErrors : true)
}

// Check for updates
async function checkForUpdates(bot, channel) {
  let masterVersion = await fetch('http://backpacktf-notifier-public.cephelo.repl.co', { method: 'GET' }
  ).then((response) => {
    if (!response.ok) {
      console.log(`Error ${response.status}: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${response.status}`)
      throw new Error(`[${Date.now()}] HTTP error! Status: ${response.status}`);
    }
    return response.text()
  }).catch(err => console.error(`[${Date.now()}] ${err}`))
  try {
    masterVersion = masterVersion.replace('VERSION ', '').trim()
  } catch {
    masterVersion = 'undefined'
  }
  if (`${masterVersion}` != `${bot.version}` && `${masterVersion}` != 'undefined') {
    console.log(`--------\nNOTICE: There is an update available!\nLatest Version: ${masterVersion}\nCurrent Version: ${bot.version}\nFollow the instructions in the README.md file on github to update this bot!\n--------`)
    channel.send(`<@${bot.owner}> **A new version has been released!  Please update me using the instructions at <https://github.com/Cephelo/backpacktf-notifier/blob/main/README.md#updates>**\nUpdates can contain new features, fixes, and other goodies, so it's recommended to update ASAP!\n[\`Latest version: ${masterVersion}\`] - [\`Current version: ${bot.version}\`]`)
    bot.version = bot.version + ' (UPDATE AVAILABLE!)'
  } else if (`${masterVersion}` == 'undefined') console.log(`Failed to check latest BPTFNotifier version.`)
  else console.log(`Version ${masterVersion} (Up to date!)`)
}

async function startLoop(bot, channel) {
  if (checkFreq < 10 || !Number.isInteger(checkFreq)) {
    console.log(`"CHECKING_INTERVAL_IN_SECONDS" is set to ${checkFreq}, it must be 10 or more.  Shutting down.`)
    await channel.send(`<@${bot.owner}> \`CHECKING_INTERVAL_IN_SECONDS\` is set to ${checkFreq}, it must be 10 or more.  Stopping!`)
    await stopLoop(channel, bot.host, true)
  }

  // Start messages for console and discord channel
  console.log(`[${Date.now()}] Starting!\n-\nI'll check your notifs every ${checkFreq} seconds.\nYou can check manually with ${bot.prefix}check in discord.\nKeep in mind, when I detect unread notifications, they'll appear as read from that point on.\nHere are some of my commands:\n${bot.prefix}commands\n${bot.prefix}help\n${bot.prefix}discord\n-`)
  const startMessage = await channel.send(await startString(bot.host))

  await checkForUpdates(bot, channel)

  // Begin notif checks
  let notifs = undefined
  let count = 0
  let spamArray = []
  while (true) {
    const recTime = parseInt(Date.now())
    if (ignoreErrors > 0 && Date.now() > ignoreErrors) {
      console.log('Allocated time has passed, re-enabling error reporting in discord.')
      await channel.send(`${ping(errors)}**I am no longer ignoring errors, as the allocated time has passed.**`)
      ignoreErrors = 0
    }

    notifs = await getNotifsJson(`#${count++}`, false, 'post', channel, 'notifications/unread', bot)
    spamArray = await checkAdjustments(bot, channel)
    // const delAmount = parseInt(spamArray.pop())
    const spamTime = parseInt(Date.now()) - recTime

    // actual notif checking
    await startMessage.edit(await startString(bot.host))
    if (notifs != null) {
      /* Debug */ if (debug) console.log(`${notifs.length} unread notification${notifs.length == 1 ? '' : 's'}. (#${i + 1})`)
      if (notifs.length > 0) {
        let haveNotifMessage = [`${ping(mentions)}You have ${notifs.length == 1 ? 'a backpack.tf notification' : notifs.length + ' backpack.tf notifications'}!`]
        for (const notif of notifs) {
          let mesAmount = notif.bundle.listing.value.short
          if ((notif.contents.message.includes(' keys, $') || notif.contents.message.includes(' 1.00 key, ')) && !notif.contents.message.includes('Mann Co. Supply Crate Key')) {
            mesAmount = notif.contents.message.split(', ').find(x => x.includes('key'))
          }
          let baseName = notif.bundle.listing.item.name
          if (baseName.includes('The')) baseName = baseName.replace('The ', '')
          const headersRemove = ['Taunt', 'Strange Part']
          for (const x of headersRemove) if (baseName.includes(`${x}:`)) baseName = `${baseName.replace(`${x}: `, '')} ${x}`
          haveNotifMessage.push(`> ${notif.bundle.listing.intent.substr(0, 1).toUpperCase()}${notif.bundle.listing.intent.substr(1)}ing: ${baseName} for ${mesAmount}`)
        }
        for (const line of haveNotifMessage) {
          const copiesArray = haveNotifMessage.filter(x => x == line)
          if (copiesArray.length > 1) {
            haveNotifMessage[haveNotifMessage.indexOf(line)] = line + ` \`[${copiesArray.length}]\``
            haveNotifMessage = haveNotifMessage.filter(x => x != line)
          }
        }

        haveNotifMessage = haveNotifMessage.join("\n")
        if (haveNotifMessage.length > 1999) haveNotifMessage = haveNotifMessage.substr(0, 1999)
        await startMessage.reply(haveNotifMessage)
      }
      for (const notif of notifs) {
        const list = notif.bundle.listing
        let colorInit = notif.contents.subject.toUpperCase().includes('LISTING') ? 'X' : 0x233246/*Non-listing alert, ex: thread*/
        if (colorInit == 'X') colorInit = ((list.intent == 'sell') == bot.next) ? 0x0c8cc3/*5b8baf*/ : 0x389902/*5d9a4b*/
        let subject = `[**__${notif.contents.subject}__**](${bot.next ? `https://next.backpack.tf` + notif.contents.nuxtUrl : `https://backpack.tf` + notif.contents.url})`
        if (notif.contents.subject.includes('listing removed')) subject = `**__${notif.contents.subject}__**`
        const order = notif.contents.message.includes(" (") ? notif.contents.message.split(" (")[1].split(" ")[0].toUpperCase() : notif.contents.message.split(" listing")[0].replace("A ", "").toUpperCase()
        const prices = notif.contents.message.split(" for ")[1].split(" (")[0]

        let notifEmbed = {
          title: list.item.name,
          color: colorInit,
          author: {
            name: notif.targetUser.name,
            iconURL: notif.targetUser.avatar,
            url: bot.next ? `https://next.backpack.tf/profiles/${notif.userId}/listings` : `https://backpack.tf/classifieds?steamid=${notif.userId}`
          },
          description: `\n**__${order}ING__ for ${prices}**\n\n${subject}\nListed <t:${list.listedAt}:R> - <t:${list.listedAt}:F>\n*Bumped <t:${list.bumpedAt}:R> - <t:${list.bumpedAt}:F>*`,
          url: bot.next ? 'https://next.backpack.tf/alerts' : 'https://backpack.tf/notifications',
          thumbnail: { url: list.item.imageUrl.includes('steamcdn') ? list.item.imageUrl : `https://backpack.tf${list.item.imageUrl}` },
          footer: { text: list.details == undefined ? "*No Message.*" : list.details }
        }

        try { await channel.send({ embeds: [notifEmbed] }) }
        catch (e) { console.log(e) }
        await delay(500)
      }

      try {
        if (spamArray[0].length > 0) {
          // let notifEmbed = new EmbedBuilder()
          // notifEmbed.setColor(0xFFFF00)
          // notifEmbed.setDescription(`**${delAmount}** notifications removed to clear spam.`)
          // await channel.send({ embeds: [notifEmbed] })
          // await delay(500)

          for (let i = 0; i < spamArray[0].length; i++) {
            let notifEmbed = new EmbedBuilder()
            notifEmbed.setColor(0xFFFF00)
            notifEmbed.setTitle("An alert adjustment was made for:")
            notifEmbed.setThumbnail(spamArray[1][i])
            notifEmbed.setDescription(`\`${spamArray[0][i]}\``)

            await channel.send({ embeds: [notifEmbed] })
            await delay(500)
          }
        }
      } catch (e) {
        console.error(e)
        console.log("Could not iterate through spamArray.")
      }

      if (sendTip(5 * notifs.length, true)) await channel.send(`Too many alerts?  If so, you can always change them: <${bot.next ? 'https://next.backpack.tf/account/classifieds-alerts' : 'https://backpack.tf/alerts'}>`)
      else if (sendTip(5 * notifs.length, false)) await channel.send(`Remember to delete your read notifcations once in a while!  <${bot.next ? 'https://next.backpack.tf/alerts' : 'https://backpack.tf/notifications'}>`)
      else if (sendTip(6 * notifs.length, true)) await channel.send({ content: `Getting any errors?  Be sure to report them on the github, or join the discord!  <https://github.com/Cephelo/backpacktf-notifier/issues>\nJoin the discord here:`, embeds: [bot.invite] })
      else if (sendTip(6 * notifs.length, false)) await channel.send(`Remember to check the github for updates!  <https://github.com/Cephelo/backpacktf-notifier/releases>`)
      else if (sendTip(5 * notifs.length, true)) await bot.client.commands.get('discord').run({ bot, message: { channel }, args: false })

      //await delay(((notifs.length + spamArray.length) > checkFreq * 2 ? 500 : (checkFreq * 1000) - (500 * (notifs.length + spamArray.length))))
      const totalTime = parseInt(Date.now()) - recTime
      /* Debug */ if (debugTime) console.log(`#${count}. Adjusts: ${spamTime}ms, Embeds: ${500 * (notifs.length + spamArray[0].length)}ms, Remainder: ${totalTime - ((500 * (notifs.length + spamArray[0].length)) + spamTime)}ms, Total: ${totalTime}ms`)
      await delay((parseInt(Date.now()) - recTime) > (checkFreq * 1000) - 500 ? 500 : (checkFreq * 1000) - (parseInt(Date.now()) - recTime))
    }
  }
}

async function getNotifsJson(num, isCommand, method, channel, link, bot) {
  const fetchJson = await fetch(`https://backpack.tf/api${link == '' ? '' : '/'}${link}${link.includes('?') ? '&' : '?'}token=${process.env.BACKPACKTF_USER_TOKEN}`, { method: method.toUpperCase(), headers: { 'Content-Type': (num == "adjustAlert" ? "application/x-www-form-urlencoded" : "application/json") } }
  ).then((response) => {
    if (!response.ok) {
      const shouldNot = ` be happening, please submit an issue on the github or discord.  Use \`${bot.prefix}github\` or \`${bot.prefix}discord\`.*`
      let errorMessage = `**Status code ${response.status}**.  Here's what that means: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${response.status}> *This probably shouldn't` + shouldNot
      const hiccup = '  *If this keeps happening multiple times, the backpack.tf API might be having trouble.  If not, this was just a hiccup.*'
      const errorLink = `Broken link: \`https://backpack.tf/api${link == '' ? '' : '/'}${link}${link.includes('?') ? '&' : '?'}token=BPTFTOKENHERE\` [\`${method.toUpperCase()}\`]`

      switch (response.status) {
        case 401: { errorMessage = `**Your backpack.tf User Token is invalid or incorrect.** (401)  *${errorLink}*`; break; }
        case 404: { errorMessage = `**Not found.** (404)  *This should not${shouldNot}  *${errorLink}*`; break; }
        case 408: { errorMessage = '**Request timed out.** (408)' + hiccup; break; }
        case 429: { errorMessage = `**Too many requests.** (429)  *You are making too many requests.  Increase the Checking Interval in the config, or turn the bot off for a while with \`${bot.prefix}kill\'; You'll have to manually restart the bot later.*`; break; }
        case 504: { errorMessage = '**Gateway timed out.** (504)' + hiccup; break; }
        case 502: { errorMessage = '**Invalid response received from backpacktf.**  (502)' + hiccup; break; }
        case 503: { errorMessage = '**Service Unavailable.** (503)  *Something might be wrong with the backpack.tf API.*'; break; }
        case 500: { errorMessage = '**Internal Server Error.** (500)  *Something might be wrong with the backpack.tf API.*'; break; }
        case 400: { errorMessage = `**Bad Request.** (400)  *This needs to be fixed in the code. ${errorLink}*`; break; }
      }

      if (sendTip(8, false)) channel.send(`${ping(errors)}Are you getting the same error over and over again?  If your backpack.tf User Token is valid, there could be something wrong on backpack.tf's side of things.  Check for yourself: https://status.backpack.tf\n` +
        `*If the errors are annoying, you can use the command \`${bot.prefix}ignoreerrors 10\` to stop the bot from sending error messages for 10 minutes.  You can change \`10\` to any number, but I wouldn't do more than 120.*`)
      if (Date.now() > ignoreErrors) channel.send(`${ping(errors)}__An error has occurred__: ${errorMessage}`)
      throw new Error(`[${Date.now()}] HTTP error! (${num}) Status: ${response.status}`);
    } else if (debug) console.log(`Response OK! (${num})`)
    return response;
  }).catch(
    err => console.error(`[${Date.now()}] ${err}`),
    err => channel.send(`${ping(errors)}__An error has occurred__.  *${err}*`)
  )

  try {
    //* Debug */ if (debug) console.log(`fileJson (${num}): ${JSON.stringify(await fetchJson.json())}`)
    return await fetchJson.json()
  } catch (error) {
    if (!error.toString().includes("TypeError: Cannot read properties of undefined (reading 'json')")) {
      console.log(`[${Date.now()}] Error parsing JSON:`)
      console.error(error)
    } else console.log(`[${Date.now()}] Error parsing JSON: [TypeError: Cannot read properties of undefined (reading 'json')]`)
    if (num.includes("#")) {
      if (fetchJson == undefined) {
        console.log('Notifications have returned as undefined.  The error can be seen above.')
        if (Date.now() > ignoreErrors) {
          const failMessage = await channel.send(`Notifications have returned as undefined.  ${isCommand ? '*Try the command again.  If there is not another error message, ' +
            'this was just a hiccup.*' : '__Retrying ' + `<t:${((Date.now() / 1000) + checkFreq + 2).toString().split('.')[0]}:R>` + '...__'}`)
          if (!isCommand) {
            await delay(checkFreq * 1000)
            await failMessage.edit('*~~Notifications have returned as undefined.~~*  __Retry attempted__.  *If there is not another error message, the attempt was successful, and this was just a hiccup.*')
          }
        } else if (!isCommand) await delay(checkFreq * 1000)
      } else channel.send(`${ping(errors)}__An error has occurred while parsing notification input__: \`${error}\``)
    }
    return null
  }
}

module.exports = { startLoop, stopLoop, getNotifsJson, startIgnore, ping }