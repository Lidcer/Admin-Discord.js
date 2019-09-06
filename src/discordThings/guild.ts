import { Message, Guild, RichEmbed, CategoryChannel, TextChannel } from "discord.js";
import { Client } from "../Client";
import { getAge, formatDate, decompileEmbed, errorEmbed, createFields, writeFile } from "../Others";
import * as AP from "../adminProfiler";
import * as fs from "fs";

const toLongList = "❌ The list is to long try using export command ` > export.txt`";

export function guild(message: Message, msg: string) {
  const guild = AP.getGuild(message.client as Client, message.author.id) as Guild;
  //
  const checker = msg.toLowerCase();
  if (checker.startsWith("set")) return set(message, msg.slice(3).trim());
  if (checker.startsWith("this")) return that(message);
  if (checker.startsWith("help")) return help(message);

  if (!guild)
    return message.channel.send(
      // @ts-ignore
      `❌ Guild is not set. Please set guild before continue with following command \`${message.client.prefix} guild set [name/id]\` - to set guild`
    );
  if (!guild.available) return message.channel.send(`❌ This guild not avalable anymore`);

  let output: string = null;
  if (message.content.includes(" > ")) {
    const filename = message.content.split(" > ");
    output = filename[1].trim();
    if (!output.includes("txt")) output += ".txt";
  }

  if (checker.startsWith("info")) return info(message, guild, output);
  else if (checker.startsWith("members")) return members(message, guild, msg, output);
  else if (checker.startsWith("users")) return members(message, guild, msg, output);
  else if (checker.startsWith("roles")) return roles(message, guild, msg, output);
  else if (checker.startsWith("emoji")) return emojies(message, guild, msg, output);
  else if (checker.startsWith("emojies")) return emojies(message, guild, msg, output);
  else if (checker.startsWith("channels")) return channels(message, guild, msg, output);
  else if (checker.startsWith("scrape data")) return scrapeAllData(message, guild);
  else if (checker.startsWith("invite")) return invites(message, guild, msg);
  else if (checker.startsWith("rename")) return rename(message, guild, msg.slice(6, msg.length).trim());
  else if (checker.startsWith("leave")) return leave(message, guild);
  else if (checker.startsWith("icon")) return icon(message, guild, msg.slice(4, msg.length).trim());
  else if (checker.startsWith("splash")) return splash(message, guild, msg.slice(4, msg.length).trim());
  else if (checker.startsWith("region")) return region(message, guild, msg.slice(6, msg.length).trim());
  else if (checker.startsWith("bans")) return showBanned(message, guild);
  else if (checker.startsWith("prune")) return prune(message, guild, msg.slice(5, msg.length).trim());
  else if (checker.startsWith("unban all")) return unBanAll(message, guild);
  else if (checker.startsWith("audit log")) return auditLog(message, guild);
  else if (checker.startsWith("verification")) return verification(message, guild, msg.slice(12, msg.length).trim());
  else if (checker.startsWith("nuke stop")) return stopNuke(message);
  else if (checker.startsWith("nuke cancel")) return stopNuke(message);
  else if (checker.startsWith("nuke terminate")) return stopNuke(message);
  else if (checker === "nuke") return nuke(message, guild);
  else {
    // @ts-ignore
    message.channel.send(`You are using this command incorrectly use \`${message.client.prefix} guild help\``);
  }
}
function that(message: Message) {
  if (message.guild) {
    AP.setGuild(message.client as Client, message.author.id, message.guild);
    AP.infrom(message.client, message);
  } else {
    message.channel.send(`This channel does not have any guild`);
  }
}

function help(message: Message) {
  const embed = new RichEmbed();

  // @ts-ignore
  const prefix = message.client.prefix;

  embed.setAuthor(`${prefix} guild commands`, message.client.user.avatarURL);
  embed.setColor("WHITE");
  embed.addField(
    `set`,
    `Before you start manipulating with guild you have to first set guild by following command\n\`${prefix} guild set <id/name>\``
  );
  embed.addField(`info`, `Gives you all possible information about the guild \n\`${prefix} guild set <id/name>\``);
  embed.addField(`members`, `Gives you all members of the guild \n\`${prefix} guild set members\``);
  embed.addField(`roles`, `Gives you all you all roles of the guild \n\`${prefix} guild roles\``);
  embed.addField(`emojis`, `Gives you all you all emojis of the guild \n\`${prefix} guild emoji\``);
  embed.addField(`channels`, `Gives you all you all channels of the guild \n\`${prefix} guild channels\``);
  embed.addField(
    `scrape data`,
    `This command is going to scrape all the data from the guild (info, membrs, roles, emojis, channels). The output is text file \n\`${prefix} guild scrape data\``
  );
  embed.addField(
    `invite`,
    `This is going to give you alredy created invite. you can also create invite by adding\n\`--create\` flag\n\`${prefix} guild invite <--create>\``
  );
  embed.addField(`rename`, `Renames the guild \n\`${prefix} guild rename <new name>\``);
  embed.addField(
    `icon`,
    `Changes the guild icon. You can upload pic or just specify link. You can also add clear to clear guild icon \n\`${prefix} guild icon <url/clear>\``
  );
  embed.addField(
    `splash`,
    `Changes the guild spash. You can upload pic or just specify link. You can also add clear to clear guild spash \n\`${prefix} guild splash <url/clear>\``
  );
  embed.addField(`region`, `Changes the guild region. \n\`${prefix} guild region <region>\``);
  embed.addField(`bans`, `Shows you all banned players in the guild. \n\`${prefix} guild bans\``);
  embed.addField(`unban all`, `Unbans all banned players in the guild. \n\`${prefix} guild unban all\``);
  embed.addField(
    `verification`,
    `Changes verification level of the guild. \n\`${prefix} guild verification <number>\``
  );
  embed.addField(
    `nuke`,
    `**THIS IS VERY DANGEROUS COMMAND**\nYou should think twice before executing this comand becuse the damage done my this command is irreversible\n\`${prefix} guild nuke\`\n\`${prefix} guild nuke cancel\` cancels countdown`
  );
  embed.addField(
    `Additional info`,
    `While you are looking for info you can add \` > file.txt\` to export data in to file`
  );

  message.channel.send(embed).catch(() => {
    message.channel.send(decompileEmbed(embed)).catch(() => {});
  });
}

function set(message: Message, msg: string) {
  if (msg.length <= 2) return message.channel.send("❌ Guild name must be equal or longer than 2 charaters!");

  let guild;
  guild = message.client.guilds.find(g => g.id === msg);
  if (!guild) guild = message.client.guilds.find(g => g.name === msg);
  if (!guild) guild = message.client.guilds.find(g => g.name.toLowerCase() === msg.toLowerCase());
  if (!guild) guild = message.client.guilds.find(g => g.name.includes(msg));
  if (!guild) guild = message.client.guilds.find(g => g.name.toLowerCase().includes(msg.toLowerCase()));

  if (guild) {
    AP.setGuild(message.client as Client, message.author.id, guild);
    AP.infrom(message.client, message);
  } else {
    message.channel.send("❌ Unable to find guild!");
  }
}

// Gets all basic info about the guild!
function info(message: Message, guild: Guild, output?: string, textTextReturn = false) {
  const channels = {
    text: guild.channels.filter(c => c.type === "text").size,
    voice: guild.channels.filter(c => c.type === "voice").size
  };

  const members = {
    humans: guild.members.filter(m => !m.user.bot).size,
    bots: guild.members.filter(m => m.user.bot).size,
    online: guild.members.filter(m => m.user.presence.status === "online").size,
    idle: guild.members.filter(m => m.user.presence.status === "idle").size,
    dnd: guild.members.filter(m => m.user.presence.status === "dnd").size,
    offline: guild.members.filter(m => m.user.presence.status === "offline").size
  };

  if (output) {
    let text = "=================GUILD INFO=================\n";
    text += `NAME: ${guild.name}\n`;
    text += `ID: ${guild.id}\n`;
    text += `ICON: ${guild.iconURL}\n`;
    text += `HUMANS COUNT: ${members.humans}\n`;
    text += `BOTS COUNT: ${members.bots}\n`;
    text += `OWNER: ${guild.owner ? guild.owner.user.tag : "Unknown"}\n`;
    text += `ROLES COUNT: ${guild.roles.size}\n`;
    text += `EMOJI COUNT: ${guild.emojis.size}\n`;
    text += `TEXT CHANNELS: ${channels.text}\n`;
    text += `VOICE CHANNELS: ${channels.voice}\n`;
    text += `GUILD REGION: ${guild.region}\n`;
    text += `MEMBERS STATUS\n`;
    text += `-  Online: ${members.online}\n`;
    text += `-  Idle: ${members.idle}\n`;
    text += `-  Do not disturb: ${members.dnd}\n`;
    text += `-  Offline: ${members.offline}\n`;
    text += `CREATED:\n-  ${formatDate(guild.createdAt)}\n-  ${getAge(guild.createdAt)}\n`;
    text += `VERIFICATION LEVEL: ${guild.verificationLevel}\n`;
    text += `VERIFIED: ${guild.verified}\n`;
    text += `SYSTEM CHANNEL: ${guild.systemChannel ? guild.systemChannel.name : "None"}\n`;
    text += `SYSTEM AFK CHANNEL: ${guild.afkChannel ? guild.afkChannel.name : "None"}\n`;
    text += `AFK TIMEOUT: ${guild.afkTimeout}\n`;
    text += `DATE: ${formatDate(new Date(Date.now()))}\n`;
    text += "=================GUILD INFO=================\n";
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

  const embed = new RichEmbed();
  embed.setAuthor(guild.name, guild.iconURL);
  embed.setTitle(guild.id);
  embed.setDescription(`Humans: ${members.humans} / Bots: ${members.bots}`);
  embed.addField("Owner", guild.owner ? guild.owner.user.tag : "Unknown", true);
  embed.addField("Roles", `${guild.roles.size}`, true);
  embed.addField("Emojis", `${guild.emojis.size}`, true);
  embed.addField("Region", `${guild.region}`, true);
  embed.addField("Channels", `Text: ${channels.text}\n Voice: ${channels.voice}`, true);
  embed.addField(
    "Members",
    `Online: ${members.online}\nIdle: ${members.idle}\nDo not disturb: ${members.dnd}\nOffline: ${members.offline}`,
    true
  );
  embed.addField("Created", `${formatDate(guild.createdAt)}\n${getAge(guild.createdAt)}`, true);
  embed.addField("Verification level", guild.verificationLevel, true);
  embed.addField("Verified", guild.verified, true);
  embed.addField("System Channel", guild.systemChannel ? guild.systemChannel.name : "None", true);
  embed.addField("System Afk Channel", guild.afkChannel ? guild.afkChannel.name : "None", true);
  embed.addField("Afk Timeout", guild.afkTimeout, true);
  embed.setThumbnail(guild.iconURL);

  if (guild.members.find(m => m.user === guild.client.user).hasPermission("ADMINISTRATOR"))
    embed.addField("Other info", `${guild.client.user.tag} has administrator privelegies in this guild`);

  message.channel.send(embed).catch(() => {
    message.channel.send(decompileEmbed(embed)).catch(() => {});
  });
}

function members(message: Message, guild: Guild, content: string, output?: string, textTextReturn = false) {
  message.channel.startTyping();
  const embed = guildEmbed(guild);

  // @ts-ignore
  const members = guild.members.map(m => m);

  if (output) {
    let text = "=================GUILD MEMBERS=================\n\n";
    text += `MEMBERS: ${members.length}\n`;

    for (const member of members) {
      text += `==========\n`;
      text += `USER NAME: ${member.user.tag}\n`;
      text += `USER AVATAR: ${member.user.avatarURL}\n`;
      text += `USER ID: ${member.user.id}\n`;
      text += `USER BOT: ${member.user.bot}\n`;

      text += `USER CREATED:\n ${formatDate(member.user.createdAt)}\n ${getAge(member.user.createdAt)}\n`;

      text += `USER PRESENCE: ${member.user.presence.status}\n`; // <---------FIX
      if (member.user.presence.game)
        text += `USER GAME:\n${member.user.presence.game.type}\n${member.user.presence.game.name}\n${member.user.presence.game.details}\n`;
      if (member.joinedAt) text += `GUILD JOINED:\n ${formatDate(member.joinedAt)}\n ${getAge(member.joinedAt)}\n`;

      if (member.nickname) text += `USER NICKNAME: ${member.nickname}\n`;

      const roles = member.roles
        .sort(r => r.calculatedPosition)
        .map(r => r.name)
        .join("\n - ");
      if (roles.length !== 0) {
        text += `\nUSER ROLES:\n`;
        text += `${roles}\n`;
      }

      const permissions = member.permissions.toArray().join("\n - ");
      if (roles.length !== 0) {
        text += `\nUSER PERMISSIONS:\n`;
        text += `${permissions}\n`;
      }

      text += `==========\n\n`;
    }
    text += "=================GUILD MEMBERS=================\n";
    if (textTextReturn) return text;
    else {
      setTimeout(() => {
        message.channel.stopTyping();
        fs.writeFile(`.${output}`, text, err => {
          if (err) {
            console.error(err);
            return message.channel.send("Cannot write file!");
          }
          message.channel
            .send({
              files: [`.${output}`]
            })
            .then(() => {
              fs.unlink(`.${output}`, err => {
                if (err) console.log(err);
              });
            })
            .catch(err => {
              console.error(err);
              message.channel.send(err.message).catch(() => {});
            });
        });
      }, 0);
    }
  }
  embed.setTitle("Members");
  embed.setDescription(`Total members ${guild.memberCount}`);

  const names = members.map(m => m.user.tag) as string[];
  message.channel.stopTyping();
  if (!createFields(embed, names.join("\n"))) return message.channel.send(toLongList);
  else message.channel.send(embed);
}

function roles(message: Message, guild: Guild, content: string, output?: string, textTextReturn = false) {
  const roles = guild.roles
    .map(r => r)
    .sort((a, b) => a.calculatedPosition - b.calculatedPosition)
    .reverse();

  if (output) {
    let text = "=================GUILD ROLES=================\n";
    text += `ROLES: ${roles.length}\n`;

    for (const role of roles) {
      text += `==========\n`;
      text += `ROLE NAME: ${role.name}\n`;
      text += `ROLE ID: ${role.id}\n`;
      text += `ROLE MENTIONABLE: ${role.mentionable}\n`;
      text += `ROLE POSITION: ${role.position}\n`;
      text += `ROLE HEX COLOR: ${role.hexColor}\n`;
      text += `ROLE CREATED: ${formatDate(role.createdAt)} ${getAge(role.createdAt)}\n`;
      text += `PERMISSIONS NUMBER: ${role.permissions}\n`;
      text += `==========\n`;
    }

    text += "=================GUILD ROLES=================\n";
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
  if (guild.roles.size === 0) return message.channel.send("This guild dose not have any emoties");
  const embed = guildEmbed(guild);
  embed.setTitle("Roles");
  embed.setDescription(`Total roles ${guild.roles.size}`);

  const names = roles.map(m => m.name) as string[];
  message.channel.stopTyping();
  if (!createFields(embed, names.join("\n"))) return message.channel.send(toLongList);
  else message.channel.send(embed);
}

function emojies(message: Message, guild: Guild, content: string, output?: string, textTextReturn = false) {
  const emojies = guild.emojis
    .map(e => e)
    .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
    .reverse();

  if (output) {
    let text = "=================GUILD EMOJIES=================\n";
    text += `EMOJIES: ${guild.emojis.size}\n`;

    for (const emoji of emojies) {
      text += `==========\n`;
      text += `EMOJI NAME: ${emoji.name}\n`;
      text += `EMOJI ANIMATED: ${emoji.animated}\n`;
      text += `EMOJI ID: ${emoji.id}\n`;
      text += `EMOJI IDENTIFIER: ${emoji.identifier}\n`;
      text += `EMOJI PICTURE: ${emoji.url}\n`;
      text += `EMOJI CREATED: ${formatDate(emoji.createdAt)} ${getAge(emoji.createdAt)}\n`;

      text += `==========\n`;
    }

    text += "=================GUILD EMOJIES=================\n";
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
  if (guild.emojis.size === 0) return message.channel.send("This guild dose not have any emoties");
  const embed = guildEmbed(guild);
  embed.setTitle("Emojies");
  embed.setDescription(`Total emojies ${guild.emojis.size}}`);

  const names = emojies.map(m => m.name) as string[];
  message.channel.stopTyping();
  if (!createFields(embed, `:${names.join(":\n:")}:`)) return message.channel.send(toLongList);
  else message.channel.send(embed);
}

function channels(message: Message, guild: Guild, content: string, output?: string, textTextReturn = false) {
  const channels = guild.channels
    .map(e => e)
    .sort((a, b) => a.calculatedPosition - b.calculatedPosition)
    .reverse();

  if (output) {
    let text = "=================GUILD CHANNELS=================\n";
    text += `EMOJIES: ${roles.length}\n`;

    for (const channel of channels) {
      const a = channel as TextChannel;
      text += `==========\n`;
      if (channel.type === "category") text += `=>CATEGORY<=\n`;
      text += `CHANNEL NAME: ${channel.name}\n`;
      text += `CHANNEL TYPE: ${channel.type}\n`;
      text += `CHANNEL ID: ${channel.id}\n`;
      text += `CHANNEL CREATED: ${formatDate(channel.createdAt)} ${getAge(channel.createdAt)}\n`;
      if (a.topic) text += `CHANNEL TOPIC: ${a.type}\n`;
      if (a.type === "text") {
        text += `CHANNEL NSFW: ${a.nsfw}\n`;
      }
      if (channel.parent) text += `CHANNEL PARENT: ${a.parent.name}\n`;

      text += `==========\n`;
    }

    text += "=================GUILD  CHANNELS=================\n";
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

  const embed = guildEmbed(guild);
  embed.setTitle("Channels");
  embed.setDescription(`Total Channels ${guild.channels.size}`);

  const categories = guild.channels
    .map(e => e)
    .filter(c => c.type === "category")
    .sort((a, b) => a.calculatedPosition - b.calculatedPosition);

  const channelFilter = c => {
    if (c.type === "text") return `#️⃣${c.name}`;
    else if (c.type === "voice") return `🔊${c.name}`;
    else if (c.type === "store") return `🛒${c.name}`;
    else if (c.type === "news") return `📰${c.name}`;
    else return "";
  };

  for (const category of categories) {
    const c = category as CategoryChannel;

    const children = c.children.map(channelFilter).join("\n");

    if (children.length === 0) {
      embed.addField(c.name, "/");
      continue;
    }
    if (children.length < 255) embed.addField(c.name, children);
    else {
      let a = children.slice(240);
      a = a.slice(0, a.lastIndexOf("\n"));
      embed.addField(c.name, `${a}...`);
    }
  }
  const unCategorized = guild.channels
    .filter(c => !c.parent)
    .map(channelFilter)
    .filter(c => c)
    .join("\n");

  if (unCategorized) {
    if (unCategorized.length < 250) embed.addField("uncategorized", unCategorized);
    else {
      let a = unCategorized.slice(250);
      a = a.slice(0, a.lastIndexOf("\n"));
      embed.addField("uncategorized", `${a}...`);
    }
  }

  message.channel.stopTyping();
  message.channel.send(embed);
}

function scrapeAllData(message, guild) {
  message.channel.send(":smirk:").then(() => {
    let text = "";
    text += info(message, guild, "dataScaraper", true);
    text += members(message, guild, "", "dataScaraper", true);
    text += roles(message, guild, "", "dataScaraper", true);
    text += emojies(message, guild, "", "dataScaraper", true);
    text += channels(message, guild, "", "dataScaraper", true);

    writeFile({
      output: guild.name,
      text,
      message
    });
  });
}

function auditLog(message: Message, guild: Guild) {
  guild
    .fetchAuditLogs()
    .then(a => {
      const text = a.entries
        .map(r => {
          return [
            `=====`,
            `TARGETTYPE: ${r.targetType}`,
            `ACTIONTYPE: ${r.actionType}`,
            `ACTION: ${r.action}`,
            `REASON: ${r.reason}`,
            `EXECUTOR: ${r.executor.tag}`,
            `ID: ${r.id}`,
            `TARGET: ${r.target}`,
            `DATE: ${formatDate(r.createdAt)}`,
            `=====`
          ].join("\n");
        })
        .join("\n");

      writeFile({
        output: guild.name,
        text,
        message
      });
    })
    .catch(err => {
      message.channel.send(`Cannot fetch guild audit logs. Reason: ${err.message}`).catch(() => {});
    });
}

// trys to get intive if it exist if not you can forcefuly create invite
async function invites(message: Message, guild: Guild, content: string) {
  if (content.toLocaleLowerCase().includes("--create")) return createInvite(message, guild);

  message.channel.startTyping();
  await guild
    .fetchInvites()
    .then(invites => {
      const noExpireInvite = invites.find(i => i.createdTimestamp === i.expiresTimestamp);

      message.channel.stopTyping();
      if (noExpireInvite) return message.reply(`${noExpireInvite}`).catch(() => {});
      else {
        const invite = invites.find(i => i.createdTimestamp > new Date().getTime());
        if (invite) return message.reply(`${invite}`).catch(() => {});
        else return errorEmbed(message.channel, `❌ No invite found! You can try to use \`-create\` to crete invite`);
      }
    })
    .catch(() => {
      message.channel.stopTyping();
      errorEmbed(message.channel, `❌ No permission to get inivtes! You can try to use \`-create\` to create invite`);
    });
}

async function createInvite(message: Message, guild: Guild) {
  const textChannels = guild.channels.filter(c => c.type === "text").map(m => m);
  const voiceChannels = guild.channels.filter(c => c.type === "voice").map(m => m);

  for (const i of textChannels) {
    if (!i.permissionsFor(guild.me).has("CREATE_INSTANT_INVITE")) break;
    const invite = await i.createInvite().catch(() => {});
    if (invite) {
      message.channel.stopTyping();
      return message.channel.send(invite.url).catch(() => {});
    }
  }
  for (const i of voiceChannels) {
    if (!i.permissionsFor(guild.me).has("CREATE_INSTANT_INVITE")) break;

    const invite = await i.createInvite().catch(() => {});
    if (invite) {
      message.channel.stopTyping();
      return message.channel.send(invite.url).catch(() => {});
    }
  }
  message.channel.stopTyping();
  return errorEmbed(message.channel, "❌ Cannot create invite");
}

function rename(message: Message, guild: Guild, content: string) {
  const nameNow = guild.name;

  guild
    .setName(content)
    .then(text => message.channel.send(`✅ Server successfully renamed from \`${nameNow}\` to \`${text}\``))
    .catch(err => message.channel.send(`❌ ${err.message}`));
}

function leave(message: Message, guild: Guild) {
  const guildName = guild.name;
  guild
    .leave()
    .then(guild => message.channel.send(`✅ Bot left the guild \`${guildName}\``))
    .catch(err => message.channel.send(`❌ ${err.message}`));
}

async function icon(message: Message, guild: Guild, content: string) {
  message.channel.startTyping();
  const a = message.attachments.map(m => m);

  if (a.length > 0 && a[0].url) content = a[0].url;

  if (!content) return message.channel.send(`Missing picture`).catch(() => {});
  if (content.toLowerCase() === "clear") content = "";

  await guild
    .setIcon(content)
    .then(guild => {
      if (guild.iconURL) message.channel.send(`✅ Server icon has been changed\n ${guild.iconURL}`).catch(() => {});
      else {
        message.channel.send(`✅ Server icon has been cleared`).catch(() => {});
      }
    })
    .catch(err => message.channel.send(`❌ ${err.message}`).catch(() => {}));

  message.channel.stopTyping();
}

async function splash(message: Message, guild: Guild, content: string) {
  message.channel.startTyping();
  const a = message.attachments.map(m => m);

  if (a.length > 0 && a[0].url) content = a[0].url;

  if (!content) return message.channel.send(`Missing picture`).catch(() => {});
  if (content.toLowerCase() === "clear") content = "";

  await guild
    .setSplash(content)
    .then(guild => {
      if (guild.iconURL) message.channel.send(`✅ Server splash has been changed\n ${guild.iconURL}`).catch(() => {});
      else {
        message.channel.send(`✅ Server splash has been cleared`).catch(() => {});
      }
    })
    .catch(err => message.channel.send(`❌ ${err.message}`).catch(() => {}));

  message.channel.stopTyping();
}

function stopNuke(message: Message) {
  if (!AP.getNukeStatus(message.client as Client, message.author.id))
    return message.channel.send("Nuke is not in progress");
  AP.clearNuke(message.client as Client, message.author.id);
}

function nuke(message: Message, guild: Guild) {
  if (AP.getNukeStatus(message.client as Client, message.author.id))
    return message.channel.send("Nuke is already in progress");
  AP.setNuke(message.client as Client, message.author.id, guild);
  if (!guild.me.hasPermission("ADMINISTRATOR"))
    message.channel
      .send("I do not have adminitrator privileges in this guild. Nuke may not be successful")
      .catch(() => {});

  const countDown = (m: Message, i: number) => {
    if (!AP.getNukeStatus(message.client as Client, message.author.id)) {
      m.channel.send("Nuke has been canceled").catch(() => {});
      m.delete().catch(() => {});
      return;
    }

    if (i <= 0) {
      // @ts-ignore
      m.edit(`💣 Executing nuke on\`${guild.name}\`. Please be patient this might take a while...`)
        .then((m: Message) => {
          performNuke(guild, message, m);
        })
        .catch(() => {});
      return;
    }
    m.edit(
      // @ts-ignore
      `💣 Targeting guild \`${guild.name}\`..... ${i}sec. Use \`${message.client.prefix} guild nuke cancel\` to terminate nuke`
    )
      .then((m: Message) => {
        setTimeout(() => {
          countDown(m, --i);
        }, 1000);
      })
      .catch(() => {});
  };
  message.channel
    .send(
      // @ts-ignore
      `💣 Targeting guild \`${guild.name}\`..... 10sec. Use \`${message.client.prefix} guild nuke cancel\` to terminate nuke`
    )
    .then((m: Message) => {
      setTimeout(() => {
        countDown(m, 10);
      }, 1000);
    })
    .catch(() => {});
}

async function performNuke(guild: Guild, message: Message, reply: Message) {
  const guildName = guild.name;
  await guild
    .delete()
    .then(() => message.channel.send(`💣 Guild \`${guildName}\` has been nuked succeffuly`))
    .catch(() => {});

  const errors: string[] = [];
  const emoji = (await message.channel.send(`Removing emojis...`).catch(() => {})) as Message;
  const emoties = guild.emojis.map(c => c);
  for (const emoji of emoties) {
    await guild.deleteEmoji(emoji).catch(err => {
      errors.push(`Emoji \`${emoji.name}\` cannot be deleted reason ${err.message}`);
    });
  }
  if (emoji) emoji.edit(`Emojis have been removed.`).catch(() => {});

  const channelsMsg = (await message.channel.send(`Removing channels...`).catch(() => {})) as Message;

  const channels = guild.channels.map(c => c);
  for (const channel of channels) {
    await channel.delete().catch(err => {
      errors.push(`Channel \`${channel.name}\` cannot be deleted reason ${err.message}`);
    });
  }

  if (channelsMsg) channelsMsg.edit(`Channels have been removed.`).catch(() => {});
  const membersMsg = (await message.channel
    .send(`kicking members...`)
    .catch(() => {})
    .catch(() => {})) as Message;

  const members = guild.members.map(c => c).filter(m => m.user !== message.client.user);
  for (const member of members) {
    await member.kick().catch(err => {
      errors.push(`Member \`${member.user.tag}\` cannot be kicked reason ${err.message}`);
    });
  }

  if (membersMsg) membersMsg.edit(`Members have been kicked.`).catch(() => {});
  const guildMsg = (await message.channel
    .send(`Removing guild icon and chanking name...`)
    .catch(() => {})
    .catch(() => {})) as Message;

  const a = await guild.setName("__").catch(err => errors.push(`Name cannot be changed: ${err.message}`));
  const b = await guild.setIcon("").catch(err => errors.push(`Icon cannot be removed: ${err.message}`));

  if (a && b && guildMsg) guildMsg.edit(`Guild icon and name has been changed.`).catch(() => {});
  const rolesMsg = (await message.channel
    .send(`Removing Roles...`)
    .catch(() => {})
    .catch(() => {})) as Message;

  const rolesAll = guild.roles.map(c => c);
  for (const role of rolesAll) {
    await role.delete().catch(err => {
      errors.push(`Role \`${role.name}\` cannot be deleted reason: ${err.message}`);
    });
  }

  if (rolesMsg) rolesMsg.edit(`Roles have been removed.`).catch(() => {});

  if (errors.length > 0) await message.channel.send(errors.join("\n")).catch(() => {});

  await guild.leave();
  reply.delete().catch(() => {});
  message.channel.send("🎆 Guild has been nuked 🎆");
}

function region(message: Message, guild: Guild, content: string) {
  guild
    .setRegion(content)
    .then(r => message.channel.send(`✅ Region changed to ${guild.region}`))
    .catch(err => message.channel.send(`❌ Region cannot be change reason: ${err.message}`));
}

function unBanAll(message: Message, guild: Guild) {
  message.channel.startTyping();

  guild
    .fetchBans()
    .then(async r => {
      if (r.size === 0) {
        message.channel.stopTyping();
        return message.channel.send(`No one is banned in this guild`);
      }
      const b = r.map(r => r);
      const unBaned = [];
      const banned = [];

      for (const user of b) {
        await guild
          .unban(user)
          .then(u => unBaned.push(u.tag))
          .catch(err => banned.push(`${err.message} ${user.tag}`));
      }

      if (unBaned.length > 0) message.channel.send(`Unbanned users\n${unBaned.join("\n")}`).catch(() => {});

      if (banned.length > 0) message.channel.send(`Still banned users\n${banned.join("\n")}`).catch(() => {});
      message.channel.stopTyping();
    })
    .catch(err => {
      message.channel.send(`Cannot fetch unbans. Reason: ${err.message}`);
      message.channel.stopTyping();
    });
}

function showBanned(message: Message, guild: Guild) {
  guild
    .fetchBans()
    .then(async r => {
      if (r.size === 0) return message.channel.send(`No one is banned in this guild`);
      message.channel.send(`Banned users:\n${r.map(r => r.tag).join("\n")}`).catch(() => {});
    })
    .catch(err => message.channel.send(`Cannot fetch unbans. Reason: ${err.message}`).catch(() => {}));
}

function prune(message: Message, guild: Guild, content: string) {
  if (content.length === 0) return message.channel.send(`Pleace specify days`).catch(() => {});
  if (isNaN(parseInt(content)))
    return message.channel.send(`You are using this command wrong. pleace specify days`).catch(() => {});

  guild
    .pruneMembers(parseInt(content))
    .then(m => message.channel.send(`Pruned ${m} members`).catch(() => {}))
    .catch(err => message.channel.send(`Cannot prune members. Reason: ${err.message}`).catch(() => {}));
}

function verification(message: Message, guild: Guild, content: string) {
  if (content.length === 0) return message.channel.send(`Pleace specify verification level`).catch(() => {});
  if (isNaN(parseInt(content)))
    return message.channel.send(`You are using this command wrong. pleace specify verification level`).catch(() => {});

  guild
    .setVerificationLevel(parseInt(content))
    .then(m => message.channel.send(`Guild verification level set to ${m.verificationLevel}`).catch(() => {}))
    .catch(err => message.channel.send(`Cannot set verification level. Reason: ${err.message}`).catch(() => {}));
}

function guildEmbed(guild: Guild) {
  const embed = new RichEmbed();
  embed.setAuthor(guild.name, guild.iconURL);
  embed.setFooter(guild.client.user.tag, guild.client.user.avatarURL);
  embed.setTimestamp(Date.now());
  return embed;
}
