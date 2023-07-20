module.exports = {
    name: "messageCreate",
    run: async function runAll(bot, message) {
        const {client, prefix, owner} = bot

        if (!message.guild || message.author.bot) return
        if (!message.content.startsWith(prefix)) return

        const args = message.content.slice(prefix.length).trim().split(/ +/g)
        const cmdstr = args.shift().toLowerCase()
        let command = client.commands.get(cmdstr)
        if (!command) return

        if (owner != message.member.id) return message.reply({ content: `This command is only available to <@${owner}>.`,
            allowedMentions: { repliedUser: false }})

        try { await command.run({bot, message, args}) } 
        catch (err) {
            let errMsg = err.toString()
            if (errMsg.startsWith("?")) await message.reply(errMsg.slice(1))
            else console.error(`[${Date.now()}] ${err}`)
        }
    }
}