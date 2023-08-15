module.exports = {
    name: "discord",
    desc: "Sends a link to the Official backpacktf-notifier Discord server!",
    run: async ({bot, message, args}) => {
        message.reply({ content: `**We now have a discord server!**  Join to get pinged for updates, report bugs, ` +
        `recommend or discuss new features, or just talk!  Join here: ${bot.invite}`, allowedMentions: { repliedUser: false }})
    }
}