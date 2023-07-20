const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");

require("dotenv").config()

if (process.env.YOUR_DISCORD_USER_ID == '' || process.env.DISCORD_BOT_TOKEN == '' || process.env.BACKPACKTF_USER_TOKEN == '' || 
	process.env.CHECKING_INTERVAL_IN_SECONDS == '' || process.env.DISCORD_PREFIX == '') {
		console.log('WARNING: A REQUIRED CONFIG VALUE IS MISSING!  Go to the .env file and add the missing information.')
		console.log('WARNING: A REQUIRED CONFIG VALUE IS MISSING!  Go to the .env file and add the missing information.')
		console.log('WARNING: A REQUIRED CONFIG VALUE IS MISSING!  Go to the .env file and add the missing information.')
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

let bot = {
	client,
	prefix: process.env.DISCORD_PREFIX,
	owner: process.env.YOUR_DISCORD_USER_ID
}

// Load messageCreate.js event
const event = require(`./util/messageCreate.js`)
client.on("messageCreate", (message) => {
	try { event.run(bot, message) }
	catch(err) { console.error(err) }
})
console.log('Initialized messageCreate.js')

// Load commands
const fs = require("fs")
client.commands = new Collection()
let commands = fs.readdirSync(`./commands`).filter(f=> f.endsWith(".js")) // getFiles
commands.forEach((f) => {
	const command = require(`./commands/${f}`)
	client.commands.set(command.name, command)
})
console.log(`Loaded ${client.commands.size} commands`)

client.on("ready", async () => {
	console.log(`Discord.js version: ${require('discord.js').version}`)
	console.log("Logged in as " + bot.client.user.tag)
    
    const guild = client.guilds.cache.get('673072697957154826') // guildId
    if (!guild) return console.error("Target guild not found")

	console.log(`READY!\nHere are some of my commands you can type in discord:\n\t${bot.prefix}commands\n\t${bot.prefix}help\n\t${bot.prefix}start\n\t${bot.prefix}stop`)
})

client.login(process.env.DISCORD_BOT_TOKEN)