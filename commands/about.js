module.exports = {
    name: "about",
    desc: "Gives some info on me and what I do.",
    run: async ({bot, message, args}) => {
        message.reply({ content: `I'll ping you on discord when you have a new backpack.tf notification.  ` + 
            `I was created by Cephelo because he got tired of checking the website all the time.  ` + 
            `You can find more info on me here!  <https://replit.com/@${process.env.REPL_OWNER}/${process.env.REPL_SLUG}#README.md>\n` + 
            `*You can also use \`${bot.prefix}commands\` to see all of my commands!*  ` + 
            `[\`Currently running version ${bot.version}\`]`, allowedMentions: { repliedUser: false }})
    }
}