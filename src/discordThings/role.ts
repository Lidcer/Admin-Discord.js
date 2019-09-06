import { Message, Guild, Role, RichEmbed, PermissionResolvable } from "discord.js";
import * as AP from "../adminProfiler";

import { Client } from "../Client";
import { formatDate, getAge, decompileEmbed, writeFile, createFields } from "../Others";

const toLongList = "❌ The list is to long try using export command ` > export.txt`";

export function role(message: Message, msg: string) {
  const role = AP.getRole(message.client as Client, message.author.id);

  const checker = msg.toLowerCase();
  if (checker.startsWith("set")) return set(message, msg.slice(3).trim());
  if (checker === "help") return help(message);

  if (!role)
    return message.channel.send(
      // @ts-ignore
      `❌ Role is not set. Please set role before continue with following command \`${message.client.prefix} role set [name/id]\` - to set guild`
    );

  let output: string = null;
  if (message.content.includes(" > ")) {
    const filename = message.content.split(" > ");
    output = filename[1].trim();
    if (!output.includes("txt")) output += ".txt";
  }

  if (checker.startsWith("info")) return info(message, role, output);
  if (checker.startsWith("delete")) return deleteRole(message, role);
  if (checker.startsWith("color")) return color(message, role, msg.slice(5, msg.length).trim());
  if (checker.startsWith("hoist")) return hoist(message, role, msg.slice(5, msg.length).trim());
  if (checker.startsWith("rename")) return rename(message, role, msg.slice(5, msg.length).trim());
  if (checker.startsWith("mentionable")) return mentionable(message, role, msg.slice(11, msg.length).trim());
  if (checker.startsWith("permissions")) return permission(message, role, msg.slice(11, msg.length).trim());
  if (checker.startsWith("move")) return move(message, role, msg.slice(4, msg.length).trim());
  if (checker.startsWith("members")) return members(message, role);
  else {
    // @ts-ignore
    message.channel.send(`You are using this command incorrectly use \`${message.client.prefix} role help\``);
  }
}

function help(message: Message) {
  const embed = new RichEmbed();

  // @ts-ignore
  const prefix = message.client.prefix;

  embed.setAuthor(`${prefix} role commands`, message.client.user.avatarURL);
  embed.setColor("WHITE");
  embed.addField(
    `set`,
    `Before you start doing anything with user role you have to first set the role by following command\n\`${prefix} role set <id/name>\``
  );
  embed.addField(`members`, `Gives you which members have this role in guild\n\`${prefix} role members\``);
  embed.addField(`info`, `Gives you all possbile information about the role\n\`${prefix} role info\``);
  embed.addField(`color`, `Set the color of role\n\`${prefix} role color <color>\``);
  embed.addField(`hoist`, `Set the role hoist\n\`${prefix} role hoist <true/false>\``);
  embed.addField(`rename`, `Renames the role\n\`${prefix} role rename <name>\``);
  embed.addField(`permissions`, `Sets the permission of the role\n\`${prefix} role permissions <Permissions.FLAG>\``);
  embed.addField(`move`, `Moves role position\n\`${prefix} role move <up/down/number>\` `);
  embed.addField(
    `Additional info`,
    `While you are looking for info you can add \` > file.txt\` to export data in to file`
  );

  message.channel.send(embed).catch(() => {
    message.channel.send(decompileEmbed(embed)).catch(() => {});
  });
}

function set(message: Message, msg: string) {
  if (msg.length <= 1) return message.channel.send("❌ Role name must be equal or longer than 2 charaters!");
  const guild = AP.getGuild(message.client as Client, message.author.id) as Guild;
  if (!guild) return message.channel.send("❌ You have to set guild first to be able to set role!");

  let role;
  role = guild.roles.find(g => g.id === msg);

  if (!role) role = guild.roles.find(g => g.name === msg);
  if (!role) role = guild.roles.find(g => g.name.toLowerCase() === msg.toLowerCase());
  if (!role) role = guild.roles.find(g => g.name.includes(msg));
  if (!role) role = guild.roles.find(g => g.name.toLowerCase().includes(msg.toLowerCase()));

  if (role) {
    AP.setRole(message.client as Client, message.author.id, role);
    AP.infrom(message.client as Client, message);
  } else message.channel.send("❌ Unable to find role!").catch(() => {});
}

function members(message: Message, role: Role) {
  const embed = roleEmbed(message);

  const guild = role.guild;

  const users = guild.members.filter(m => (m.roles.find(r => r === role) ? true : false)).map(m => m);
  if (users.length === 0) return message.channel.send(`❌ Cannot find any members with this role`).catch(() => {});

  embed.setTitle("Members");
  embed.setDescription(`Total members with role \`${role.name}\` ${users.length}`);

  const names = users.map(m => m.user.tag) as string[];
  message.channel.stopTyping();
  if (!createFields(embed, names.join("\n"))) return message.channel.send(toLongList);
  else message.channel.send(embed);
}

function info(message: Message, role: Role, output: string, textTextReturn = false) {
  const embed = roleEmbed(message);

  const guild = role.guild;

  const users = guild.members.filter(m => (m.roles.find(r => r === role) ? true : false)).map(m => m);
  if (users.length === 0) return message.channel.send(`❌ Cannot find any members with this role`).catch(() => {});

  embed.setAuthor(role.name);
  embed.setTitle(role.id);

  embed.setColor(role.hexColor);
  embed.addField(`Created`, `${formatDate(role.createdAt)}\n${getAge(role.createdAt)}`);
  embed.addField(`Permission`, role.permissions);
  embed.addField(`Mentionable`, role.mentionable);
  embed.addField(`Color`, role.hexColor);
  embed.addField(`Hoist`, role.hoist);
  embed.addField(`Position`, role.position);
  embed.addField(`Total users`, users.length);

  if (output) {
    let text = "=================ROLE INFO=================\n";
    text += `TAG: ${role.name}`;
    text += `ID: ${decompileEmbed(embed)}`;
    text += "=================ROLE INFO=================\n";
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
function rename(message: Message, role: Role, content: string) {
  const currentName = role.name;

  role
    .setName(content)
    .then(r => {
      message.channel.send(`✅ Role has been succeffully renamed from ${currentName} to ${r.name}`).catch(() => {});
    })
    .catch(err => {
      message.channel.send(`❌ Cannot rename role. Reason ${err.message}`).catch(() => {});
    });
}
function deleteRole(message: Message, role: Role) {
  role
    .delete()
    .then(r => {
      message.channel.send(`✅ Role has been deleted`).catch(() => {});
    })
    .catch(err => {
      message.channel.send(`❌ Cannot delete role. Reason ${err.message}`).catch(() => {});
    });
}

function color(message: Message, role: Role, content: string) {
  const currentColor = role.hexColor;

  role
    .setColor(content)
    .then(r => {
      message.channel.send(`✅ Role color has been changed from ${currentColor} to ${role.hexColor}`).catch(() => {});
    })
    .catch(err => {
      message.channel.send(`❌ Cannot change color of role. Reason ${err.message}`).catch(() => {});
    });
}

function hoist(message: Message, role: Role, content: string) {
  let type = null;

  if (content === "yes") type = true;
  if (content === "true") type = true;
  if (content === "false") type = false;
  if (content === "no") type = false;
  if (type === null)
    return (
      message.channel
        // @ts-ignore
        .send(`❌ You are using this command incorrecly. Please check \`${message.client.prefix} role help\``)
        .catch(() => {})
    );

  role
    .setHoist(type)
    .then(r => {
      message.channel.send(`✅ role is now ${r.hoist ? " " : "not "}hoisted`).catch(() => {});
    })
    .catch(err => {
      message.channel.send(`❌ Cannot change hoist of role. Reason ${err.message}`).catch(() => {});
    });
}

function mentionable(message: Message, role: Role, content: string) {
  let type = null;

  if (content === "yes") type = true;
  if (content === "true") type = true;
  if (content === "false") type = false;
  if (content === "no") type = false;
  if (type === null)
    return (
      message.channel
        // @ts-ignore
        .send(`❌ You are using this command incorrecly. Please check \`${message.client.prefix} role help\``)
        .catch(() => {})
    );

  role
    .setMentionable(type)
    .then(r => {
      message.channel.send(`✅ role is now ${r.hoist ? " " : "not "}mentionable`).catch(() => {});
    })
    .catch(err => {
      message.channel.send(`❌ Cannot change mentionable of role. Reason ${err.message}`).catch(() => {});
    });
}

function permission(message: Message, role: Role, content: string) {
  try {
    const a = content.split("\n") as PermissionResolvable;

    role
      .setPermissions(a)
      .then(r => {
        message.channel.send(`✅ Role permission has been updated`).catch(() => {});
      })
      .catch(err => {
        message.channel.send(`❌ Cannot change role permissions. Reason ${err.message}`).catch(() => {});
      });
  } catch (err) {
    message.channel.send(`❌ Cannot change role permissions. Reason ${err.message}`).catch(() => {});
  }
}

function move(message: Message, role: Role, content: string) {
  let i = -1;

  const currentPos = role.position;

  if (content.toLowerCase() === "up") i = role.position + 1;
  else if (content.toLowerCase() === "down") i = role.position - 1;
  else if (!isNaN(parseInt(content))) i = parseInt(content);
  else
    return (
      message.channel
        // @ts-ignore
        .send(`❌ You are using this command incorrecly. Please check \`${message.client.prefix} channel help\``)
        .catch(() => {})
    );

  role
    .setPosition(i)
    .then(e => message.channel.send(`✅ role succesffully moved from ${currentPos} to ${e.position}`).catch(() => {}))
    .catch(err => message.channel.send(`❌ Cannot set role position. Reason : ${err.message}`).catch(() => {}));
}

function roleEmbed(message) {
  const guild = AP.getGuild(message.client as Client, message.author.id);

  const embed = new RichEmbed();

  embed.setFooter(guild.name, guild.iconURL);
  embed.setTimestamp(Date.now());

  return embed;
}
