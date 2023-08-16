module.exports = {
  name: "github",
  desc: "Links to the official github repository.  Use this to report bugs or talk with my creators.  Maybe I have an update!",
  run: async ({ bot, message, args }) => {
    await message.reply({
      content: `*Oh look, my vital organs!  :)*  https://github.com/Cephelo/backpacktf-notifier/tree/main *[\`Currently running version ${bot.version}\`]*\n`, allowedMentions: { repliedUser: false }
    })
    bot.client.commands.get('discord').run({ bot, message, args: 'short' })
  }
}