import { Client } from "./Client";
import { Guild, Message, RichEmbed, Channel, TextChannel, User, GuildMember, Role, Emoji } from "discord.js";
const adminProfile = new WeakMap();

export function setupUp(client: Client) {
  adminProfile.set(client, {});
}

export function setNuke(client: Client, userId: string, guild) {
  const a = adminProfile.get(client)[userId];
  a.nuke = guild;
}

export function clearNuke(client: Client, userId: string) {
  const a = adminProfile.get(client)[userId];
  a.nuke = false;
}
export function getNukeStatus(client: Client, userId: string) {
  return adminProfile.get(client)[userId].nuke;
}

export function create(clinet: Client, id: string) {
  const admin = adminProfile.get(clinet);
  if (admin[id]) return;

  admin[id] = {
    guild: null,
    channel: null,
    message: null,
    user: null,
    role: null,
    emoji: null,
    embed: null,
    nuke: false,
    link: {
      channel0: null,
      channel1: null
    }
  };
}
export function infrom(clinet, message: Message) {
  const admin = adminProfile.get(clinet)[message.author.id];

  const embed = new RichEmbed();

  const info = [
    `Guild: ${admin.guild ? admin.guild.name : "Not set"}`,
    `Channel: ${admin.channel ? admin.channel.name : "Not set"}`,
    `Message: ${admin.message ? admin.message.id : "Not set"}`,
    `User: ${admin.user ? admin.user.tag : "Not set"}`,
    `Role: ${admin.role ? admin.role.name : "Not set"}`,
    `Emoji: ${admin.emoji ? admin.emoji.name : "Not set"}`,
    `Embed: ${admin.embed ? "set" : "Not set"}`
  ];

  embed.setTitle(`Settings for ${message.author.tag}`);
  embed.addField("Settings", info.join("\n"));
  embed.setColor("WHITE");

  message.channel.send(embed).catch(x => {
    message.channel.send(`Settings for ${message.author.tag} \`\`\`\n${info.join("\n")}\`\`\``).catch(() => {});
  });
}

export function getGuild(client: Client, userId: string): Guild {
  return adminProfile.get(client)[userId].guild;
}

export function getRole(client: Client, userId: string): Role {
  return adminProfile.get(client)[userId].role;
}

export function setGuild(client: Client, userId: string, guild: Guild) {
  setup(client, userId);
  const admin = adminProfile.get(client);
  admin[userId].guild = guild;
  admin[userId].channel = null;
  admin[userId].role = null;
  admin[userId].emoji = null;
}

export function getChannel(client: Client, userId: string): Channel {
  return adminProfile.get(client)[userId].channel;
}

export function getUser(client: Client, userId: string): User {
  return adminProfile.get(client)[userId].user;
}

export function getEmoji(client: Client, userId: string): Emoji {
  return adminProfile.get(client)[userId].emoji;
}

export function getMember(client: Client, userId: string): GuildMember {
  const user = adminProfile.get(client)[userId].user as User;
  const guild = getGuild(client, userId) as Guild;
  if (!guild) return null;
  return guild.members.find(m => m.id === user.id);
}

export function setMessage(client: Client, userId: string, message: Message) {
  setup(client, userId);
  adminProfile.get(client)[userId].message = message;
}

export function getMessage(client: Client, userId: string): Message {
  return adminProfile.get(client)[userId].message;
}

export function setUser(client: Client, userId: string, user: User) {
  setup(client, userId);
  adminProfile.get(client)[userId].user = user;
}

export function setEmoji(client: Client, userId: string, emoji: Emoji) {
  setup(client, userId);
  adminProfile.get(client)[userId].emoji = emoji;
}

export function setRole(client: Client, userId: string, role: Role) {
  setup(client, userId);
  adminProfile.get(client)[userId].role = role;
}

export function setEmbed(client: Client, userId: string, embed: RichEmbed) {
  setup(client, userId);
  adminProfile.get(client)[userId].embed = embed;
}

export function getEmbed(client: Client, userId: string): RichEmbed {
  return adminProfile.get(client)[userId].embed;
}

export function setChannel(client: Client, userId: string, channel: Channel) {
  const admin = adminProfile.get(client);
  admin[userId].channel = channel;
}

export function setLink(client: Client, userId: string, channel0: Channel, channel1: Channel) {
  const admin = adminProfile.get(client);
  admin[userId].link.channel0 = channel0;
  admin[userId].link.channel1 = channel1;
}

interface ChannelArray {
  channel0: TextChannel;
  channel1: TextChannel;
}

export function getLink(client: Client) {
  const admin = adminProfile.get(client);
  const keys = Object.keys(admin);

  const channels: ChannelArray[] = [];
  for (const key of keys) {
    if (!admin[key].link.channel0) continue;
    channels.push({
      channel0: admin[key].link.channel0,
      channel1: admin[key].link.channel1
    });
  }
  return channels;
}

export function autoClear(message: Message, time: number) {
  setup(message.client as Client, message.author.id);
  const admin = adminProfile.get(message.client)[message.author.id];
  clearInterval(admin.time);
  if (admin.time) admin.time = null;
  admin.time = setTimeout(() => {
    clearSettings(message);
  }, time);
}

export function clearSettings(msg: Message) {
  let sendMsg = false;
  const { guild, channel, message, user, role, emoji, embed, link } = adminProfile.get(msg.client)[msg.author.id];
  console.log({ guild, channel, message, user, role, emoji, embed, link });
  if (guild || channel || message || user || role || emoji || embed || link.channel0) sendMsg = true;

  delete adminProfile.get(msg.client)[msg.author.id];

  if (sendMsg) msg.channel.send(`♻️ User setting has been cleared`).catch(() => {});
}

export function setup(client: Client, userId: string) {
  const admin = adminProfile.get(client);
  if (!admin[userId])
    admin[userId] = {
      time: null,
      guild: null,
      channel: null,
      message: null,
      user: null,
      role: null,
      emoji: null,
      embed: null,
      link: {
        channel0: null,
        channel1: null
      }
    };
}
