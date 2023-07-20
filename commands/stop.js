module.exports = {
    name: "stop",
    desc: "Turns me off.",
    run: async ({bot, message, args}) => {
        console.log('Stop command received, shutting down.')
        await message.reply({ content: 'Stopping!', allowedMentions: { repliedUser: false }})
        process.exit(0)
    }
}