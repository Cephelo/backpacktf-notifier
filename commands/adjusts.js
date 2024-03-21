const { EmbedBuilder } = require("discord.js");
const fs = require("fs")

async function generateEmbed() {
  try {
    const adjustments = fs.readFileSync(`./util/logs/adjustments.txt`)
    const adjustmentsA = adjustments.toString().split("\n")
    let title = adjustmentsA.splice(0, 1)[0]
    for (let i = 0; i < adjustmentsA.length; i++) {
      adjustmentsA[i] = `**${i + 1}.** \`${adjustmentsA[i].split(" @ ")[0].replace('A buy order listing for ', '').replace('- listed for', 'at')}\` (<t:${parseInt(parseInt(adjustmentsA[i].split(" @ ")[1]) / 1000)}:R>)`
    }
    let desc = adjustmentsA.join("\n")
    if (desc.length > 4096) desc = desc.substring(desc.length - 4096).split("\n").splice(1).join("\n")

    let notifEmbed = new EmbedBuilder()
    notifEmbed.setColor(0xFFFF00)
    notifEmbed.setTitle(title)
    notifEmbed.setDescription(desc == '' ? 'None' : desc)

    return [notifEmbed]
  } catch (e) { console.log(e); return [] }
}

module.exports = {
  name: "adjusts",
  desc: "Returns all adjustments from the past 24 hours.",
  run: async ({ bot, message, args }) => {
    try {
      const argument = args.toString().toUpperCase()
      if (argument.includes("CLEAR")) {
        const notifEmbed = await generateEmbed()
        fs.writeFileSync('./util/logs/adjustments.txt', "ALERT ADJUSTMENTS MADE IN THE PAST 24 HOURS", (err) => { if (err) console.log(err) })
        await message.reply({ content: "Cleared adjustment log. *Previous log:*", embeds: notifEmbed })
      } else if (argument.includes("MARK")) {
        const adjustments = fs.readFileSync(`./util/logs/adjustments.txt`)
        fs.writeFileSync('./util/logs/adjustments.txt', adjustments + `\nMARK @ ${Date.now()}`, (err) => { if (err) console.log(err) })
        const notifEmbed = await generateEmbed()
        await message.reply({ content: "Mark applied. *Log:*", embeds: notifEmbed })
      } else await message.reply({ embeds: await generateEmbed() })
    } catch (e) { console.log(e) }
  }
}