import { Message, Guild, RichEmbed, Emoji } from "discord.js";
import { Client } from "../Client";
import { formatDate, getAge, decompileEmbed } from "../Others";
import * as AP from "../adminProfiler";

export function emoji(message: Message, msg: string) {
  const emoji = AP.getEmoji(message.client as Client, message.author.id);

  const checker = msg.toLowerCase();
  if (checker.startsWith("set")) return set(message, msg.slice(3).trim());
  if (checker.startsWith("help")) return help(message);
  if (checker.startsWith("create")) return create(message, msg.slice(5, msg.length).trim());

  if (!emoji)
    return message.channel.send(
      // @ts-ignore
      `❌ Emoji is not set. Please set emoji before continue with following command \`${message.client.prefix} emoji set [name/id]\` - to set guild`
    );

  let output: string = null;
  if (message.content.includes(" > ")) {
    const filename = message.content.split(" > ");
    output = filename[1].trim();
    if (!output.includes("txt")) output += ".txt";
  }

  if (checker.startsWith("info")) return info(message, emoji, output);
  if (checker.startsWith("delete")) return deleteEmoji(message, emoji);
  if (checker.startsWith("rename")) return rename(message, emoji, msg.slice(5, msg.length).trim());
  // else if (checker === 'nuke') return nuke(message, guild);
  else {
    // @ts-ignore
    message.channel.send(`You are using this command incorrectly use \`${message.client.prefix} role help\``);
  }
}

function set(message: Message, msg: string) {
  if (msg.length <= 1) return message.channel.send("❌ Emoji name must be equal or longer than 2 charaters!");
  const guild = AP.getGuild(message.client as Client, message.author.id) as Guild;
  if (!guild) return message.channel.send("❌ You have to set guild first to be able to set emoji!");

  let emoji: Emoji;
  emoji = message.client.emojis.find(g => g.id === msg);

  if (emoji) {
    AP.setEmoji(message.client as Client, message.author.id, emoji);
    if (emoji.guild !== guild) {
      if (guild) message.channel.send(`Guild has been changed becuse selected emoji was not it right guild.`);
      AP.setGuild(message.client as Client, message.author.id, emoji.guild);
      AP.setChannel(message.client as Client, message.author.id, null);
      AP.infrom(message.client as Client, message);
      return;
    }
  }

  if (!emoji) emoji = guild.emojis.find(g => g.name === msg);
  if (!emoji) emoji = guild.emojis.find(g => g.name.toLowerCase() === msg.toLowerCase());
  if (!emoji) emoji = guild.emojis.find(g => g.name.includes(msg));
  if (!emoji) emoji = guild.emojis.find(g => g.name.toLowerCase().includes(msg.toLowerCase()));

  if (emoji) {
    AP.setEmoji(message.client as Client, message.author.id, emoji);
    AP.infrom(message.client as Client, message);
  } else message.channel.send("❌ Unable to find Emoji!").catch(() => {});
}

function help(message: Message) {
  const embed = new RichEmbed();

  // @ts-ignore
  const prefix = message.client.prefix;

  embed.setAuthor(`${prefix} role commands`, message.client.user.avatarURL);
  embed.setColor("WHITE");
  embed.addField(
    `set`,
    `Before you start doing anything with emoji you have to first set the emoji by following command\n\`${prefix} emoji set <id/name>\``
  );
  embed.addField(`info`, `Gives you all the info about\n\`${prefix} emoji info\``);
  embed.addField(`delete`, `Deletes emoji\n\`${prefix} emoji delete\``);
  embed.addField(`rename`, `Renames emoji\n\`${prefix} emoji rename <name>\``);
  embed.addField(`create`, `Creates emoji\n\`${prefix} emoji create <name> <url or attachment>\``);

  message.channel.send(embed).catch(() => {
    message.channel.send(decompileEmbed(embed)).catch(() => {});
  });
}

function info(message: Message, emoji: Emoji, output: string, textTextReturn = false) {
  const embed = emojiEmbed(message);

  embed.setThumbnail(emoji.url);

  embed.setAuthor(emoji.name, emoji.url);
  embed.setTitle(emoji.id);
  embed.setDescription(emoji.identifier);
  embed.addField("Created at", `${formatDate(emoji.createdAt)}\n${getAge(emoji.createdAt)}`);
  embed.addField(`Url`, emoji.url);

  message.channel.send(embed).catch(() => {
    message.channel.send(decompileEmbed(embed)).catch(() => {});
  });
}

function rename(message: Message, emoji: Emoji, content: string) {
  const currentName = emoji.name;

  emoji
    .setName(content)
    .then(e => {
      message.channel.send(`Emoji name has been changed from ${currentName} to ${e.name}.`).catch(() => {});
    })
    .catch(err => {
      message.channel.send(`Cannot set emoji name. Reason: ${err.message}`).catch(() => {});
    });
}

function deleteEmoji(message: Message, emoji: Emoji) {
  emoji.guild
    .deleteEmoji(emoji)
    .then(e => {
      message.channel.send(`Emoji name has been deleted.`).catch(() => {});
    })
    .catch(err => {
      message.channel.send(`Cannot demoji name. Reason: ${err.message}`).catch(() => {});
    });
}

function create(message: Message, content: string) {
  const guild = AP.getGuild(message.client as Client, message.author.id);

  if (!guild) return message.channel.send(`Guild is not set. Use\`${message.client.guilds} guild set <name/id>\``);
  const a = message.attachments.map(m => m);

  let pic = "";
  if (a.length > 0 && a[0].url) pic = a[0].url;

  if (!content) return message.channel.send(`Missing picture`).catch(() => {});

  guild
    .createEmoji(pic, content)
    .then(e => {
      AP.setEmoji(message.client as Client, message.author.id, e);
      message.channel.send(`Emoji ${e.name} has been created.`).catch(() => {});

      AP.infrom(message.client as Client, message);
    })
    .catch(err => {
      message.channel.send(`Cannot create emoji. Reason: ${err.message}`).catch(() => {});
    });
}

function emojiEmbed(message) {
  const guild = AP.getGuild(message.client as Client, message.author.id);

  const embed = new RichEmbed();

  embed.setFooter(guild.name, guild.iconURL);
  embed.setTimestamp(Date.now());

  return embed;
}
