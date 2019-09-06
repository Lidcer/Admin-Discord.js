import { Client } from "../Client";
import { Message, RichEmbed } from "discord.js";
import * as AP from "../adminProfiler";
import { decompileEmbed } from "../Others";

export function embed(message: Message, msg: string) {
  const embed = AP.getEmbed(message.client as Client, message.author.id);

  const checker = msg.toLowerCase();
  if (checker.startsWith("set")) return set(message, msg.slice(3).trim());
  if (checker.startsWith("help")) return help(message);
  if (checker.startsWith("clear")) return clear(message);

  if (checker.startsWith("title")) return title(message, msg.slice(6, msg.length), embed);
  if (checker.startsWith("description")) return description(message, msg.slice(12, msg.length), embed);
  if (checker.startsWith("author")) return author(message, msg.slice(7, msg.length), embed);
  if (checker.startsWith("author icon")) return authorIcon(message, msg.slice(12, msg.length), embed);
  if (checker.startsWith("author url")) return authorUrl(message, msg.slice(11, msg.length), embed);
  if (checker.startsWith("color")) return color(message, msg.slice(6, msg.length), embed);
  if (checker.startsWith("thumbnail")) return thumbnail(message, msg.slice(10, msg.length), embed);
  if (checker.startsWith("image")) return image(message, msg.slice(6, msg.length), embed);
  if (checker.startsWith("timestamp")) return timestamp(message, msg.slice(10, msg.length), embed);
  if (checker.startsWith("footer")) return footer(message, msg.slice(7, msg.length), embed);
  if (checker.startsWith("footer url")) return footerIcon(message, msg.slice(11, msg.length), embed);
  if (checker.startsWith("add field")) return addField(message, msg.slice(10, msg.length), embed);

  if (!embed)
    return message.channel.send(
      // @ts-ignore
      `❌ embed is not set. Please set embed before continue with following command \`${message.client.prefix} embed set {json}\` - to set embed`
    );
  else if (checker.startsWith("peview")) return preview(message, embed);
  else if (checker.startsWith("test")) return preview(message, embed);
}

function help(message: Message) {
  const embed = new RichEmbed();

  // @ts-ignore
  const prefix = message.client.prefix;

  embed.setAuthor(`${prefix} role commands`, message.client.user.avatarURL);
  embed.setColor("WHITE");
  embed.addField(`set`, `To set embed\n\`${prefix} emoji {json}\``);
  embed.addField(`clear`, `To clear embed\n\`${prefix} clear\``);
  embed.addField(`author`, `set author\n\`${prefix} author <author>\``);
  embed.addField(`author icon`, `set author icon\n\`${prefix} author icon <author>\``);
  embed.addField(`author url`, `set author url\n\`${prefix} author url <url>\``);
  embed.addField(`thumbnail`, `set thumbnail\n\`${prefix} thumbnail <url>\``);
  embed.addField(`image`, `set image\n\`${prefix} image <url>\``);
  embed.addField(`color`, `set color\n\`${prefix} title <color or url>\``);
  embed.addField(`timestamp`, `set timestamp\n\`${prefix} timestamp <numbers>\``);
  embed.addField(`footer`, `set footer\n\`${prefix} footer <name>\``);
  embed.addField(`footer url`, `set footer url\n\`${prefix} footer url <url>\``);
  embed.addField(
    `add field`,
    `add field\n\`${prefix} add field --name <name> --value <value> --infline <true/false>\``
  );

  message.channel.send(embed).catch(() => {
    message.channel.send(decompileEmbed(embed)).catch(() => {});
  });
}

function clear(message: Message) {
  AP.setEmbed(message.client as Client, message.author.id, null);
  message.channel.send(`♻️ Embed has been cleared`).catch(() => {});
}

function set(message: Message, msg: string) {
  let richEmbed;
  try {
    richEmbed = JSON.parse(msg) as RichEmbed;
    AP.setEmbed(message.client as Client, message.author.id, richEmbed);
    AP.infrom(message.client, message);
  } catch (err) {
    message.channel.send(`Cannot set embed. Reason: ${err.message}`).catch(() => {});
  }
}

function preview(message: Message, richEmbed: RichEmbed) {
  message.channel
    .send({ embed: richEmbed })
    .catch(err => message.channel.send(`An error occured: ${err.message}`).catch(() => {}));
}

function title(message: Message, content: string, richEmbed?: RichEmbed) {
  if (!richEmbed) richEmbed = new RichEmbed();

  try {
    if (richEmbed.setTitle) richEmbed.setTitle(content);
    else richEmbed.title = content;
    AP.setEmbed(message.client as Client, message.author.id, richEmbed);
    message.channel.send(`Embed title has been set to \`${richEmbed.title}\``).catch(() => {});
  } catch (error) {
    message.channel.send(`An error occur ${error.message}`).catch(() => {});
  }
}

function description(message: Message, content: string, richEmbed?: RichEmbed) {
  if (!richEmbed) richEmbed = new RichEmbed();

  try {
    if (richEmbed.setDescription) richEmbed.setDescription(content);
    else richEmbed.description = content;
    AP.setEmbed(message.client as Client, message.author.id, richEmbed);
    message.channel.send(`Embed description has been set to \`${richEmbed.description}\``).catch(() => {});
  } catch (error) {
    message.channel.send(`An error occur ${error.message}`).catch(() => {});
  }
}

function author(message: Message, content: string, richEmbed?: RichEmbed) {
  if (!richEmbed) richEmbed = new RichEmbed();

  try {
    if (richEmbed.setAuthor) richEmbed.setAuthor(content);
    else richEmbed.author.name = content;
    AP.setEmbed(message.client as Client, message.author.id, richEmbed);
    message.channel.send(`Embed author has been set to \`${richEmbed.author.name}\``).catch(() => {});
  } catch (error) {
    message.channel.send(`An error occur ${error.message}`).catch(() => {});
  }
}

function authorIcon(message: Message, content: string, richEmbed?: RichEmbed) {
  if (!richEmbed) richEmbed = new RichEmbed();

  try {
    if (richEmbed.setAuthor) richEmbed.setAuthor(richEmbed.author.name, content);
    else richEmbed.author.icon_url = content;
    AP.setEmbed(message.client as Client, message.author.id, richEmbed);
    message.channel.send(`Embed author url has been set to \`${richEmbed.author.icon_url}\``).catch(() => {});
  } catch (error) {
    message.channel.send(`An error occur ${error.message}`).catch(() => {});
  }
}

function authorUrl(message: Message, content: string, richEmbed?: RichEmbed) {
  if (!richEmbed) richEmbed = new RichEmbed();

  try {
    if (richEmbed.setAuthor) richEmbed.setAuthor(richEmbed.author.name, richEmbed.author.url, content);
    else richEmbed.author.url = content;
    AP.setEmbed(message.client as Client, message.author.id, richEmbed);
    message.channel.send(`Embed author url has been set to \`${richEmbed.author.url}\``).catch(() => {});
  } catch (error) {
    message.channel.send(`An error occur ${error.message}`).catch(() => {});
  }
}

function color(message: Message, content: string, richEmbed?: RichEmbed) {
  if (!richEmbed) richEmbed = new RichEmbed();

  try {
    content = JSON.parse(content);
  } catch (ignore) {}

  try {
    if (richEmbed.setColor) richEmbed.setColor(content);
    // @ts-ignore
    else richEmbed.color = content;
    AP.setEmbed(message.client as Client, message.author.id, richEmbed);
    message.channel.send(`Embed color has been set to \`${richEmbed.color}\``).catch(() => {});
  } catch (error) {
    message.channel.send(`An error occur ${error.message}`).catch(() => {});
  }
}

function thumbnail(message: Message, content: string, richEmbed?: RichEmbed) {
  if (!richEmbed) richEmbed = new RichEmbed();

  try {
    if (richEmbed.setAuthor) richEmbed.setThumbnail(content);
    else richEmbed.thumbnail.url = content;
    AP.setEmbed(message.client as Client, message.author.id, richEmbed);
    message.channel.send(`Embed author url has been set to \`${richEmbed.thumbnail.url}\``).catch(() => {});
  } catch (error) {
    message.channel.send(`An error occur ${error.message}`).catch(() => {});
  }
}

function image(message: Message, content: string, richEmbed?: RichEmbed) {
  if (!richEmbed) richEmbed = new RichEmbed();

  try {
    if (richEmbed.setImage) richEmbed.setImage(content);
    else richEmbed.image.url = content;
    AP.setEmbed(message.client as Client, message.author.id, richEmbed);
    message.channel.send(`Embed author url has been set to \`${richEmbed.image.url}\``).catch(() => {});
  } catch (error) {
    message.channel.send(`An error occur ${error.message}`).catch(() => {});
  }
}

function timestamp(message: Message, content: string, richEmbed?: RichEmbed) {
  if (!richEmbed) richEmbed = new RichEmbed();

  const time = isNaN(parseInt(content)) ? 0 : parseInt(content);

  try {
    if (richEmbed.setTimestamp) richEmbed.setTimestamp(time);
    else richEmbed.timestamp = new Date(time);
    AP.setEmbed(message.client as Client, message.author.id, richEmbed);
    message.channel.send(`Embed timestamp has been set to \`${richEmbed.timestamp}\``).catch(() => {});
  } catch (error) {
    message.channel.send(`An error occur ${error.message}`).catch(() => {});
  }
}

function footer(message: Message, content: string, richEmbed?: RichEmbed) {
  if (!richEmbed) richEmbed = new RichEmbed();

  try {
    if (richEmbed.setFooter) richEmbed.setFooter(content);
    else richEmbed.footer.text = content;
    AP.setEmbed(message.client as Client, message.author.id, richEmbed);
    message.channel.send(`Embed footer has been set to \`${richEmbed.footer.text}\``).catch(() => {});
  } catch (error) {
    message.channel.send(`An error occur ${error.message}`).catch(() => {});
  }
}

function footerIcon(message: Message, content: string, richEmbed?: RichEmbed) {
  if (!richEmbed) richEmbed = new RichEmbed();

  try {
    if (richEmbed.setFooter) richEmbed.setFooter(richEmbed.footer.text, content);
    else richEmbed.footer.icon_url = content;
    AP.setEmbed(message.client as Client, message.author.id, richEmbed);
    message.channel.send(`Embed footer has been set to \`${richEmbed.footer.icon_url}\``).catch(() => {});
  } catch (error) {
    message.channel.send(`An error occur ${error.message}`).catch(() => {});
  }
}

function addField(message: Message, content: string, richEmbed?: RichEmbed) {
  if (!richEmbed) richEmbed = new RichEmbed();
  if (!content.toLowerCase().match(/--name|-n/) || !content.toLowerCase().match(/--value|-v/)) {
    return message.channel.send(`message must includes \`--name <name>\` \`--value <value>\``);
  }

  const texts = content.split(/-|--/);
  const name = search(texts, "name");
  const value = search(texts, "value");
  let inline: string | boolean = search(texts, "inline");

  if (inline) {
    if (inline === "true") inline = true;
    else if (inline === "yes") inline = true;
    else if (inline === "false") inline = false;
    else if (inline === "no") inline = false;
  } else {
    inline = false;
  }

  try {
    if (richEmbed.addField) richEmbed.addField(name, value, inline as boolean);
    else
      richEmbed.fields[richEmbed.fields.length - 1] = {
        name,
        value,
        inline: inline as boolean
      };
    AP.setEmbed(message.client as Client, message.author.id, richEmbed);
    message.channel
      .send(
        `Embed field has been added \n\`${richEmbed.fields[richEmbed.fields.length - 1].name}\` \n\`${richEmbed.fields[richEmbed.fields.length - 1].value}\``
      )
      .catch(() => {});
  } catch (error) {
    message.channel.send(`An error occur ${error.message}`).catch(() => {});
  }
}

function search(texts: string[], type) {
  for (const text of texts) {
    if (text.toLowerCase().startsWith(type.slice(0, type.length - type.length + 1))) {
      return text.slice(2).trim();
    } else if (text.toLowerCase().startsWith(type)) {
      return text.slice(5).trim();
    }
  }
  return null;
}
