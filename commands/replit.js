module.exports = {
  name: "replit",
  desc: "Identical to !repl.",
  run: async ({ bot, message, args }) => {
    bot.client.commands.get('repl').run({ bot, message, args })
  }
}