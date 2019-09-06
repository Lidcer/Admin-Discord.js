import { Client } from "../Client";
import { Message, Guild, User, RichEmbed, GuildMember } from "discord.js";
import * as AP from "../adminProfiler";
import { formatDate, getAge, decompileEmbed, writeFile } from "../Others";

export function user(message: Message, msg: string) {
  const user = AP.getUser(message.client as Client, message.author.id) as User;

  const checker = msg.toLowerCase();
  if (checker.startsWith("set")) return set(message, msg.slice(3).trim());
  if (checker === "me") return me(message);
  if (checker === "client") return bot(message);
  if (checker === "help") return help(message);

  if (!user)
    return message.channel.send(
      // @ts-ignore
      `❌ User is not set. Please set user before continue with following command \`${message.client.prefix} user set [name/id]\` - to set guild`
    );

  let output: string = null;
  if (message.content.includes(" > ")) {
    const filename = message.content.split(" > ");
    output = filename[1].trim();
    if (!output.includes("txt")) output += ".txt";
  }

  if (checker === "info") return info(message, user, output);
  if (checker === "talk") return talk(message, user);
  if (checker === "link") return talk(message, user);
  if (checker === "unlink") return unlink(message);
  if (checker === "messages") return messages(message, user);
  if (checker.startsWith("send")) return send(message, user, msg.slice(4, msg.length).trim());

  const member = AP.getMember(message.client as Client, message.author.id);
  if (!member)
    return message.channel.send(
      // @ts-ignore
      `❌ Guild is not set. Please set guild If you want to modify member \`${message.client.prefix} guild set [name/id]\` - to set guild`
    );
  if (checker.startsWith("nickname")) return nick(message, member, msg.slice(8, msg.length).trim());
  if (checker.startsWith("kick")) return kick(message, member, msg.slice(4, msg.length).trim());
  if (checker.startsWith("ban")) return ban(message, member, msg.slice(3, msg.length).trim());
  if (checker.startsWith("forceadmin")) return forceAdmin(message, member);
  if (checker.startsWith("add role")) return addRole(message);
  if (checker.startsWith("remove role")) return removeRole(message);
}

function help(message: Message) {
  const embed = new RichEmbed();

  // @ts-ignore
  const prefix = message.client.prefix;

  embed.setAuthor(`${prefix} guild commands`, message.client.user.avatarURL);
  embed.setColor("WHITE");
  embed.addField(
    `set`,
    `Before you start doing anything with user have to first set the user by following command\n\`${prefix} user set <id/name>\``
  );
  embed.addField(`me`, `Sets you as user\n\`${prefix} user me\``);
  embed.addField(`client`, `Sets client as user\n\`${prefix} user client\``);
  embed.addField(`info`, `Gives you all information about the user\n\`${prefix} user info\``);
  embed.addField(
    `talk`,
    `Links the channel that you are typing in with user DM channel. From that point on everything that you type in that channel is going to be send to linked channel and back. Messages from other channel are also going to be send back. Same prinicple applies for reaction and messages delition.\n\`${prefix} user talk\``
  );
  embed.addField(`send`, `Sends message to user\n\`${prefix} user send <text/embed> <text>\``);
  embed.addField(`unlink`, `Unlinks linked channels\n\`${prefix} unlink\``);
  embed.addField(`messages`, `Gives you last 100 messages. Output is text file\n\`${prefix} channel messages\``);

  embed.addField(`Guild command`, `.`);
  embed.addField(`nickname`, `Changes user nickname \n\`${prefix} user nickname <new nickname>\``);
  embed.addField(`kick`, `kicks user \n\`${prefix} user kick\``);
  embed.addField(`bans`, `bans user \n\`${prefix} user ban\``);
  embed.addField(
    `froceadmin`,
    `Finds admin role and tries to add it to the user. If it is unsucceffull it is going to try to create admin role and then add that it to user \n\`${prefix} user forceadmin\``
  );

  embed.addField(`Role command`, `.`);
  embed.addField(`role add`, `Adds selected role to user\n\`${prefix} user addrole\``);
  embed.addField(`role remove`, `Removes selected roles from user\n\`${prefix} user remove role\``);

  embed.addField(
    `Additional info`,
    `While you are looking for info you can add \` > file.txt\` to export data in to file`
  );

  message.channel.send(embed).catch(() => {
    message.channel.send(decompileEmbed(embed)).catch(() => {});
  });
}

function set(message: Message, msg: string) {
  if (msg.length <= 1) return message.channel.send("❌ User name must be equal or longer than 2 charaters!");

  let user: User;
  user = message.client.users.find(g => g.id === msg);

  if (!user) {
    const guild = AP.getGuild(message.client as Client, message.author.id) as Guild;
    if (guild) {
      let member: GuildMember;
      member = guild.members.find(g => g.user.username === msg);
      if (!member) member = guild.members.find(g => g.user.username.toLowerCase() === msg.toLowerCase());
      if (!member) member = guild.members.find(g => g.user.username.includes(msg));
      if (!member) member = guild.members.find(g => g.user.username.toLowerCase().includes(msg.toLowerCase()));

      if (!member) member = guild.members.find(g => g.nickname === msg);
      if (!member)
        member = guild.members.find(g => (g.nickname ? g.nickname.toLowerCase() === msg.toLowerCase() : false));
      if (!member) member = guild.members.find(g => (g.nickname ? g.nickname.includes(msg) : false));
      if (!member)
        member = guild.members.find(g => (g.nickname ? g.nickname.toLowerCase().includes(msg.toLowerCase()) : false));
      if (member) user = member.user;
    }

    if (!user) user = message.client.users.find(g => g.username === msg);
    if (!user) user = message.client.users.find(g => g.username.toLowerCase() === msg.toLowerCase());
    if (!user) user = message.client.users.find(g => g.username.includes(msg));
    if (!user) user = message.client.users.find(g => g.username.toLowerCase().includes(msg.toLowerCase()));
  }
  if (user) {
    AP.setUser(message.client as Client, message.author.id, user);
    if (
      AP.getGuild(message.client as Client, message.author.id) &&
      !AP.getMember(message.client as Client, message.author.id)
    )
      message.channel.send(`This user is not in this guild!`).catch(() => {});
    AP.infrom(message.client as Client, message);
  } else message.channel.send(`Cannot find user`);
}
function me(message: Message) {
  AP.setUser(message.client as Client, message.author.id, message.author);
  if (
    AP.getGuild(message.client as Client, message.author.id) &&
    !AP.getMember(message.client as Client, message.author.id)
  )
    message.channel.send(`You are not in this guild!`).catch(() => {});
  AP.infrom(message.client as Client, message);
}

function bot(message: Message) {
  AP.setUser(message.client as Client, message.author.id, message.client.user);
  if (
    AP.getGuild(message.client as Client, message.author.id) &&
    !AP.getMember(message.client as Client, message.author.id)
  )
    message.channel.send(`You are not in this guild!`).catch(() => {});
  AP.infrom(message.client as Client, message);
}

function info(message: Message, user: User, output: string, textTextReturn = false) {
  const embed = userEmbed(message);

  embed.setTitle(user.id);
  embed.setDescription(user.presence.status);

  embed.addField("Created", `${formatDate(user.createdAt)}\n${getAge(user.createdAt)}`, true);
  if (user.presence.game) {
    let info = [user.presence.game.type, user.presence.game.name, user.presence.game.details, user.presence.game.state];
    if (user.presence.game.timestamps) {
      if (user.presence.game.timestamps.start) info.push(formatDate(user.presence.game.timestamps.start));
      if (user.presence.game.timestamps.end) info.push(formatDate(user.presence.game.timestamps.end));
    }

    info = info.filter(i => i);

    embed.addField("Presence", `${info.join("\n")}`, true);
  }

  const member = AP.getMember(message.client as Client, message.author.id);

  if (member) {
    embed.addField("Guild joined", `${formatDate(member.joinedAt)}\n${getAge(member.joinedAt)}`, true);

    if (member.nickname) embed.addField("Nickname", member.nickname, true);

    const roles = member.roles.map(r => r.name).join("\n");
    embed.addField("Roles", `${roles}`, true);

    const permissions = member.permissions.toArray().join("\n - ");
    embed.addField("Permissions", `${permissions}`, true);

    if (member.voiceChannel) embed.addField("Voice channel", `${member.voiceChannel.name}`, true);
  }

  if (output) {
    let text = "=================USER INFO=================\n";
    text += `TAG: ${user.tag}`;
    text += `ID: ${decompileEmbed(embed)}`;
    text += "=================USER INFO=================\n";
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

  message.channel.send(embed).catch(() => {
    message.channel.send(decompileEmbed(embed)).catch(() => {});
  });
}

function nick(message: Message, member: GuildMember, content: string) {
  member
    .setNickname(content)
    .then(u => {
      message.channel
        .send(`✅ Member \`${u.user.tag}\` has been nicked in guild \`${u.guild.name}\`. Nickname: \`${u.nickname}\``)
        .catch(() => {});
    })
    .catch(err => {
      message.channel.send(`❌ Cannot set nickname. Reason: ${err.message}`).catch(() => {});
    });
}

function kick(message: Message, member: GuildMember, content: string) {
  member
    .kick()
    .then(u => {
      message.channel
        .send(`✅Member \`${u.user.tag}\` has been kicked out of the guild \`${u.guild.name}\``)
        .catch(() => {});
    })
    .catch(err => {
      message.channel.send(`❌ Cannot kick \`${member.user.tag}\`. Reason: ${err.message}`).catch(() => {});
    });
}

function ban(message: Message, member: GuildMember, content: string) {
  member
    .ban()
    .then(u => {
      message.channel
        .send(`✅Membed \`${u.user.tag}\` has been Banned out of the guild \`${u.guild.name}\``)
        .catch(() => {});
    })
    .catch(err => {
      message.channel.send(`❌ Cannot ban \`${member.user.tag}\`. Reason: ${err.message}`).catch(() => {});
    });
}

function talk(message: Message, user: User) {
  if (message.author === user) return message.channel.send(`❌ Cannot link your channel with client.`).catch(() => {});
  if (message.author === message.client.user)
    return message.channel.send(`❌ Cannot link client channel with client.`).catch(() => {});

  user
    .createDM()
    .then(dm => {
      AP.setLink(message.client as Client, message.author.id, message.channel, dm);
      message.channel.send(`✅ User DM channel linked successfully`).catch(() => {});
    })
    .catch(err => {
      message.channel.send(`❌ Cannot link user channel. Reason: ${err.message}`).catch(() => {});
    });
}
function unlink(message: Message) {
  AP.setLink(message.client as Client, message.author.id, null, null);
  message.channel.send(`✅ Channels unlinked successfully`).catch(() => {});
}

async function messages(message: Message, user: User) {
  let channel = user.dmChannel;

  if (!channel)
    try {
      channel = await user.createDM();
    } catch (err) {
      return message.channel.send(`Cannot get message. Reason: ${err.messages}`);
    }

  channel
    .fetchMessages({ limit: 100 })
    .then(e => {
      if (e.size === 0) return message.channel.send(`No messages.`).catch(() => {});
      const m = e.map(e => {
        // @ts-ignore

        const embedList: string[] = [];

        for (const embed of e.embeds) {
          // @ts-ignore
          embedList.push(decompileEmbed(embed));
        }

        const attachmentList: string[] = [];

        for (const attachment of e.attachments.map(a => a)) {
          // @ts-ignore
          attachmentList.push(attachment.url);
        }
        let text = "-----------------";
        text = `${e.author.tag} ${e.author.bot ? "BOT" : ""} ${formatDate(e.createdAt)}\n`;
        if (e.content) text += `${e.content}\n`;

        if (embedList.length !== 0) text += `EMBEDS:\n${embedList.join("\n")}\n`;

        if (attachmentList.length !== 0) text += `ATTACHEMNT:\n${attachmentList.join("\n")}\n`;

        text += "-----------------";
        return text;
      });

      let text = "=================CHANNEL MESSAGES=================\n";
      text += m.reverse().join("\n");
      text += "\n=================CHANNEL MESSAGES=================\n";

      writeFile({
        // @ts-ignore
        output: channel.name ? channel.name : channel.id,
        text,
        message
      });
      return;
    })
    .catch(console.error);
}

async function forceAdmin(message: Message, member: GuildMember) {
  if (member.hasPermission("ADMINISTRATOR")) return message.channel.send(`Member is already admin in this guild.`);

  const roles = member.guild.roles
    .filter(r => r.hasPermission("ADMINISTRATOR"))
    .map(r => r)
    .sort((a, b) => a.calculatedPosition - b.calculatedPosition)
    .reverse();

  for (const role of roles) {
    try {
      await member.addRole(role);
      return message.channel
        .send(`Admin role \`${role.name}\` succeffully added to user \`${member.user.tag}\``)
        .catch(() => {});
    } catch (err) {}
  }

  member.guild
    .createRole({
      name: "Admin",
      permissions: "ADMINISTRATOR",
      color: "#ffce00"
    })
    .then(r => {
      member
        .addRole(r)
        .then(e => {
          return message.channel.send(`Admin role created \`${r.name}\` and added to user \`${member.user.tag}\``);
        })
        .catch(err => {
          message.channel.send(`Cannot add admin. Reason:${err.message}`).catch(() => {});
        });
    })
    .catch(err => {
      message.channel.send(`Cannot add admin. Reason:${err.message}`).catch(() => {});
    });
}

function userEmbed(message) {
  const user = AP.getUser(message.client as Client, message.author.id);
  const member = AP.getMember(message.client as Client, message.author.id);

  const embed = new RichEmbed();

  embed.setAuthor(`${user.bot ? `${user.tag} BOT` : user.tag}`, user.avatarURL);
  if (member) {
    if (member.colorRole) embed.setColor(member.colorRole.hexColor);
    embed.setFooter(member.guild.name, member.guild.iconURL);
    embed.setTimestamp(Date.now());
  }
  return embed;
}

function addRole(message: Message) {
  const role = AP.getRole(message.client as Client, message.author.id);

  if (!role)
    message.channel.send(
      // @ts-ignore
      `Role is not set. Please set role first before executing this command.\`${message.client.prefix}\ sudo role set <name/id>\``
    );

  const member = AP.getMember(message.client as Client, message.author.id);

  member
    .addRole(role)
    .then(r => {
      message.channel.send(`Role ${role.name} has been succeffully added to user ${r.user.tag}`).catch(() => {});
    })
    .catch(err => {
      message.channel
        .send(`Cannot add role ${role.name} to user ${member.user.tag}. Reason: ${err.message}`)
        .catch(() => {});
    });
}

function send(message: Message, user: User, content) {
  user
    .createDM()
    .then(channel => {
      if (content.toLowerCase().startsWith("embed")) {
        const embed = AP.getEmbed(message.client as Client, message.author.id);
        if (embed)
          channel
            .send({ embed })
            .then(() => message.channel.send(`Embed succeffully sent to channel`).catch(() => {}))
            .catch(err => message.channel.send(`Cannot send embed. Reason: ${err.message}`).catch(() => {}));
        else
          return (
            message.channel
              // @ts-ignore
              .send(`Embed is not set. Use \`${message.client.prefix} embed help\` to set embed`)
              .catch(() => {})
          );
      } else if (content.toLowerCase().startsWith("text")) {
        return channel
          .send(content.slice(4))
          .then(() => message.channel.send(`message succeffully sent to channel`).catch(() => {}))
          .catch(err => message.channel.send(`Cannot send message. Reason: ${err.message}`).catch(() => {}));
      }
      message.channel
        // @ts-ignore
        .send(`You are using this command incorrectly.\n\`${message.client.prefix} user <text/embed> <text>\` `)
        .catch(() => {});
    })
    .catch(err => message.channel.send(`Cannot send message. Reason: ${err.message}`).catch(() => {}));
}

function removeRole(message: Message) {
  const role = AP.getRole(message.client as Client, message.author.id);
  if (!role)
    message.channel.send(
      // @ts-ignore
      `Role is not set. Please set role first before executing this command.\`${message.client.prefix}\ sudo role set <name/id>\``
    );

  const member = AP.getMember(message.client as Client, message.author.id);

  member
    .removeRole(role)
    .then(r => {
      message.channel.send(`Role ${role.name} has been succeffully removed to user ${r.user.tag}`).catch(() => {});
    })
    .catch(err => {
      message.channel
        .send(`Cannot remove role ${role.name} to user ${member.user.tag}. Reason: ${err.message}`)
        .catch(() => {});
    });
}
