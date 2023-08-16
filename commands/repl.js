module.exports = {
  name: "repl",
  desc: "Links to both the official repl, your personal repl, and your repl's restart link.",
  run: async ({ bot, message, args }) => {
    message.reply({ content: `Your personal repl: <https://replit.com/@${process.env.REPL_OWNER}/${process.env.REPL_SLUG}>\nThe public master repl: <https://replit.com/@Cephelo/backpacktf-notifier-public>\nYour restart link: <${bot.host}> *(Click this if I go offline for more than 10 minutes.)*`, allowedMentions: { repliedUser: false } })
  }
}