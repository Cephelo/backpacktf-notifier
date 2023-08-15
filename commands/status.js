const { run } = require('./ping.js')

module.exports = {
    name: "status",
    desc: "Identical to !ping.",
    run: async ({bot, message, args}) => {
        let command = bot.client.commands.get('ping')
        await command.run({bot, message, args: false})
    }
}