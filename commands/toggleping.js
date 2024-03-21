const fs = require("fs")

module.exports = {
    name: "toggleping",
    desc: "Toggles notification pings.",
    run: async ({bot, message, _}) => {
      const config = JSON.parse(require("fs").readFileSync("./config.json"))
      let bool = config.PING_USER.toUpperCase() == "TRUE"
      config.PING_USER = `${!bool}`
      const newConfig = JSON.stringify(config).replaceAll("\",","\",\n\t").replace("{","{\n\t").replace("}","\n}").replace("\":\"","\": \"")
      fs.writeFileSync("./config.json", newConfig, (err) => { if (err) console.log(err) })
      await message.reply({ content: `Notification pings have been ${!bool ? "en" : "dis"}abled.  Restarting...`, allowedMentions: { repliedUser: false }})
      process.exit(0)
    }
}