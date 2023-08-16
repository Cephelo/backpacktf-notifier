module.exports = {
  name: "status",
  desc: "Identical to !ping.",
  run: async ({ bot, message, args }) => {
    bot.client.commands.get('ping').run({ bot, message, args: false })
  }
}