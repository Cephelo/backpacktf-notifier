const fs = require("fs")

module.exports = {
    name: "commands",
    desc: "Lists all of my commands.",
    run: async ({bot, message, args}) => {
        let commandArray = []
        bot.client.commands.forEach((f) => {
            commandArray.push(`${commandArray.length+1}. \`${bot.prefix}${f.name}\` - *${f.desc}*`)
        })
        message.reply({ content: `I have ${commandArray.length} commands:\n${commandArray.join('\n')}`, allowedMentions: { repliedUser: false }})
    }
}