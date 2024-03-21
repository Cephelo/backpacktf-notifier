module.exports = {
  name: "status",
  desc: "Identical to !adjusts.",
  run: async ({ bot, message, args }) => {
    bot.client.commands.get('adjusts').run({ bot, message, args })
  }
}