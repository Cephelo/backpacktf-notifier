const { writeFile } = require('./keepalive.js')
let sendDelay = 0

module.exports = {
    name: "messageCreate",
    run: async function runAll(bot, message) {
        const {client, prefix, owner} = bot

        if (!message.guild || message.channel.id != bot.channelId) return
        if (message.author.bot) {
          if (sendDelay < Date.now()) {
            sendDelay = parseInt(Date.now())+10000
            writeFile(true, 'Message sent.')
          }
          return 
        }
        if (!message.content.startsWith(prefix)) return

        const args = message.content.slice(prefix.length).trim().split(/ +/g)
        const cmdstr = args.shift().toLowerCase()
        let command = client.commands.get(cmdstr)
        if (!command) return message.reply({ content: `That is not a command.  Use \`${prefix}commands\` to see all my commands.`, allowedMentions: { repliedUser: false }})

        if (owner != message.member.id) return message.reply({ content: `This command is only available to <@${owner}>.`, allowedMentions: { repliedUser: false }})

        try { await command.run({bot, message, args}) } 
        catch (err) {
            let errMsg = err.toString()
            if (errMsg.startsWith("?")) await message.reply(errMsg.slice(1))
            else console.error(`[${Date.now()}] ${err}`)
        }
    }
}