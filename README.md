# backpacktf-notifier
Greetings!  Welcome to **backpacktf-notifier**, a discord bot that pings you when you have a new backpack.tf notification.
The bot will automatically check for unread notifications every 30 seconds by default!

### Current Version: 1.1.2

# Setup
First of all, you'll need to make your own discord application.  Here's how:

### 1. Check if you have the correct version of NodeJS.
Open the Terminal and type "node -v" without the quotes.  If you have v16.0.0 or higher, go to step 2.

If you have lower than v16.0.0 or get an error, install NodeJS from here: https://nodejs.org/en/download/

### 2. Install Virtual Studio Code
If you don't already have it, you can get it here: https://code.visualstudio.com/download

### 3. Download the source code
Download the latest source code release from the releases tab on the right, and unzip the file - you should now have a folder called "backpacktf-notifier-Version-1.1.2 (or something like that).

Move that folder to wherever you like, preferably somewhere easily accessible.

### 4. Create a Discord Application
First, go to https://discord.com/developers/applications

Then click "New Application" in the top right, name it whatever you want.

Once you've made an application, navigate to the "Bot" tab on the left sidebar, scroll down, and enable the "MESSAGE CONTENT INTENT" switch.

### 5. Add the bot to your server
Navigate to the "OAuth2" tab on the left sidebar, and click "URL Generator".

In the first group of checkboxes titled "SCOPE", select "bot" and "applications.commands".  Nothing else.

In the second group of checkboxes titled "BOT PERMISSIONS", select the following: "Read Messages/View Channels", "Send Messages", "Embed Links".

Then copy the Generated URL at the bottom of the page and paste it into your browser.

This will prompt you to choose which server of yours the bot will join.  I recommend making your own server with just you and the bot in it, since it's easy.

### 6. Open the folder in VSCode
Open VSCode and then open the folder we unzipped in Step 3.  File > Open Folder > (Select the folder you just unzipped) > Open

Then click the document icon in the top left to enter VSCode's File Explorer, if it's not already open.

Select the file titled ".env"

### 7. Adding required Discord info
Navigate back to the "Bot" tab on the left sidebar, like in Step 4.

Copy your TOKEN, which can be seen under the bot's username.  If you only see a "Reset Token" button, click it and copy the token that shows up.  Do not share this token anywhere else.

Paste the TOKEN into the "DISCORD_BOT_TOKEN" field in the .env file you should see in VSCode's File Explorer.  If you ever reset your Bot Token, you'll need to update it here too.

Go to Discord and copy your User ID by right-clicking your profile picture.  If you don't see this option, enable "Developer Mode" in your Discord Settings.

Paste your User ID into the "YOUR_DISCORD_USER_ID" field in the .env file.

Go to Discord and copy the Server ID of the server you made in Step 5 by right-clicking the server's icon.  Paste the Server ID into the "YOUR_DISCORD_SERVER_ID" field in the .env file.

### 8. Adding your backpack.tf user token
Go to https://backpack.tf/connections and copy your User Token.  Do not share this token anywhere else.

Paste your User Token into the "BACKPACKTF_USER_TOKEN" field in the .env file you should see in VSCode's File Explorer.  If you ever generate a new User Token, you'll have to update it here too.


If you'd like, you can also change some additional configuration settings:
- "CHECKING_INTERVAL_IN_SECONDS" is how often the bot will ping the backpack.tf classifieds API.  I recommend keeping this value at 30 or higher.
- "PING_USER" is a true/false option, and changes whether the bot will actually ping you with notifications, or just send a message.  This is in case you want to set the channel's notification settings to "All Messages" and don't need the extra ping.  True by default.
- "DISCORD_PREFIX" will be the prefix for the commands you use in discord to control the bot.
- "NEXT" is a true/false option, and changes whether the bot will link to the classic backpack.tf site (false), or the beta next.backpack.tf site (true).  False by default.

Once you're done, it is important you save the .env file.  Do not change ANYTHING else besides those six settings, unless you know what you are doing.

### 9. Starting the bot
Open the Terminal in VSCode.  Terminal > New Terminal

First, we need to install two libraries.  These are required for the bot to work.

Type the following text in the Terminal: "npm i discord.js", then hit Enter.  Wait for the process to be complete (roughly 10-20 seconds).

Type the following text in the Terminal: "npm i dotenv", then hit Enter.  Wait for the process to be complete (roughly 5-10 seconds).

Now we can start the bot.  Type the following text in the Terminal: "node index", then hit Enter.

Once the Terminal says "Ready!", navigate to the Discord server you added the bot to in Step 5.

### 10. Using the bot!
If you've followed the above steps correctly, you should now be able to use the bot.  When the bot starts up, the Terminal should say some commands you can use in Discord, such as !start.

And that's it!  You should now get pings for your unread backpack.tf notifications.  Keep in mind, you will only get pings as long as both the bot AND your device are running.  Notifications will appear in the channel you use the !start command in.  __When the bot detects unread notifications, it will mark them as read.__

## If you have any questions, need help, have a suggestion, or just wanna talk, feel free to open an Issue, or message me on Discord at @cephelo
Thanks for visiting!
