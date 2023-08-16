module.exports = {
  name: "help",
  desc: "Links to an installation tutorial, and gives some info on me and what I do.",
  run: async ({ bot, message, args }) => {
    await message.reply({
      content: `I'll ping you on discord when you have a new backpack.tf notification.  I was created by Cephelo because he got tired of checking the website all the time.\n` +
        `Need some help?  You can find more info on me here: <https://github.com/Cephelo/backpacktf-notifier/tree/main/README.md>\n` +
        `*You can also use \`${bot.prefix}commands\` to see all of my commands!  [\`Currently running version ${bot.version}\`]*`, allowedMentions: { repliedUser: false }
    })
    bot.client.commands.get('discord').run({ bot, message, args: 'short' })
  }
}