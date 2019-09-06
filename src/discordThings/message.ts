import { Message, RichEmbed, TextChannel, Emoji } from "discord.js";
import * as AP from "../adminProfiler";
import { Client } from "../Client";
import { decompileEmbed, writeFile, formatDate } from "../Others";
import { guild } from "./guild";

export function userMessage(message: Message, content: string) {
  const msg = AP.getMessage(message.client as Client, message.author.id);
  const checker = content.toLowerCase();
  if (checker.startsWith("set")) return set(message, content.slice(3).trim());
  if (checker.startsWith("help")) return help(message);
  if (checker === "clear") return clear(message);

  let output: string = null;
  if (message.content.includes(" > ")) {
    const filename = message.content.split(" > ");
    output = filename[1].trim();
    if (!output.includes("txt")) output += ".txt";
  }

  if (!msg)
    return message.channel.send(
      // @ts-ignore
      `❌ Message is not set. Please set message before continue with following command \`${message.client.prefix} message set [id]\` - to set message`
    );

  if (checker.startsWith("info")) return info(message, msg, output);
  if (checker.startsWith("edit")) return edit(message, msg, content.slice(5, content.length).trim());
  if (checker.startsWith("react")) return react(message, msg, content.slice(6, content.length).trim());
  if (checker.startsWith("pin")) return pin(message, msg);
  if (checker.startsWith("unpin")) return unpin(message, msg);
  if (checker.startsWith("delete")) return deleteMsg(message, msg);
  if (checker.startsWith("clear reactions")) return clearReactions(message, msg);
}

function help(message: Message) {
  const embed = new RichEmbed();

  // @ts-ignore
  const prefix = message.client.prefix;

  embed.setAuthor(`${prefix} message commands`, message.client.user.avatarURL);
  embed.setColor("WHITE");
  embed.addField(`set`, `To set message\n\`${prefix} message <>\``);
  embed.addField(`info`, `Gives you all possbile information about the message\n\`${prefix} message info\``);
  embed.addField(`react`, `react to message\n\`${prefix} message react <emoji>\``);
  embed.addField(`delete`, `delete the message\n\`${prefix} message delete\``);
  embed.addField(`pin`, `pin the message\n\`${prefix} message pin\``);
  embed.addField(`unpin`, `unpin the message\n\`${prefix} message unpin\``);
  embed.addField(`edit`, `edit the message\n\`${prefix} message edit <text/embed> <text>\``);
  embed.addField(`clear reactions`, `clears message reactions\n\`${prefix} message clear reactions\``);
  embed.addField(
    `Additional info`,
    `While you are looking for info you can add \` > file.txt\` to export data in to file`
  );

  message.channel.send(embed).catch(() => {
    message.channel.send(decompileEmbed(embed)).catch(() => {});
  });
}

function set(message: Message, msg: string) {
  const channel = AP.getChannel(message.client as Client, message.author.id) as TextChannel;

  if (!channel)
    // @ts-ignore
    return message.channel.send(`Please select channel first\n\`${message.client.prefix} channel set <id/name>\``);
  if (channel.type === "voice") return message.channel.send(`Cannot find messages in voice channel`);

  channel
    .fetchMessages({ limit: 100 })
    .then(mes => {
      const m = mes.find(m => m.id === msg);

      if (!m) return message.channel.send(`Cannot find message`).catch(() => {});
      else {
        AP.setMessage(message.client as Client, message.author.id, m);
        AP.infrom(message.client as Client, message);
      }
    })
    .catch(err => {
      message.channel.send(`Cannot fetch messages. Reason: ${err.message}`);
    });
}

function clear(message: Message) {
  AP.setMessage(message.client as Client, message.author.id, null);
  message.channel.send(`♻️ Message has been cleared`).catch(() => {});
}

function info(message: Message, msg: Message, output?: string, textTextReturn = false) {
  if (output) {
    let text = "=================MESSAGE INFO=================\n";
    text += `AUTHOR: ${msg.author.bot ? `${msg.author.tag} BOT` : msg.author.tag}\n`;
    text += `AUTHOR ID: ${msg.author.id}\n`;
    text += `ID: ${msg.id}\n`;
    text += `TIME: ${formatDate(new Date(msg.createdTimestamp))}\n`;
    if (msg.editedAt) text += `EDITED: ${formatDate(new Date(msg.editedAt))}\n`;
    if (msg.content) text += `CONTENT:\n${msg.content}\n`;
    if (msg.embeds.length) {
      text += `EMBEDS:\n`;
      for (const e of msg.embeds) {
        if (e.author) text += `${e.author}\n`;
        text += `${decompileEmbed(e)}`;
        if (e.footer) text += `${e.footer}\n`;
      }
    }
    if (msg.attachments.size) {
      text += `ATTACHMENTS:\n`;
      msg.attachments.forEach(att => {
        text += `ID${att.id}\n`;
        text += `URL${att.url}\n`;
      });
    }

    text += "=================MESSAGE INFO=================\n";
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

  embed.setAuthor(msg.author.bot ? `${msg.author.tag} BOT` : msg.author.tag, msg.author.avatarURL);
  embed.setDescription(msg.content);
  embed.setTitle(msg.id);
  embed.setColor("WHITE");
  embed.setTimestamp(msg.createdTimestamp);

  if (msg.embeds.length) embed.addField(`Embeds`, msg.embeds.length);
  if (msg.attachments.size) embed.addField(`Embeds`, msg.attachments.size);
  if (msg.guild) {
    embed.setFooter(msg.guild.name, msg.guild.iconURL);
    const role = msg.member.colorRole;
    if (role && role.hexColor) embed.setColor(role.hexColor);
  }
  if (msg.reactions.size) {
    embed.addField(`Reactions`, msg.reactions.map(e => e.emoji.name));
  }

  message.channel.send(embed).catch(() => {
    message.channel.send(decompileEmbed(embed)).catch(() => {});
  });
}

function react(message: Message, msg: Message, content: string) {
  let reaction: Emoji | string = content.replace(/:/g, "");
  if (msg.guild) {
    const emoji = msg.guild.emojis.find(e => e.name === content);
    if (emoji) reaction = emoji;
  }

  msg
    .react(reaction)
    .then(result => {
      message.channel.send(`Message has been reacted with \`${content}\``).catch(() => {});
    })
    .catch(err => {
      message.channel.send(`Cannot react to the message. Reason: \`${err.message}\``).catch(() => {});
    });
}

function deleteMsg(message: Message, msg: Message) {
  msg
    .delete()
    .then(result => {
      message.channel.send(`Message has been deleted`).catch(() => {});
    })
    .catch(err => {
      message.channel.send(`Cannot delete the message. Reason: \`${err.message}\``).catch(() => {});
    });
}

function pin(message: Message, msg: Message) {
  msg
    .pin()
    .then(result => {
      message.channel.send(`Message has been pined`).catch(() => {});
    })
    .catch(err => {
      message.channel.send(`Cannot pin the message. Reason: \`${err.message}\``).catch(() => {});
    });
}

function unpin(message: Message, msg: Message) {
  msg
    .delete()
    .then(result => {
      message.channel.send(`Message has been unpined`).catch(() => {});
    })
    .catch(err => {
      message.channel.send(`Cannot unpin the message. Reason: \`${err.message}\``).catch(() => {});
    });
}

function clearReactions(message: Message, msg: Message) {
  msg
    .clearReactions()
    .then(result => {
      message.channel.send(`Message reactions has been cleared`).catch(() => {});
    })
    .catch(err => {
      message.channel.send(`Cannot clear message reaction. Reason: \`${err.message}\``).catch(() => {});
    });
}

function edit(message: Message, msg: Message, content: string) {
  if (content.toLowerCase().startsWith("embed")) {
    const embed = AP.getEmbed(message.client as Client, message.author.id);
    if (embed)
      msg
        .edit({ embed })
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
    return msg
      .edit(content.slice(4))
      .then(() => message.channel.send(`Message succeffully sent to channel`).catch(() => {}))
      .catch(err => message.channel.send(`Cannot send message. Reason: ${err.message}`).catch(() => {}));
  } else {
    message.channel
      // @ts-ignore
      .send(`You are using this command incorrectly.\n\`${message.client.prefix} message edit <text/embed> <text>\` `)
      .catch(() => {});
  }
}
