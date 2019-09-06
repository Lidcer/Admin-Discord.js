import {
  Channel,
  GroupDMChannel,
  Guild,
  RichEmbed,
  TextChannel,
  Message,
  VoiceChannel,
  CategoryChannel,
  NewsChannel,
  StoreChannel,
  GuildChannel,
  ChannelData
} from "discord.js";
import { Client } from "../Client";
import * as AP from "../adminProfiler";
import { decompileEmbed, formatDate, getAge, writeFile } from "../Others";

export function channel(message: Message, msg: string) {
  const channel = AP.getChannel(message.client as Client, message.author.id);

  const checker = msg.toLowerCase();
  if (checker.startsWith("set")) return set(message, msg.slice(3).trim());
  if (checker.startsWith("this")) return that(message);
  if (checker.startsWith("help")) return help(message);
  else if (checker.startsWith("create")) return create(message, channel, msg.slice(6, msg.length).trim());

  if (!channel)
    return message.channel.send(
      // @ts-ignore
      `❌ Channel is not set. Please set channel before continue with following command \`${message.client.prefix} channel set [name/id]\` - to set channel`
    );

  let output: string = null;
  if (message.content.includes(" > ")) {
    const filename = message.content.split(" > ");
    output = filename[1].trim();
    if (!output.includes("txt")) output += ".txt";
  }

  if (checker.startsWith("info")) return info(message, channel, output);
  else if (checker.startsWith("messages")) return messages(message, channel, output);
  else if (checker.startsWith("send")) return send(message, channel as TextChannel, msg.slice(4, msg.length).trim());
  else if (checker.startsWith("link")) return link(message, channel);
  else if (checker.startsWith("unlink")) return unlink(message);
  else if (checker.startsWith("topic")) return topic(message, channel, msg.slice(6, msg.length).trim());
  else if (checker.startsWith("move")) return move(message, channel, msg.slice(4, msg.length).trim());
  else if (checker.startsWith("nsfw")) return nsfw(message, channel, msg.slice(4, msg.length).trim());
  else if (checker.startsWith("rename"))
    return rename(message, channel as GuildChannel, msg.slice(6, msg.length).trim());
  else if (checker.startsWith("delete")) return deleteChannel(message, channel as GuildChannel);
}

function help(message: Message) {
  const embed = new RichEmbed();

  // @ts-ignore
  const prefix = message.client.prefix;

  embed.setAuthor(`${prefix} channel commands`, message.client.user.avatarURL);
  embed.setColor("WHITE");
  embed.addField(
    `set`,
    `Before you start manipulating with channels you have to first set channel by following command\n\`${prefix} channel set <id/name>\``
  );
  embed.addField(
    `this`,
    `Same as set but this one is going to select that channel that you are currently typing in.\n\`${prefix} channel this\``
  );
  embed.addField(`send`, `Sends message in channel\n\`${prefix} channel send <text/embed> <text>\``);
  embed.addField(`messages`, `Gives you last 100 messages. Output is text file\n\`${prefix} channel messages\``);
  embed.addField(
    `link`,
    `Links the channel that you are typing in with selected channel. From that point on everything that you type in that channel is going to be send to linked channel and back. Messages from other channel are also going to be send back. Same prinicple applies for reaction and messages delition.\n\`${prefix} channel link\``
  );
  embed.addField(`unlink`, `Unlinks linked channels\n\`${prefix} unlink\``);
  embed.addField(`move`, `Move channel position\n\`${prefix} move <up/down/number>\``);
  embed.addField(`nsfw`, `Changes channel nsfw flag\n\`${prefix} nsfw <true/false>\``);
  embed.addField(`rename`, `Changes channel name\n\`${prefix} rename <new name>\``);
  embed.addField(`topic`, `Changes channel topic\n\`${prefix} topic <new topic>\``);
  embed.addField(`delete`, `Deletes channel\n\`${prefix} delete\``);

  embed.addField(
    `Additional info`,
    `While you are looking for info you can add \` > file.txt\` to export data in to file`
  );

  message.channel.send(embed).catch(() => {
    message.channel.send(decompileEmbed(embed)).catch(() => {});
  });
}

function set(message: Message, msg: string) {
  if (msg.length <= 1) return message.channel.send("❌ Channel name must be equal or longer than 1 charaters!");

  const selectChannel = channel => {
    const guild = AP.getGuild(message.client as Client, message.author.id) as Guild;

    AP.setGuild(message.client as Client, message.author.id, channel.guild);
    AP.setChannel(message.client as Client, message.author.id, channel);

    if (guild && !channel.guild) message.channel.send("Channel is not inside guild");
    else if (guild && channel.guild !== guild)
      message.channel.send("Guild has been change because channel guild did not match with current guild");

    AP.infrom(message.client, message);
  };

  let channel;
  channel = message.client.channels.find(g => g.id === msg);

  if (!channel) {
    const guild = AP.getGuild(message.client as Client, message.author.id) as Guild;
    if (guild) {
      if (!channel) channel = guild.channels.find(g => g.name === msg);
      if (!channel) channel = guild.channels.find(g => g.name.toLowerCase() === msg.toLowerCase());
      if (!channel) channel = guild.channels.find(g => g.name.includes(msg));
      if (!channel) channel = guild.channels.find(g => g.name.toLowerCase().includes(msg.toLowerCase()));

      if (channel) selectChannel(channel);
      else message.channel.send("❌ Unable to find channel!").catch(() => {});
    } else message.channel.send("❌ Unable to find channel by name if guild is not set!").catch(() => {});
  } else selectChannel(channel);
}

function that(message: Message) {
  if (message.guild) AP.setGuild(message.client as Client, message.author.id, message.guild);

  AP.setChannel(message.client as Client, message.author.id, message.channel);

  AP.infrom(message.client, message);
}

function info(message: Message, channel: Channel, output?: string, textTextReturn = false) {
  const embed = channelEmbed(message);
  embed.addField("ID", channel.id);
  embed.addField("Date Created", `${formatDate(channel.createdAt)}\n ${getAge(channel.createdAt)}`);

  if (channel.type === "text") {
    const textChannel = channel as TextChannel;
    embed.addField("Title", textChannel.name);
    if (textChannel.topic) embed.addField("Description", textChannel.topic);
    embed.addField("NSFW", textChannel.nsfw);
    embed.addField("Position", textChannel.calculatedPosition);
  } else if (channel.type === "voice" || channel.type === "news") {
    const voiceChannel = channel as VoiceChannel;

    embed.addField("Title", voiceChannel.name);
    if (voiceChannel.userLimit > 0)
      embed.addField("user limit", `${voiceChannel.members.size}/${voiceChannel.userLimit}`);
    else embed.addField("connected users", `${voiceChannel.members.size}`);
    embed.addField("Position", voiceChannel.calculatedPosition);
  } else if (channel.type === "group") {
    const groupChannel = channel as GroupDMChannel;
    embed.addField("Title", groupChannel.name);
    embed.setThumbnail(groupChannel.icon);
    embed.addField("Owner", `${groupChannel.owner.tag}`);
  } else if (channel.type === "store") {
    const storeChannel = channel as StoreChannel;
    embed.addField("Title", storeChannel.name);
    embed.addField("NSFW", storeChannel.nsfw);
    embed.addField("Position", storeChannel.calculatedPosition);
  }

  embed.addField("Type", channel.type);

  if (output) {
    let text = "=================CHANNEL INFO=================\n";
    text += decompileEmbed(embed);
    text += "=================CHANNEL INFO=================\n";
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

function messages(message: Message, channel: Channel, output?: string, textTextReturn = false) {
  if (channel.type === "voice") return message.channel.send("You cannot get messages from voice channels");

  const c = channel as TextChannel;

  c.fetchMessages({ limit: 100 })
    .then(e => {
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
      if (textTextReturn) return text;
      else {
        writeFile({
          // @ts-ignore
          output: channel.name ? channel.name : channel.id,
          text,
          message
        });
        return;
      }
    })
    .catch(console.error);
}

function link(message: Message, channel: Channel) {
  if (message.channel === channel) return message.channel.send(`❌ Cannot link two same channels`).catch(() => {});
  if (channel.type === "voice") return message.channel.send(`❌ Cannot link voice channel`).catch(() => {});
  if (channel.type === "category") return message.channel.send(`❌ Cannot link category channel`).catch(() => {});

  AP.setLink(message.client as Client, message.author.id, message.channel, channel);
  message.channel.send(`✅ Channels linked successfully`).catch(() => {});
}

function unlink(message: Message) {
  AP.setLink(message.client as Client, message.author.id, null, null);
  message.channel.send(`✅ Channels unlinked successfully`).catch(() => {});
}

function create(message: Message, channel: Channel, content: string) {
  const guild = AP.getGuild(message.client as Client, message.author.id) as Guild;
  if (!guild) return `Guild is not set. Please set the guild before using this command`;

  let a: ChannelData = {
    type: "text"
  };

  if (content.match(/--text/g)) {
    content = content.replace(/--text/g, "");
  } else if (content.match(/--voice/g)) {
    content = content.replace(/--voice/g, "");
    a.type = "voice";
  }
  if (content.match(/--category/g)) {
    content = content.replace(/--category/g, "");
    a.type = "category";
  }
  if (content.match(/--store/g)) {
    content = content.replace(/--store/g, "");
    a.type = "store";
  }
  if (content.match(/--news/g)) {
    content = content.replace(/--news/g, "");
    a.type = "news";
  }

  if (channel && a.type !== "category") {
    const c = channel as CategoryChannel;

    if (c.type === "category") a = { parent: c };
    else if (c.parent) a = { parent: c.parent };
  }

  guild
    .createChannel(content, a)
    .then(x => {
      message.channel.send(`Channel has been succeffully created`).catch(() => {});

      AP.setChannel(message.client as Client, message.author.id, x);
      AP.infrom(message.client, message);
    })
    .catch(err => {
      message.channel.send(`Cannot create channel. Reason : ${err.message}`);
    });
}

function move(message: Message, channel: Channel, content: string) {
  const guild = AP.getGuild(message.client as Client, message.author.id) as Guild;
  if (!guild) return `Guild is not set. Please set the guild before using this command`;

  const c = channel as GuildChannel;

  let i = -1;

  if (content.toLowerCase() === "up") i = c.position + 1;
  else if (content.toLowerCase() === "down") i = c.position - 1;
  else if (!isNaN(parseInt(content))) i = parseInt(content);
  else
    return (
      message.channel
        // @ts-ignore
        .send(`You are using this command incorrecly. Please check \`${message.client.prefix} channel help\``)
        .catch(() => {})
    );

  c.setPosition(i)
    .then(e => message.channel.send(`Channel succesffully moved`).catch(() => {}))
    .catch(err => message.channel.send(`Cannot set channel position. Reason : ${err.message}`).catch(() => {}));
}

function topic(message: Message, channel: Channel, content: string) {
  if (channel.type === "text" || channel.type === "store" || channel.type === "news") {
    const c = channel as TextChannel;

    c.setTopic(content)
      .then(p => {
        message.channel
          // @ts-ignore
          .send(`Channel topic has been changed succeffully. New Channel topic\n ${p.topic}`)
          .catch(() => {});
      })
      .catch(err => {
        message.channel.send(`Unable to change channel topic. Reason: ${err.message}`).catch(() => {});
      });
  } else if (channel.type === "voice") {
    message.channel.send(`Voice channels do not have topic`).catch(() => {});
  } else if (channel.type === "category") {
    message.channel.send(`Category channels do not have topic`).catch(() => {});
  } else message.channel.send(`Cannot change topic to this channel`).catch(() => {});
}

function nsfw(message: Message, channel: Channel, content: string) {
  if (channel.type === "text" || channel.type === "store" || channel.type === "news") {
    const c = channel as TextChannel;

    let type = null;

    if (content === "yes") type = true;
    if (content === "true") type = true;
    if (content === "false") type = false;
    if (content === "no") type = false;
    if (type === null)
      return (
        message.channel
          // @ts-ignore
          .send(`You are using this command incorrecly. Please check \`${message.client.prefix} channel help\``)
          .catch(() => {})
      );

    // @ts-ignore
    c.setNSFW(type)
      .then(p => {
        // @ts-ignore
        message.channel.send(`Channel NSFW type has been changed succeffully. Channel NSFW: ${p.nsfw}`).catch(() => {});
        AP.setChannel(message.client as Client, message.author.id, null);
      })
      .catch(err => {
        message.channel.send(`Unable to change channel NSFW type. Reason: ${err.message}`).catch(() => {});
      });
  } else if (channel.type === "voice") {
    message.channel.send(`Voice channels do not have nsfw flag.`).catch(() => {});
  } else if (channel.type === "category") {
    message.channel.send(`Category channels do not have nsfw flag.`).catch(() => {});
  } else message.channel.send(`This channel do not have nsfw flag`).catch(() => {});
}

function deleteChannel(message: Message, channel: GuildChannel) {
  if (!channel.guild) return message.channel.send(`This channel in not in guild. It cannot be delted.`).catch(() => {});

  channel
    .delete()
    .then(() => {
      message.channel.send(`Channel deleted succeffully.`).catch(() => {});
    })
    .catch(() => {});
}

function rename(message: Message, channel: GuildChannel, content: string) {
  channel
    .setName(content)
    .then(p => {
      message.channel.send(`Name changed succeffully to ${p.name}`).catch(() => {});
    })
    .catch(err => {
      message.channel.send(`Cannot change the name. Reason: ${err.message}`).catch(() => {});
    });
}

function send(message: Message, channel: TextChannel, content) {
  if (channel.type === "voice") return message.channel.send(`Cannot send in voice channel`).catch(() => {});
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
      .then(() => message.channel.send(`Message succeffully sent to channel`).catch(() => {}))
      .catch(err => message.channel.send(`Cannot send message. Reason: ${err.message}`).catch(() => {}));
  } else {
    message.channel
      // @ts-ignore
      .send(`You are using this command incorrectly.\n\`${message.client.prefix} channel <text/embed> <text>\` `)
      .catch(() => {});
  }
}

function channelEmbed(message: Message) {
  const embed = new RichEmbed();
  embed.setColor("WHITE");
  const guild = AP.getGuild(message.client as Client, message.author.id) as Guild;

  if (guild) embed.setAuthor(guild.name, guild.iconURL);

  embed.setFooter(guild.client.user.tag, guild.client.user.avatarURL);
  embed.setTimestamp(Date.now());

  return embed;
}
