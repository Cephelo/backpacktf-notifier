module.exports = {
    name: "help",
    desc: "Links to the \`README.md\` file, which acts as an installation tutorial.",
    run: async ({bot, message, args}) => {
        message.reply({ content: `Need some help?  Here\'s all the info you need: <https://github.com/Cephelo/backpacktf-notifier/tree/main/README.md>\n` + 
            `*You can also use \`${bot.prefix}commands\` to see all of my commands!  __We also have a discord server__!  Join here: <${bot.invite}>*`,
            allowedMentions: { repliedUser: false }})
    }
}