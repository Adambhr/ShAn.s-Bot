const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "1.18",
    author: "ShAn",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View command usage",
    },
    longDescription: {
      en: "View command usage and list all commands or commands by category",
    },
    category: "info",
    guide: {
      en: "{pn}help [cmdName]\n{pn}help -c <categoryName>",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID).catch(() => ({}));
    const prefix = getPrefix(threadID);

    // No args: show list of commands grouped by category
    if (!args || args.length === 0) {
      const categories = {};
      let msg = "";

      msg += "╔══════════════╗\n";
      msg += "🛡 COMMAND LIST 🛡\n";
      msg += "╚══════════════╝\n";

      for (const [name, value] of commands) {
        // Respect role requirement
        if (value?.config?.role > 1 && role < value.config.role) continue;

        const category = (value?.config?.category || "Uncategorized");
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).sort().forEach((category) => {
        if (category !== "info") {
          msg += `\n╭────────────⭓\n│『 ${category.toUpperCase()} 』\n`;
          const names = categories[category].commands.sort();
          names.forEach((item) => {
            msg += `│ 🖇 ${item}\n`;
          });
          msg += "╰────────⭓\n";
        }
      });

      const totalCommands = (typeof commands.size === "number") ? commands.size : Array.from(commands).length;
      msg += `\nCurrently the bot has ${totalCommands} commands available.\n`;
      msg += `Type ${prefix}help <commandName> to view details about a specific command.\n`;
      msg += `Type ${prefix}help -c <categoryName> to view commands by category.\n`;
      msg += `\nBot Name: ♡KABOS BOT♡\n`;

      await message.reply({ body: msg }).catch(() => {});
      return;
    }

    // Category listing: help -c <category>
    if (args[0] === "-c") {
      if (!args[1]) {
        await message.reply("Please specify a category name.").catch(() => {});
        return;
      }

      const categoryName = args[1].toLowerCase();
      const filteredCommands = Array.from(commands.values()).filter(
        (cmd) => (cmd?.config?.category || "").toLowerCase() === categoryName
      );

      if (filteredCommands.length === 0) {
        await message.reply(`No commands found in the category "${categoryName}".`).catch(() => {});
        return;
      }

      let msg = `╔══════════════╗\n🌐 ${categoryName.toUpperCase()} COMMANDS 🌐\n╚══════════════╝\n`;
      filteredCommands.forEach((cmd) => {
        msg += `\n🪻 ${cmd.config.name}\n`;
      });

      await message.reply({ body: msg }).catch(() => {});
      return;
    }

    // Specific command help: help <commandName>
    const commandName = args[0].toLowerCase();
    const resolvedName = aliases.get(commandName) || commandName;
    const command = commands.get(commandName) || commands.get(resolvedName);

    if (!command) {
      await message.reply(`Command "${commandName}" not found. Type ${prefix}help to see all available commands.`).catch(() => {});
      return;
    }

    const configCommand = command.config || {};
    const roleText = roleTextToString(configCommand.role);
    const author = configCommand.author || "Unknown";

    const longDescription = configCommand.longDescription
      ? (configCommand.longDescription.en || "No description")
      : "No description";

    const guideBody = configCommand.guide?.en || "No guide available.";
    const usage = guideBody.replace(/{pn}|{p}/g, prefix).replace(/{n}/g, configCommand.name || "");

    const response = [
      "╭── NAME ────⭓",
      `│ ${configCommand.name || ""}`,
      "├── INFO",
      `│ Description: ${longDescription}`,
      `│ Other names: ${configCommand.aliases ? configCommand.aliases.join(", ") : "Do not have"}`,
      `│ Version: ${configCommand.version || "1.0"}`,
      `│ Role: ${roleText}`,
      `│ Time per command: ${configCommand.countDown || 1}s`,
      `│ Author: ${author}`,
      "├── Usage",
      `│ ${usage}`,
      "├── Notes",
      "│ The content inside <...> can be changed",
      "│ The content inside [a|b|c] means a or b or c",
      "╰━━━━━━━❖"
    ].join("\n");

    await message.reply({ body: response }).catch(() => {});
  },
};

function roleTextToString(role) {
  switch (role) {
    case 0:
      return "0 (All users)";
    case 1:
      return "1 (Group administrators)";
    case 2:
      return "2 (Admin bot)";
    default:
      return "Unknown role";
  }
    }      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`Command "${commandName}" not found.`);
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Unknown";

        const longDescription = configCommand.longDescription
          ? configCommand.longDescription.en || "No description"
          : "No description";

        const guideBody = configCommand.guide?.en || "No guide available.";
        const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

        const response = `╭── NAME ────⭓\n` +
          `│ ${configCommand.name}\n` +
          `├── INFO\n` +
          `│ Description: ${longDescription}\n` +
          `│ Other names: ${configCommand.aliases ? configCommand.aliases.join(", ") : "Do not have"}\n` +
          `│ Version: ${configCommand.version || "1.0"}\n` +
          `│ Role: ${roleText}\n` +
          `│ Time per command: ${configCommand.countDown || 1}s\n` +
          `│ Author: ${author}\n` +
          `├── Usage\n` +
          `│ ${usage}\n` +
          `├── Notes\n` +
          `│ The content inside <ShAn> can be changed\n` +
          `│ The content inside [a|b|c] is a or b or c\n` +
          `╰━━━━━━━❖`;

        await message.reply(response);
      }
    }
  },
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0:
      return "0 (All users)";
    case 1:
      return "1 (Group administrators)";
    case 2:
      return "2 (Admin bot)";
    default:
      return "Unknown role";
  }
    }
