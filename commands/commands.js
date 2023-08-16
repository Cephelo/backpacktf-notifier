const ignoredCommands = ['ignoreerrors', 'status', 'replit', 'about']
const duplCommands = [['ping', 'status'], ['repl', 'replit'], ['help', 'about']]

module.exports = {
  name: "commands",
  desc: "Lists all of my commands.",
  run: async ({ bot, message, args }) => {
    let commandArray = []
    bot.client.commands.forEach((f) => {
      if (!ignoredCommands.includes(f.name)) {
        let duplicate = false
        for (const x of duplCommands) if (x[0] == f.name) duplicate = x[1]
        commandArray.push(`${commandArray.length + 1}. \`${bot.prefix}${f.name}\`${duplicate != false ? ' & \`' + bot.prefix + duplicate + '\`' : ''} - *${f.desc}*`)
      }
    })
    message.reply({ content: `I have ${commandArray.length} commands:\n${commandArray.join('\n')}`, allowedMentions: { repliedUser: false } })
  }
}