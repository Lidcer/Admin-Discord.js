import * as Discord from "discord.js";
import * as adminProfiler from "./adminProfiler";
import { addToCache, getIds } from "./cache";
import { channel } from "./discordThings/channel";
import { botClient } from "./discordThings/client";
import { emoji } from "./discordThings/emoji";
import { guild } from "./discordThings/guild";
import { role } from "./discordThings/role";
import { user } from "./discordThings/user";
import { embed } from "./discordThings/embed";
import { userMessage } from "./discordThings/message";
import { formatDate, decompileEmbed } from "./Others";

const DeffaultClient = Discord.Client;

const adminIDs = new WeakMap();
const prefix = new WeakMap();
const warnMessage = new WeakMap();
const clearTimeout = new WeakMap();

export class Client extends DeffaultClient {
  constructor(admins: string[] | string, options: Discord.ClientOptions) {
    super(options);

    prefix.set(this, "sudo");
    adminIDs.set(this, admins);
    warnMessage.set(this, false);
    clearTimeout.set(this, 1000 * 60);
    adminProfiler.setupUp(this);

    this.on("message", msg => {
      onMesssage(this, msg);
    });

    this.on("messageDelete", msg => {
      onMesssageDelete(msg);
    });
    this.on("messageUpdate", (oldMsg, newMsg) => {
      onMesssageEdit(oldMsg, newMsg);
    });
    this.on("messageReactionAdd", msgReact => {
      onMessageReactAdd(msgReact);
    });
    this.on("messageReactionRemove", msgReact => {
      onMessageReactRemove(msgReact);
    });
    this.on("messageReactionRemoveAll", msgReact => {
      onMessageReactRemoveAll(msgReact);
    });
    this.on("typingStart", c => {
      onChannelStartTyping(c as Discord.TextChannel);
    });
    this.on("typingStop", c => {
      onChannelStopTyping(c as Discord.TextChannel);
    });

    this.on("ready", () => {
      for (const admin of admins) {
        const user = this.users.find(i => i.id === admin);
        if (user) this.emit("debug", `[admin] [info] ${user.tag}`);
        else this.emit("debug", `[admin] [warn] Cannot find user ${admin}`);
      }
    });
  }

  set prefix(p: string) {
    if (typeof p !== "string") throw new Error("Prefix can only be string");
    if (p.length > 5) console.warn("String is longer than 5 charaters. This might cost unwated problems");
    if (p.length === 0) console.warn("Missing prefix this might const unwanted problem...");
    prefix.set(this, p);
  }

  get prefix() {
    return prefix.get(this);
  }

  set warnMessage(bool: boolean) {
    if (typeof bool !== "boolean") throw new Error("expected boolen value");
    warnMessage.set(this, bool);
  }
  get warnMessage() {
    return warnMessage.get(this);
  }

  set clearSettingsTimeOut(time: number) {
    if (typeof time !== "number") throw new Error("expected number");
    clearTimeout.set(this, time);
  }
  get clearSettingsTimeOut() {
    return clearTimeout.get(this);
  }
}

function onMesssage(client: Client, message: Discord.Message) {
  const p = prefix.get(client);
  if (!message.content.toLowerCase().startsWith(p)) return messageLinker(message);
  if (!adminIDs.get(client).includes(message.author.id)) {
    if (warnMessage.get(client)) message.channel.send("You are not admin of this bot!");
    return;
  }
  adminProfiler.create(client, message.author.id);
  setTimeout(() => {
    adminProfiler.autoClear(message, clearTimeout.get(message.client));
  });

  const content = message.content.slice(p.length).trim();
  const checker = content.toLowerCase();
  if (checker.startsWith("guild")) return guild(message, content.slice(5).trim());
  if (checker.startsWith("server")) return guild(message, content.slice(6).trim());
  if (checker.startsWith("channel")) return channel(message, content.slice(7).trim());
  if (checker.startsWith("client")) return botClient(message, content.slice(6).trim());
  if (checker.startsWith("user")) return user(message, content.slice(4).trim());
  if (checker.startsWith("role")) return role(message, content.slice(4).trim());
  if (checker.startsWith("emoji")) return emoji(message, content.slice(5).trim());
  if (checker.startsWith("embed")) return embed(message, content.slice(5).trim());
  if (checker.startsWith("message")) return userMessage(message, content.slice(7).trim());
  if (checker.startsWith("help")) return help(message);
  message.channel
    // @ts-ignore
    .send(`Unkown command please inform urself with command \`${message.channel.client.prefix} help\``)
    .catch(() => {});
}

function help(message: Discord.Message) {
  const embed = new Discord.RichEmbed();

  // @ts-ignore
  const prefix = message.client.prefix;

  embed.setAuthor(`${prefix} admin commands`, message.client.user.avatarURL);
  embed.setColor("WHITE");
  embedAdder(embed, prefix, "guild");
  embedAdder(embed, prefix, "channel");
  embedAdder(embed, prefix, "client");
  embedAdder(embed, prefix, "user");
  embedAdder(embed, prefix, "role");
  embedAdder(embed, prefix, "emoji");
  embedAdder(embed, prefix, "embed");

  message.channel.send(embed).catch(() => {
    message.channel.send(decompileEmbed(embed)).catch(() => {});
  });
}

function embedAdder(embed: Discord.RichEmbed, prefix, name: string) {
  embed.addField(name, `${name}\n\`${prefix} ${name} help\``);
}

function messageLinker(message: Discord.Message) {
  const channels = adminProfiler.getLink(message.client as Client);

  for (const channel of channels) {
    if (message.channel.id === channel.channel1.id) {
      channel.channel0
        .send(`\`${message.author.tag} ${message.author.bot ? "BOT" : ""} ${formatDate(message.createdAt)}\``)
        .then(e => {
          const m = e as Discord.Message;
          addToCache(message.id, m.id);
        })
        .catch(err => message.client.emit("error", err));
      if (message.content)
        channel.channel0
          .send(`${message.content}`)
          .then(e => {
            const m = e as Discord.Message;
            addToCache(message.id, m.id);
          })
          .catch(err => message.client.emit("error", err));
      if (message.embeds.length > 0) {
        for (const messageEmbed of message.embeds) {
          const embed = embedDecoder(messageEmbed);
          channel.channel0
            .send(embed)
            .then(e => {
              const m = e as Discord.Message;
              addToCache(message.id, m.id);
            })
            .catch(err => message.client.emit("error", err));
        }
      }
      if (message.attachments.size > 0) {
        const att = message.attachments.map(p => p.url);
        channel.channel0
          .send(`${att.join("\n")}`)
          .then(e => {
            const m = e as Discord.Message;
            addToCache(message.id, m.id);
          })
          .catch(err => message.client.emit("error", err));
      }
    } else if (message.channel.id === channel.channel0.id) {
      if (message.author === message.client.user) return;

      if (message.content)
        channel.channel1
          .send(`${message.content}`)
          .then(e => {
            const m = e as Discord.Message;
            addToCache(message.id, m.id);
          })
          .catch(err => message.channel.send(`❌ ${err.message}`));
      if (message.embeds.length > 0) {
        for (const messageEmbed of message.embeds) {
          const embed = embedDecoder(messageEmbed);
          channel.channel1
            .send(embed)
            .then(e => {
              const m = e as Discord.Message;
              addToCache(message.id, m.id);
            })
            .catch(err => message.channel.send(`❌ ${err.message}`));
        }
      }
      if (message.attachments.size > 0) {
        const att = message.attachments.map(p => p.url);
        channel.channel1
          .send(`${att.join("\n")}`)
          .then(e => {
            const m = e as Discord.Message;
            addToCache(message.id, m.id);
          })
          .catch(err => message.channel.send(`❌ ${err.message}`));
      }
    }
  }
}
function onMesssageEdit(old: Discord.Message, message: Discord.Message) {
  const channels = adminProfiler.getLink(message.client as Client);

  for (const channel of channels) {
    if (message.channel.id === channel.channel1.id) {
      const ids = getIds(message.id);
      if (ids)
        for (const id of ids) {
          const msg = channel.channel0.messages.find(m => m.id === id);

          if (old.content === msg.content) {
            msg.edit(message.content).catch(err => message.client.emit("error", err));
          }
        }
    } else if (message.channel.id === channel.channel0.id) {
      const ids = getIds(message.id);
      if (ids)
        for (const id of ids) {
          const msg = channel.channel1.messages.find(m => m.id === id);

          if (old.content === msg.content) {
            msg.edit(message.content).catch(err => message.client.emit("error", err));
          }
        }
    }
  }
}

function onMesssageDelete(message: Discord.Message) {
  const channels = adminProfiler.getLink(message.client as Client);

  for (const channel of channels) {
    if (message.channel.id === channel.channel1.id) {
      const ids = getIds(message.id);
      if (ids)
        for (const id of ids) {
          const msg = channel.channel0.messages.find(m => m.id === id);

          msg.delete().catch(err => message.client.emit("error", err));
        }
    } else if (message.channel.id === channel.channel0.id) {
      const ids = getIds(message.id);
      if (ids)
        for (const id of ids) {
          const msg = channel.channel1.messages.find(m => m.id === id);
          msg.delete().catch(err => message.client.emit("error", err));
        }
    }
  }
}

function onMessageReactAdd(messageReaction: Discord.MessageReaction) {
  const message = messageReaction.message;
  const channels = adminProfiler.getLink(message.client as Client);

  for (const channel of channels) {
    if (message.channel.id === channel.channel1.id) {
      const ids = getIds(message.id);
      if (ids)
        for (const id of ids) {
          const msg = channel.channel0.messages.find(m => m.id === id);
          if (message.content === msg.content)
            for (const react of message.reactions) {
              msg.react(react[0]).catch(err => message.client.emit("error", err));
            }
        }
    } else if (message.channel.id === channel.channel0.id) {
      const ids = getIds(message.id);
      if (ids)
        for (const id of ids) {
          const msg = channel.channel1.messages.find(m => m.id === id);
          if (message.content === msg.content)
            for (const react of message.reactions) {
              msg.react(react[0]).catch(err => message.client.emit("error", err));
            }
        }
    }
  }
}

function onMessageReactRemoveAll(message: Discord.Message) {
  const channels = adminProfiler.getLink(message.client as Client);

  for (const channel of channels) {
    if (message.channel.id === channel.channel1.id) {
      const ids = getIds(message.id);
      if (ids)
        for (const id of ids) {
          const msg = channel.channel0.messages.find(m => m.id === id);
          if (message.content === msg.content) msg.clearReactions().catch(err => message.client.emit("error", err));
        }
    } else if (message.channel.id === channel.channel0.id) {
      const ids = getIds(message.id);
      if (ids)
        for (const id of ids) {
          const msg = channel.channel1.messages.find(m => m.id === id);
          if (message.content === msg.content) msg.clearReactions().catch(err => message.client.emit("error", err));
        }
    }
  }
}

function onChannelStartTyping(channel: Discord.TextChannel) {
  const channels = adminProfiler.getLink(channel.client as Client);

  for (const c of channels) {
    if (channel.id === c.channel1.id) {
      // c.channel0.startTyping();
    } else if (channel.id === c.channel0.id) {
      c.channel1.startTyping();
    }
  }
}

function onChannelStopTyping(channel: Discord.TextChannel) {
  const channels = adminProfiler.getLink(channel.client as Client);

  for (const c of channels) {
    if (channel.id === c.channel1.id) {
      if (channel.typingCount === 0) c.channel0.stopTyping();
    } else if (channel.id === c.channel0.id) {
      if (channel.typingCount === 0) c.channel1.stopTyping();
    }
  }
}

function onMessageReactRemove(messageReaction: Discord.MessageReaction) {
  const message = messageReaction.message;

  const channels = adminProfiler.getLink(message.client as Client);
  for (const channel of channels) {
    if (message.channel.id === channel.channel1.id) {
      const ids = getIds(message.id);
      if (ids)
        for (const id of ids) {
          const msg = channel.channel0.messages.find(m => m.id === id);
          if (message.content === msg.content) {
            if (messageReaction.count === 0) {
              msg.clearReactions().catch(() => messageReaction.message.client.emit("error"));
            }
          }
        }
    } else if (message.channel.id === channel.channel0.id) {
      const ids = getIds(message.id);
      if (ids)
        for (const id of ids) {
          const msg = channel.channel1.messages.find(m => m.id === id);
          if (message.content === msg.content) msg.clearReactions().catch(err => message.client.emit("error", err));
        }
    }
  }
}

function embedDecoder(messageEmbed: Discord.MessageEmbed) {
  const embed = new Discord.RichEmbed();
  if (messageEmbed.author)
    embed.setAuthor(messageEmbed.author.name, messageEmbed.author.iconURL, messageEmbed.author.url);
  if (messageEmbed.title) embed.setTitle(messageEmbed.title);
  if (messageEmbed.description) embed.setDescription(messageEmbed.description);
  if (messageEmbed.image) embed.setImage(messageEmbed.image.url);
  if (messageEmbed.thumbnail) embed.setThumbnail(messageEmbed.thumbnail.url);
  if (messageEmbed.url) embed.setURL(messageEmbed.url);
  if (messageEmbed.footer) embed.setFooter(messageEmbed.footer.text, messageEmbed.footer.iconURL);
  if (messageEmbed.timestamp) embed.setTimestamp(messageEmbed.timestamp);
  if (messageEmbed.color) embed.setColor(messageEmbed.color);

  for (const field of messageEmbed.fields) embed.addField(field.name, field.value, field.inline);
  return embed;
}
