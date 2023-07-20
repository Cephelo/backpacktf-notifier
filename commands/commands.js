const fs = require("fs")

module.exports = {
    name: "commands",
    desc: "Lists all of my commands.",
    run: async ({bot, message, args}) => {
        let commandArray = []
        bot.client.commands.forEach((f) => {
            const command = require(`./commands/${f}`)
            commandArray.push(`${bot.prefix}${command.name} - ${command.desc}`)
        })
        message.reply({ content: `I have ${commandArray.length} commands:\n${commandArray.join('\n')}`, allowedMentions: { repliedUser: false }})
    }
}