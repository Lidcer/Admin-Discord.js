const Discord = require("../dist/Client");

const client = new Discord.Client(["0000000000000000"]); // put admins id in to arrays
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