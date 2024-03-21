const { checkBackpack } = require('../util/checkBackpack.js')
const keywords = ["true", "yes", "y", "1"]
module.exports = {
  name: "refreshbp",
  desc: "Toggles a loop that will check your backpack.tf inventory is loading.  Use if you're constantly seeing 'Unexpected Error (400)' and need to sell something.",
  run: async ({ bot, message, args }) => {
    checkBackpack(message, bot, module.exports.name, args[0] == undefined ? false : keywords.includes(args[0].toLowerCase()))
  }
}