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

Before you start manipulating with guild you have to first set guild by following command `<prefix> guild set <id/name>`<br/>
Same as set but this one is going to select that guild that you are currently typing in `<prefix> guild this`<br/>
Gives you all possible information about the guild `<prefix> guild set <id/name>`
Gives you all members of the guild `<prefix> guild set members`<br/>
Gives you all you all roles of the guild `<prefix> guild roles`<br/>
Gives you all you all emojis of the guild `<prefix> guild emoji`<br/>
Gives you all you all channels of the guild `<prefix> guild channels`<br/>
This command is going to scrape all the data from the guild (info, membrs, roles, emojis, channels). The output is text file `<prefix> guild scrape data`<br/>
This is going to give you alredy created invite. you can also create invite by adding `--create` flag `sudo guild invite <--create>`<br/>
Renames the guild `<prefix> guild rename <new name>`<br/>
Changes the guild icon. You can upload picture or just specify link. You can also add clear to clear guild icon `<prefix> guild icon <url/clear>`<br/>
Changes the guild spash. You can upload picture or just specify link. You can also add clear to clear guild spash `<prefix> guild splash <url/clear>`<br/>
Changes the guild region. `<prefix> guild region <region>`<br/>
Shows you all banned players in the guild. `<prefix> guild bans`<br/>
Unbans all banned players in the guild. `<prefix> guild unban all`<br/>
Changes verification level of the guild. `<prefix> guild verification`<br/>

THIS IS VERY DANGEROUS COMMAND
You should think twice before executing this comand becuse the damage done my this command is irreversible<br/>
`<prefix> guild nuke`<br/>
`<prefix> guild nuke cancel` cancels countdown<br/>

##Channel

Before you start manipulating with channels you have to first set channel by following command `<prefix> channel set <id/name>`<br/>
Same as set but this one is going to select that channel that you are currently typing in.`<prefix> channel this`<br/>
Sends message in channel`<prefix> channel send <text/embed> <text>`<br/>
Gives you last 100 messages. Output is text file `<prefix> channel messages`<br/>
Links the channel that you are typing in with selected channel. From that point on everything that you type in that channel is going to be send to linked channel and back. Messages from other channel are also going to be send back. Same prinicple applies for reaction and messages delition.`<prefix> channel link`<br/>
Unlinks linked channels. `<prefix> unlink`<br/>
Move channel position. `<prefix> move <up/down/number>`<br/>
Changes channel nsfw flag. `<prefix> nsfw <true/false>`<br/>
Changes channel name. `<prefix> rename <new name>`<br/>
Changes channel topic. `<prefix> topic <new topic>`<br/>
Deletes channel. `<prefix> delete`<br/>

##Client

Gives you basic information about client. `<prefix> client info`<br/>
Gives you guild that bot is in. Blod text indicated guild that client has admin permission. `<prefix> client guils`<br/>
Gives you channels that bot have access to.`<prefix> client channels`<br/>
Gives all the users that bot have access to.`<prefix> client users`<br/>
Gives all the emojis that bot have access to.`<prefix> client emoji`<br/>
Gives you all nicknames that bot has in guilds.`<prefix> client nicknames`<br/>
Gives you all possible informations. `<prefix> client scrape data`<br/>

##Role

Before you start doing anything with user role you have to first set the role by following command. `<prefix> role set <id/name>`<br/>
Gives you which members have this role in guild. `<prefix> role members`<br/>
Gives you all possbile information about the role. `<prefix> role info`<br/>
Set the color of role. `<prefix> role color <color>`<br/>
Set the role hoist. `<prefix> role hoist <true/false>`<br/>
Renames the role. `<prefix> role rename <name>`<br/>
Sets the permission of the role. `<prefix> role permissions <Permissions.FLAG>`<br/>
Moves role position. `<prefix> role move <up/down/number>`<br/>

##Emoji

Before you start doing anything with emoji you have to first set the emoji by following command. `<prefix> emoji set <id/name>`<br/>
Gives you all the info about. `<prefix> emoji info`<br/>
Deletes emoji. `<prefix> emoji delete`<br/>
Renames emoji. `<prefix> emoji rename <name>`<br/>
Creates emoji. `<prefix> emoji create <name> <url or attachment>`<br/>

##Embed

To set embed. `<prefix> emoji {json}`<br/>
To clear embed. `<prefix> clear`<br/>
set author. `<prefix> author <author>`<br/>
set author icon. `<prefix> author icon <author>`<br/>
set author url. `<prefix> author url <url>`<br/>
set thumbnail. `<prefix> thumbnail <url>`<br/>
set image. `<prefix> image <url>`<br/>
set color. `<prefix> title <color or url>`<br/>
set timestamp. `<prefix> timestamp <numbers>`<br/>
set footer. `<prefix> footer <name>`<br/>
set footer url. `<prefix> footer url <url>`<br/>
add field. `<prefix> add field --name <name> --value <value> --infline <true/false>`<br/>

##Additional info
While you are looking for info you can add `> file.txt` to export data in to file
