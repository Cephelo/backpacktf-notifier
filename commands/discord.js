module.exports = {
    name: "discord",
    desc: "Sends a link to the Official backpacktf-notifier Discord server!",
    run: async ({bot, message, args}) => {
      if (args != false && args != 'short') args = true
      const discord = args == 'short' ? '*__We also have a discord server__!  Join here:*' : '**We now have a discord server!**  Join here:'
      if (args == true) message.reply({ content: discord, embeds: [bot.invite], allowedMentions: { repliedUser: false }})
      else message.channel.send({ content: discord.replaceAll('**', ''), embeds: [bot.invite] })
    }
}