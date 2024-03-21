const { getNotifsJson, ping } = require("../util/notif-loop.js")
const config = JSON.parse(require("fs").readFileSync(`./config.json`))
const refreshbp = config.REFRESHBP_PINGS.toLowerCase() == 'false' ? false : true

// refreshbp variables
let checkingBackpack = false
const sendRefresh = true // true to send refresh request, false to check status without refreshing
const debugTimeData = 1 // 2 = Extended update debug info, 1 = Basic refresh fail messages, 0 = Nothing
const autoDisableDefault = false

function timeVar(t) { return `<t:${t}:d> <t:${t}:T> (<t:${t}:R>)` } // Debug
async function checkBackpack(message, bot, cmdName, autoDisable) {
  checkingBackpack = !checkingBackpack
  await message.reply(`${checkingBackpack ? 'En' : 'Dis'}abling backpack checking loop.  *Use \`${bot.prefix}${cmdName}\` again to ${checkingBackpack ? 'dis' : 're-en'}able.  __Note__: This will not stay enabled upon restart.*`)
  const steamID = (await getNotifsJson(`${cmdName}BptfC`, true, 'get', message.channel, '', bot)).user.id
  if (checkingBackpack) {
    while (checkingBackpack) {
      const times = await getNotifsJson(cmdName, false, sendRefresh ? 'post' : 'get', message.channel, `inventory/${steamID}/${sendRefresh ? 'refresh' : 'status'}`, bot)
      /* Debug */ if (debugTimeData == 2) {
        await message.channel.send(`__Refresh attempted <t:${parseInt(parseInt(Date.now()) / 1000)}:R>.__\n` +
          `> Current Time: ${timeVar(times.current_time)}\n> Last Update: ${timeVar(times.last_update)}\n` +
          `> Next Update: ${timeVar(times.next_update)}\n> Update Interval: \`${times.refresh_interval} seconds\``)
      }
      if (times.current_time - times.last_update < times.refresh_interval * 1.9) {
        await message.channel.send(`${ping(refreshbp)}Your inventory has loaded!  Make any sell listings you need to now, before the fallback is lost! **<https://${bot.next ? 'next.' : ''}backpack.tf/profiles/${steamID}>**${autoDisable == autoDisableDefault ? '\n> *Use `' + bot.prefix + cmdName + '` again to disable this.*' : ''}`)
        if (!autoDisable == autoDisableDefault) {
          checkingBackpack = false
          await message.channel.send(`Automatically disabling backpack checking loop. *Use \`${bot.prefix}${cmdName}\` again to re-enable.  __Note__: This will not stay enabled upon restart.*`); break
        }
      } else if (debugTimeData == 1) await message.channel.send(`*Refresh attempt failed, trying again <t:${parseInt(times.current_time) + parseInt(times.refresh_interval) + 2}:R>.*`)
      await delay(parseInt(times.refresh_interval) * 1000) // Every 3 minutes (as of 9/15/2023)
      // check if any sell orders have been made
    }
  }
}

module.exports = { checkBackpack }
