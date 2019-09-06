import { DMChannel, GroupDMChannel, Message, RichEmbed, TextChannel, MessageEmbed } from "discord.js";

import * as fs from "fs";

export function formatDate(date: Date) {
  const days = date.getDate().toString();
  const month = (date.getMonth() + 1).toString();
  const years = date.getFullYear().toString();

  const hours = date.getHours().toString();
  const minutes = date.getMinutes().toString();
  const seconds = date.getSeconds().toString();

  return `${days.length === 1 ? `0${days}` : days}.${month.length === 1 ? `0${month}` : month}.${
    years.length === 1 ? `0${years}` : years
  } ${hours.length === 1 ? `0${hours}` : hours}:${minutes.length === 1 ? `0${minutes}` : minutes}:${
    seconds.length === 1 ? `0${seconds}` : seconds
  }`;
}

export function getAge(date: Date) {
  const today = new Date();
  const oneDay = 1000 * 60 * 60 * 24;
  const differenceMs = Math.abs(today.getTime() - date.getTime());
  let days = Math.round(differenceMs / oneDay);

  const yearDays = 365.2425;

  let dayText: string;
  let years: number;
  if (days > 365) {
    years = Math.floor(days / yearDays);
    days = Math.floor(days - yearDays * years);

    let yearText;

    if (years === 1) yearText = "Year";
    else yearText = "Years";

    if (days === 1) dayText = "Day";
    else dayText = "Days";

    return `${years} ${yearText}, ${days} ${dayText}`;
  }

  if (days === 1) dayText = "Day";
  else dayText = "Days";
  return `${days} ${dayText}`;
}

export function decompileEmbed(embed: RichEmbed | MessageEmbed) {
  let msg = "";

  if (embed.title) msg += `${embed.title}\n`;

  if (embed.description) msg += `${embed.description}\n`;

  if (embed.fields && embed.fields.length !== 0) {
    for (const field of embed.fields) {
      msg += `${field.name}: ${field.value}\n`;
    }
  }
  return msg;
}

export function errorEmbed(channel: TextChannel | DMChannel | GroupDMChannel, msg: string) {
  const embed = new RichEmbed();

  embed.setTitle("Error");
  embed.setDescription(msg);
  embed.setColor("RED");

  channel
    .send(embed)
    .catch(() => channel.send(decompileEmbed(embed)))
    .catch(() => {});
}

export function infoEmbed(channel: TextChannel | DMChannel | GroupDMChannel, msg: string) {
  const embed = new RichEmbed();

  embed.setTitle("info");
  embed.setDescription(msg);
  embed.setColor("ORANGE");

  channel
    .send(embed)
    .catch(() => channel.send(decompileEmbed(embed)))
    .catch(() => {});
}

export function createFields(embed: RichEmbed, text: string): boolean {
  if (text.length > 5500) return false;

  const send: string[] = [];
  let i = 0;

  while (text !== "") {
    send[i] = text.slice(0, 255);
    if (send[i].length === 255) send[i] = send[i].slice(0, send[i].lastIndexOf("\n"));
    text = text.slice(send[i].length + 1).trim();

    if (text.length === 0) {
      break;
    }
    i++;
  }

  if (send.length > 25) return false;

  for (const s of send) {
    let l: any = s.match(/\n/g);
    if (!l) l = 0;

    embed.addField(`.`, s);
  }

  return true;
}

interface FileOutPutData {
  output: string;
  text: string;
  message: Message;
}

export function writeFile(e: FileOutPutData) {
  setTimeout(() => {
    fs.writeFile(`.${e.output}`, e.text, err => {
      if (err) {
        console.error(err);
        return e.message.channel.send("Cannot write file!");
      }
      e.message.channel
        .send({ files: [`.${e.output}`] })
        .then(() => {
          fs.unlink(`.${e.output}`, err => {
            if (err) console.log(err);
          });
        })
        .catch(console.error);
    });
  }, 0);
}
