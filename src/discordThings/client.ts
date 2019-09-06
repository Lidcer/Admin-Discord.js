import { Message, RichEmbed } from "discord.js";
import { Client } from "../Client";
import { formatDate, decompileEmbed, createFields, writeFile } from "../Others";

const toLongList = "❌ The list is to long try using export command ` > export.txt`";

export function botClient(message: Message, msg: string) {
  const checker = msg.toLowerCase();

  let output: string = null;
  if (message.content.includes(" > ")) {
    const filename = message.content.split(" > ");
    output = filename[1].trim();
    if (!output.includes("txt")) output += ".txt";
  }

  if (checker.startsWith("help")) return help(message);
  else if (checker.startsWith("info")) return info(message, output);
  else if (checker.startsWith("guilds")) return guilds(message, output);
  else if (checker.startsWith("channels")) return channels(message, output);
  else if (checker.startsWith("users")) return users(message, output);
  else if (checker.startsWith("emojis")) return emojis(message, output);
  else if (checker.startsWith("nicknames")) return nickName(message, output);
  else if (checker.startsWith("scrape data")) return scrapeAllData(message);
  else {
    // @ts-ignore
    message.channel.send(`You are using this command incorrectly use \`${message.client.prefix} client help\``);
  }
}

function help(message: Message) {
  const embed = new RichEmbed();

  // @ts-ignore
  const prefix = message.client.prefix;

  embed.setAuthor(`${prefix} client commands`, message.client.user.avatarURL);
  embed.setColor("WHITE");
  embed.addField(`Info`, `Gives you basic information about client \n\`${prefix} client info\``);
  embed.addField(
    `guilds`,
    `Gives you guild that bot is in. Blod text indicated guild that client has admin permission\n\`${prefix} client guils\``
  );
  embed.addField(`channels`, `Gives you channels that bot have access to.\n\`${prefix} client channels\``);
  embed.addField(`users`, `Gives all the users that bot have access to.\n\`${prefix} client users\``);
  embed.addField(`emojis`, `Gives all the emojis that bot have access to.\n\`${prefix} client emoji\``);
  embed.addField(`nicknames`, `Gives you all nicknames that bot has in guilds.\n\`${prefix} client nicknames\``);
  embed.addField(`scrapes data`, `Gives you all possible informations.\n\`${prefix} client scrape data\``);

  message.channel.send(embed).catch(() => {
    message.channel.send(decompileEmbed(embed)).catch(() => {});
  });
}

function info(message: Message, output: string, textTextReturn = false) {
  const c = message.client as Client;
  const embed = clientEmbed(c);

  if (output) {
    let text = "=================CLIENT INFO=================\n";

    text += `Name: ${c.user.tag}\nID: ${c.user.id}\n`;
    text += `Guild count: ${c.guilds.size}\nChannels: ${c.channels.size}\nUsers: ${c.users.size}\nEmojis: ${c.emojis.size}\n`;
    text += `${formatDate(c.readyAt)}\n`;

    text += "=================CLIENT INFO=================\n";
    if (textTextReturn) return text;
    else {
      writeFile({
        output,
        text,
        message
      });
      return;
    }
  }

  embed.addField("User", `Name: ${c.user.tag}\nID: ${c.user.id}`);
  embed.addField(
    "Info",
    `Guild count: ${c.guilds.size}\nChannels: ${c.channels.size}\nUsers: ${c.users.size}\nEmojis: ${c.emojis.size}`
  );
  embed.addField("readyAt", `${formatDate(c.readyAt)}`);
  if (c.voiceConnections.size > 0) embed.addField("Voice connection count", `${c.voiceConnections.size}`);

  message.channel.send(embed).catch(() => {
    message.channel.send(decompileEmbed(embed)).catch(() => {});
  });
}

function guilds(message: Message, output: string, textTextReturn = false) {
  const embed = clientEmbed(message.client as Client);
  const guilds = message.client.guilds;
  if (message.client.guilds.size === 0) return message.channel.send("Client is not in any guild").catch(() => {});

  // guilds = guilds.sort((a, b) => a.name - b.name)

  if (output) {
    let text = "===================GUILDS===================\n";
    const names = guilds.map(
      m =>
        `NAME: ${m.name}\nID: ${m.id}\nOWNER: ${m.owner ? m.owner.user.tag : "none"}\nADMIN:${m.me.hasPermission(
          "ADMINISTRATOR"
        )}\n`
    ) as string[];
    text += `GUILD COUNTS: ${guilds.size}\n`;
    text += `${names.join("\n")}`;
    text += "===================GUILDS===================\n";
    if (textTextReturn) return text;
    else {
      writeFile({
        output,
        text,
        message
      });
      return;
    }
  }

  embed.setTitle("Guilds");
  embed.setDescription(`Total guilds ${message.client.guilds.size}`);

  const names = guilds.map(m => (m.me.hasPermission("ADMINISTRATOR") ? `**${m.name}**` : m.name)) as string[];
  message.channel.stopTyping();
  if (!createFields(embed, `${names.join("\n")}`)) return message.channel.send(toLongList);
  else message.channel.send(embed);
}

function channels(message: Message, output: string, textTextReturn = false) {
  const embed = clientEmbed(message.client as Client);
  const channels = message.client.channels;
  if (message.client.channels.size === 0) return message.channel.send("Client do not have access to any channels");

  // guilds = guilds.sort((a, b) => a.name - b.name)

  if (output) {
    let text = "===================CHANNELS===================\n";
    const names = channels.map(c => {
      let t = "";
      t += `ID: ${c.id}\n`;
      // @ts-ignore
      if (c.name) t += `NAME: ${c.name}\n`;
      t += `TYPE: ${c.type}\n`;
      // @ts-ignore
      if (c.guild)
        // @ts-ignore
        t += `GUILD NAME: ${c.guild.name}\n`;

      return t;
    }) as string[];
    text += `CHANNELS COUNTS: ${channels.size}\n`;
    text += `${names.join("\n")}`;

    text += "===================CHANNELS===================\n";
    if (textTextReturn) return text;
    else {
      writeFile({
        output,
        text,
        message
      });
      return;
    }
  }

  embed.setTitle("Channels");
  embed.setDescription(`Total guilds ${message.client.channels.size}`);

  // @ts-ignore
  const names = channels.map(c => (c.name ? c.name : c.id)) as string[];
  message.channel.stopTyping();
  if (!createFields(embed, `${names.join("\n")}`)) return message.channel.send(toLongList);
  else message.channel.send(embed);
}

async function users(message: Message, output: string, textTextReturn = false) {
  const embed = clientEmbed(message.client as Client);
  const users = message.client.users;
  const guilds = message.client.guilds.map(g => g);
  if (message.client.users.size === 0) return message.channel.send("Client do not have access to any channels");

  // guilds = guilds.sort((a, b) => a.name - b.name)

  if (output) {
    if (!textTextReturn) await message.channel.send("This might take awhile please be patient").catch(() => {});
    await message.channel.startTyping();
    let text = "===================USERS===================\n";
    const names = users.map(c => {
      let t = "\n";
      t += `ID: ${c.id}\n`;
      t += `NAME: ${c.tag}\n`;
      t += `BOT: ${c.bot}\n`;
      t += `ACCOUNT CREATED: ${formatDate(c.createdAt)}\n`;
      t += `GUILDS:\n`;

      for (const guild of guilds) {
        const g = guild.members.find(m => m.id === c.id);

        if (g) t += `  - ${guild.name}\n`;
      }

      return t;
    }) as string[];
    text += `CHANNELS COUNTS: ${channels.length}\n`;
    text += `${names.join("\n")}`;

    text += "===================USERS===================\n";
    message.channel.stopTyping();
    if (textTextReturn) return text;
    else {
      writeFile({
        output,
        text,
        message
      });
      return;
    }
  }

  embed.setTitle("Users");
  embed.setDescription(`Total users ${message.client.users.size}`);

  // @ts-ignore
  const userss = users.map(c => c.tag) as string[];
  message.channel.stopTyping();
  if (!createFields(embed, `${userss.join("\n")}`)) return message.channel.send(toLongList);
  else message.channel.send(embed);
}

function emojis(message: Message, output: string, textTextReturn = false) {
  const embed = clientEmbed(message.client as Client);
  const emojis = message.client.emojis;
  if (message.client.emojis.size === 0) return message.channel.send("Client dose not have access to any emoties");

  // guilds = guilds.sort((a, b) => a.name - b.name)

  if (output) {
    let text = "===================EMOJIS===================\n";
    const names = emojis.map(m => `ID: ${m.id}\nNAME: ${m.name}\nURL: ${m.url}\nGUILD: ${m.guild.name}\n`) as string[];
    text += `EMOJIS COUNTS: ${emojis.size}\n`;
    text += `${names.join("\n")}`;
    text += "===================EMOJIS===================\n";
    if (textTextReturn) return text;
    else {
      writeFile({
        output,
        text,
        message
      });
      return;
    }
  }

  embed.setTitle("Guilds");
  embed.setDescription(`Total guilds ${message.client.guilds.size}`);

  const names = emojis.map(m => `\`:${m.name}:\``) as string[];
  message.channel.stopTyping();
  if (!createFields(embed, `${names.join("\n")}`)) return message.channel.send(toLongList);
  else message.channel.send(embed);
}

function nickName(message: Message, output: string, textTextReturn = false) {
  const guilds = message.client.guilds.map(m => m);
  const nickNames = [];

  for (const guild of guilds) {
    const nickname = guild.me.nickname;

    if (nickname) nickNames.push(`NICKNAME: ${nickname}\nGUILD: ${guild.name}\n`);
  }

  if (output) {
    let text = "===================NICKNAMES===================\n";
    text += `${nickNames.join(`\n`)}\n`;
    text += "===================NICKNAMES===================\n";
    if (textTextReturn) return text;
    else {
      writeFile({
        output,
        text,
        message
      });
      return;
    }
  }

  message.channel.send(nickNames.join(`\n`)).catch(err => {
    message.channel.send(toLongList).catch(() => {});
  });
}

async function scrapeAllData(message) {
  await message.channel.send("This might take awhile please be patient").catch(() => {});
  await message.channel.startTyping();
  message.channel
    .send(":smirk:")
    .then(async () => {
      let text = "";

      text += info(message, "dataScaraper", true);
      text += guilds(message, "dataScaraper", true);
      text += channels(message, "dataScaraper", true);
      text += users(message, "dataScaraper", true);
      text += emojis(message, "dataScaraper", true);
      text += nickName(message, "dataScaraper", true);

      await message.channel.stopTyping();
      writeFile({
        output: message.client.user.tag,
        text,
        message
      });
    })
    .catch(err => {
      message.channel.send(`Something faild: ${err.message}`);
      console.error(err);
    });
}

function clientEmbed(c: Client) {
  const embed = new RichEmbed();
  embed.setAuthor(c.user.tag, c.user.avatarURL);
  embed.setTimestamp(Date.now());
  return embed;
}
