const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "Kabos",
    version: "1.18",
    author: "ShAn",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "عرض طريقة استخدام الأوامر",
    },
    longDescription: {
      en: "عرض طريقة استخدام الأوامر وقائمة جميع الأوامر أو الأوامر حسب الفئة",
    },
    category: "info",
    guide: {
      en: "{pn}Kabos [اسم_الأمر]\n{pn}help -c <اسم_الفئة>",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID).catch(() => ({}));
    const prefix = getPrefix(threadID);

    // بدون وسائط: عرض قائمة الأوامر مجمّعة حسب الفئة
    if (!args || args.length === 0) {
      const categories = {};
      let msg = "";

      msg += "╔══════════════╗\n";
      msg += "🛡 قائمة الأوامر 🛡\n";
      msg += "╚══════════════╝\n";

      for (const [name, value] of commands) {
        if (value?.config?.role > 1 && role < value.config.role) continue;

        const category = (value?.config?.category || "غير مصنفة");
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
      msg += `\n🔹 حالياً يحتوي البوت على ${totalCommands} أمرًا متاحًا.\n`;
      msg += `✦ اكتب: ${prefix}help <اسم_الأمر> لعرض تفاصيل أمر محدد.\n`;
      msg += `✦ اكتب: ${prefix}help -c <اسم_الفئة> لعرض الأوامر حسب الفئة.\n`;
      msg += `\n🤖 اسم البوت: ♡KABOS BOT♡\n`;

      await message.reply({ body: msg }).catch(() => {});
      return;
    }

    // عرض حسب الفئة: help -c <category>
    if (args[0] === "-c") {
      if (!args[1]) {
        await message.reply("⚠️ يرجى تحديد اسم الفئة.").catch(() => {});
        return;
      }

      const categoryName = args[1].toLowerCase();
      const filteredCommands = Array.from(commands.values()).filter(
        (cmd) => (cmd?.config?.category || "").toLowerCase() === categoryName
      );

      if (filteredCommands.length === 0) {
        await message.reply(`❌ لم يتم العثور على أوامر في الفئة: "${categoryName}".`).catch(() => {});
        return;
      }

      let msg = `╔══════════════╗\n🌐 أوامر الفئة: ${categoryName.toUpperCase()} 🌐\n╚══════════════╝\n`;
      filteredCommands.forEach((cmd) => {
        msg += `\n🪻 ${cmd.config.name}\n`;
      });

      await message.reply({ body: msg }).catch(() => {});
      return;
    }

    // مساعدة لأمر محدد: help <commandName>
    const commandName = args[0].toLowerCase();
    const resolvedName = aliases.get(commandName) || commandName;
    const command = commands.get(commandName) || commands.get(resolvedName);

    if (!command) {
      await message.reply(`❌ الأمر "${commandName}" غير موجود.\n✦ اكتب ${prefix}Kabos لعرض كل الأوامر المتاحة.`).catch(() => {});
      return;
    }

    const configCommand = command.config || {};
    const roleText = roleTextToString(configCommand.role);
    const author = configCommand.author || "غير معروف";

    const longDescription = configCommand.longDescription
      ? (configCommand.longDescription.en || "لا يوجد وصف")
      : "لا يوجد وصف";

    const guideBody = configCommand.guide?.en || "لا يوجد دليل متاح.";
    const usage = guideBody.replace(/{pn}|{p}/g, prefix).replace(/{n}/g, configCommand.name || "");

    const response = [
      "╭── الاسم ────⭓",
      `│ ${configCommand.name || ""}`,
      "├── معلومات",
      `│ 📄 الوصف: ${longDescription}`,
      `│ 🪄 أسماء أخرى: ${configCommand.aliases ? configCommand.aliases.join(", ") : "لا توجد"}`,
      `│ 🌀 الإصدار: ${configCommand.version || "1.0"}`,
      `│ 🎯 الصلاحية: ${roleText}`,
      `│ ⏱ زمن التنفيذ: ${configCommand.countDown || 1} ثانية`,
      `│ ✍️ المؤلف: ${author}`,
      "├── الاستخدام",
      `│ ${usage}`,
      "├── ملاحظات",
      "│ ✦ المحتوى داخل <...> يمكن تغييره",
      "│ ✦ المحتوى داخل [a|b|c] يعني a أو b أو c",
      "╰━━━━━━━❖"
    ].join("\n");

    await message.reply({ body: response }).catch(() => {});
  },
};

function roleTextToString(role) {
  switch (role) {
    case 0:
      return "0 (كل المستخدمين)";
    case 1:
      return "1 (مشرفو المجموعة)";
    case 2:
      return "2 (مشرفو البوت)";
    default:
      return "صلاحية غير معروفة";
  }
}
