const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const fs = require("fs")
const config = JSON.parse(fs.readFileSync(`./config.json`))
require("dotenv").config()

if (config.YOUR_DISCORD_USER_ID == '' || process.env.DISCORD_BOT_TOKEN == '' || process.env.BACKPACKTF_USER_TOKEN == '' ||
  config.CHECKING_INTERVAL_IN_SECONDS == '' || config.DISCORD_PREFIX == '' || config.YOUR_DISCORD_SERVER_ID == '') {
  console.log('WARNING: A REQUIRED CONFIG VALUE IS MISSING!  Go to the .env file and add the missing information.')
  console.log('WARNING: A REQUIRED CONFIG VALUE IS MISSING!  Go to the .env file and add the missing information.')
  console.log('WARNING: A REQUIRED CONFIG VALUE IS MISSING!  Go to the .env file and add the missing information.')
  console.log('Once you have added the missing information, you can restart the bot.')
  process.exit(0)
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
  ]
})

const package = JSON.parse(fs.readFileSync(`./package.json`))
let bot = {
  client,
  prefix: config.DISCORD_PREFIX,
  owner: config.YOUR_DISCORD_USER_ID,
  version: package.version,
  invite: '3jfm6XuhyN',
  next: config.NEXT.toString().toLowerCase() == 'true',
  channel: config.YOUR_DISCORD_CHANNEL_ID,
}


const { createServer } = require("./util/keepalive.js")
createServer()

// Load messageCreate.js event
const event = require(`./util/messageCreate.js`)
client.on("messageCreate", (message) => {
  try { event.run(bot, message) }
  catch (err) { console.error(`[${Date.now()}] ${err}`) }
})
console.log('Initialized messageCreate.js')

// Load commands
client.commands = new Collection()
let commands = fs.readdirSync(`./commands`).filter(f => f.endsWith(".js")) // getFiles
commands.forEach((f) => {
  const command = require(`./commands/${f}`)
  client.commands.set(command.name, command)
})
console.log(`Loaded ${client.commands.size} commands`)

client.on("ready", async () => {
  console.log(`Discord.js version: ${require('discord.js').version}`)
  console.log(`backpacktf-notifier version: ${package.version}`)
  console.log("Logged in as " + bot.client.user.tag)

  const guild = client.guilds.cache.get(config.YOUR_DISCORD_SERVER_ID) // guildId
  if (!guild) return console.error("Target guild not found")

  console.log(`READY!\nHere are some of my commands you can type in discord:\n\t${bot.prefix}commands\n\t${bot.prefix}help\n\t${bot.prefix}start\n\t${bot.prefix}stop`)
})

client.login(process.env.DISCORD_BOT_TOKEN)