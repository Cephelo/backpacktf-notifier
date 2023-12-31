# backpacktf-notifier
Greetings!  Welcome to **backpacktf-notifier**, a discord bot that pings you when you have a new backpack.tf notification.
The bot will automatically check for unread notifications every 30 seconds by default!
__Note: You don't need to download anything from github, just follow the tutorial below__.

### Current Version: 2.0.0

# Setup
First of all, you'll need to make your own discord application, and a couple accounts.

### 1. Create a Discord Application
First, we need to create the actual discord bot.

Go to https://discord.com/developers/applications and click "New Application" in the top right.  Nname the app whatever you want.

Once you've made an application, navigate to the "Bot" tab on the left sidebar, scroll down, and enable the "MESSAGE CONTENT INTENT" switch.

### 2. Add the bot to your server
Navigate to the "OAuth2" tab on the left sidebar, and click "URL Generator".

In the first group of checkboxes titled "SCOPE", select "bot" and "applications.commands".  Nothing else.

In the second group of checkboxes titled "BOT PERMISSIONS", select the following: "Read Messages/View Channels", "Send Messages", "Embed Links".

Then copy the Generated URL at the bottom of the page and paste it into your browser.

This will prompt you to choose which server of yours the bot will join.  I recommend making your own server with just you and the bot in it, since it's easy.

### 3. Replit and Config
Replit is the service we will use to host the discord bot.  This will ensure you don't need to keep your device running to keep the bot online.  With replit, the bot should be online at least 95% of the time.

Make a [Replit](https://replit.com/signup) account, if you don't already have one.

Once that's done, go to [the public backpacktf-notifier Replit project](https://replit.com/@Cephelo/backpacktf-notifier-public) and click "Fork".

When everything has loaded, click the file "config.json" on the left sidebar.  This is where you will enter your Discord User ID, Server ID, and Channel ID.

Go to Discord and copy your User ID by right-clicking your profile picture and clicking "Copy User ID".  __If you don't see this option, enable "Developer Mode" in your Discord Settings.__  Paste your User ID into the empty "YOUR_DISCORD_USER_ID" field, inside the quotes.

Copy the Server ID of the server you made in Step 5 by right-clicking the server's icon and clicking "Copy Server ID".  Paste the Server ID into the empty "YOUR_DISCORD_SERVER_ID" field, inside the quotes.

Choose (or create) the channel you'll want the bot to put pings in, and copy its Channel ID by right-clicking the channel name and clicking "Copy Channel ID".  Paste the Server ID into the empty "YOUR_DISCORD_CHANNEL_ID" field, inside the quotes.

Then save the config.json file by pressing CTRL+S (CMD+S on mac).

### 3a. Additional Settings
You can also change some additional settings: 

If you'd like, you can also change some additional configuration settings:
- "PING_USER" is a true/false option, and changes whether the bot will actually ping you with notifications, or just send a message.  This is in case you want to set the channel's notification settings to "All Messages" and don't need the extra ping.  True by default.
- "ERROR_PINGS" is a true/false option, and changes whether the bot will ping you when errors occur.  False by default.
- "WAKEUP_PINGS" is a true/false option, and changes whether the bot will ping you every time it wakes up.  False by default.
- "DISCORD_PREFIX" will be the prefix for the commands you use in discord to control the bot.
- "NEXT" is a true/false option, and changes whether the bot will link to the classic backpack.tf site (false), or the beta next.backpack.tf site (true).  False by default.
- "CHECKING_INTERVAL_IN_SECONDS" is how often the bot will ping the backpack.tf classifieds API.  *I recommend keeping this value at 30 or higher.*

If you changed any of these, save the config.json file again.

### 4. Tokens
Now, click the "Tools" tab near the bottom left corner, and then the "Secrets" button.  

Here you will enter some tokens and keys that the bot requires to function.  DO NOT SHARE THESE ANYWHERE ELSE.

Click the three dots on the right of each secret, then "Edit" to enter them.  Be sure to save each one.

If you ever reset any of your Tokens or Keys, you'll need to update them here too.

#### 4a. DISCORD_BOT_TOKEN
Go back to https://discord.com/developers/applications and click on your bot, then navigate back to the "Bot" tab on the left sidebar.

Copy your TOKEN, which can be seen under the bot's username.  If you only see a "Reset Token" button, click it and copy the token that shows up.

Paste this TOKEN into the "DISCORD_BOT_TOKEN" secret, and click the blue save button.

#### 4b. BACKPACKTF_USER_TOKEN
Go to https://backpack.tf/connections and copy your User Token.  Paste your User Token into the "BACKPACKTF_USER_TOKEN" secret, and click the blue save button.

### 5. Starting the bot
Now we can start the bot.  Click the green "Run" button and watch the console on the right of the screen.  Once the console says "READY!" and you get a ping in the channel you put in the config, you're all set!  The bot will now automatically start checking for unread backpack.tf notifications, even if your computer is off.  It is important to note:  __When the bot detects unread notifications, it will mark them as read.__

# Updates
Occasionally, I may release an update to the bot that adds new features, fixes, or the like.  In such a case, I recommend updating ASAP when a new update comes out.  To accomplish this, all you need to do is re-fork the master repl and reconfigure your secrets and config settings.  Just start from Step 3 as seen above.

You may not have to follow those steps exactly; you could just manually copy over your secrets and config settings from your old repl to the new fork instead.  Do not copy the entire config.json file though, as if the update adds any new config settings, the config.json text you just copied will not have these options, which may cause problems.  Just copy your custom config settings over individually.

Do note that in the event more required Secrets are added in an update, you'll have to follow the revised Steps above to get the necessary information for them.

To re-fork the master repl, go to [the public backpacktf-notifier Replit project](https://replit.com/@Cephelo/backpacktf-notifier-public) and click "Fork".

## If you need help, have any questions, feedback or suggestions, or just wanna talk, feel free to open an Issue on github, or join the [discord server](https://github.com/Cephelo/backpacktf-notifier/discussions/2).
Thanks for visiting!
