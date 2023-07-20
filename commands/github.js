module.exports = {
    name: "github",
    desc: "Links to the official github repository.  Use this to report bugs or talk with my creators.  Maybe I have an update!",
    run: async ({bot, message, args}) => {
        message.reply({ content: `<https://github.com/Cephelo/backpacktf-notifier/tree/main> *Oh look, my vital organs!  :)*`, allowedMentions: { repliedUser: false }})
    }
}