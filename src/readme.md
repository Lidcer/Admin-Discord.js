This is extended `discord js` client that added very poverfull admin controls.

#setup
`npm install`

```javascript
const Discord = require("../dist/Client");

const client = new Discord.Client(["0000000000000000"], { options }); // put admins id in to arrays
const BOT_TOKEN = process.env.BOT_TOKEN; // Your bot token
client.clearSettingsTimeOut = 1000; //Admins settings are going to get cleared overtime use this to set custom clear time (default) minute
client.warnMessage = true; //This is going to tell user who is not admin that they are not admin (disabled on default)
client.prefix = "sudo"; //You can set custom admin prefix with this default (sudo)

//Other things are the same as discord js (discord.js.org)
client.on("ready", () => {
  console.log(`loggied as ${client.user.tag}`);
});

client.on("message", msg => {});

client.on("debug", console.info);

client.login(BOT_TOKEN).catch(console.error);
```

##Commands added in this client that you can interact with.

```
<prefix> client <command>
<prefix> guild <command>
<prefix> channel <command>
<prefix> user <command>
<prefix> message <command>
<prefix> emoji <command>
<prefix> role <command>
```

##Guild

Before you start manipulating with guild you have to first set guild by following command `<prefix> guild set <id/name>`
Same as set but this one is going to select that guild that you are currently typing in `<prefix> guild this`
Gives you all possible information about the guild `<prefix> guild set <id/name>`
Gives you all members of the guild `<prefix> guild set members`
Gives you all you all roles of the guild `<prefix> guild roles`
Gives you all you all emojis of the guild `<prefix> guild emoji`
Gives you all you all channels of the guild `<prefix> guild channels`
This command is going to scrape all the data from the guild (info, membrs, roles, emojis, channels). The output is text file `<prefix> guild scrape data`
This is going to give you alredy created invite. you can also create invite by adding `--create` flag `sudo guild invite <--create>`
Renames the guild `<prefix> guild rename <new name>`
Changes the guild icon. You can upload picture or just specify link. You can also add clear to clear guild icon `<prefix> guild icon <url/clear>`
Changes the guild spash. You can upload picture or just specify link. You can also add clear to clear guild spash `<prefix> guild splash <url/clear>`
Changes the guild region. `<prefix> guild region <region>`
Shows you all banned players in the guild. `<prefix> guild bans`
Unbans all banned players in the guild. `<prefix> guild unban all`
Changes verification level of the guild. `<prefix> guild verification`

THIS IS VERY DANGEROUS COMMAND
You should think twice before executing this comand becuse the damage done my this command is irreversible
`<prefix> guild nuke`
`<prefix> guild nuke cancel` cancels countdown

##Channel

Before you start manipulating with channels you have to first set channel by following command `<prefix> channel set <id/name>`
Same as set but this one is going to select that channel that you are currently typing in.`<prefix> channel this`
Sends message in channel`<prefix> channel send <text/embed> <text>`
Gives you last 100 messages. Output is text file `<prefix> channel messages`
Links the channel that you are typing in with selected channel. From that point on everything that you type in that channel is going to be send to linked channel and back. Messages from other channel are also going to be send back. Same prinicple applies for reaction and messages delition.`<prefix> channel link`
Unlinks linked channels. `<prefix> unlink`
Move channel position. `<prefix> move <up/down/number>`
Changes channel nsfw flag. `<prefix> nsfw <true/false>`
Changes channel name. `<prefix> rename <new name>`
Changes channel topic. `<prefix> topic <new topic>`
Deletes channel. `<prefix> delete`

##Client

Gives you basic information about client. `<prefix> client info`
Gives you guild that bot is in. Blod text indicated guild that client has admin permission. `<prefix> client guils`
Gives you channels that bot have access to.`<prefix> client channels`
Gives all the users that bot have access to.`<prefix> client users`
Gives all the emojis that bot have access to.`<prefix> client emoji`
Gives you all nicknames that bot has in guilds.`<prefix> client nicknames`
Gives you all possible informations. `<prefix> client scrape data`

##Role

Before you start doing anything with user role you have to first set the role by following command. `<prefix> role set <id/name>`
Gives you which members have this role in guild. `<prefix> role members`
Gives you all possbile information about the role. `<prefix> role info`
Set the color of role. `<prefix> role color <color>`
Set the role hoist. `<prefix> role hoist <true/false>`
Renames the role. `<prefix> role rename <name>`
Sets the permission of the role. `<prefix> role permissions <Permissions.FLAG>`
Moves role position. `<prefix> role move <up/down/number>`

##Emoji

Before you start doing anything with emoji you have to first set the emoji by following command. `<prefix> emoji set <id/name>`
Gives you all the info about. `<prefix> emoji info`
Deletes emoji. `<prefix> emoji delete`
Renames emoji. `<prefix> emoji rename <name>`
Creates emoji. `<prefix> emoji create <name> <url or attachment>`

##Embed

To set embed. `<prefix> emoji {json}`
To clear embed. `<prefix> clear`
set author. `<prefix> author <author>`
set author icon. `<prefix> author icon <author>`
set author url. `<prefix> author url <url>`
set thumbnail. `<prefix> thumbnail <url>`
set image. `<prefix> image <url>`
set color. `<prefix> title <color or url>`
set timestamp. `<prefix> timestamp <numbers>`
set footer. `<prefix> footer <name>`
set footer url. `<prefix> footer url <url>`
add field. `<prefix> add field --name <name> --value <value> --infline <true/false>`

##Additional info
While you are looking for info you can add `> file.txt` to export data in to file
