module.exports = {
  name: "about",
  desc: "Identical to !help.",
  run: async ({ bot, message, args }) => {
    bot.client.commands.get('help').run({ bot, message, args: false })
  }
}