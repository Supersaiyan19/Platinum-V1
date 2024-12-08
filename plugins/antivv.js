const { smd, bot_ } = require("../lib");
let botSettings = false;

// Command to enable or disable the AntiViewOnce feature
smd(
  {
    cmdname: "antiviewonce",
    alias: ["antivv"],
    desc: "Turn On/Off auto ViewOnce Downloader",
    fromMe: true,
    type: "user",
    use: "<on/off>",
    filename: __filename,
  },
  async (context, message) => {
    try {
      // Retrieve or create the bot settings for the user
      botSettings =
        (await bot_.findOne({
          id: "bot_" + context.user,
        })) ||
        (await bot_.new({
          id: "bot_" + context.user,
        }));

      let command = message.split(/\s+/)[0]?.toLowerCase();

      if (command === "on" || command === "enable" || command === "act") {
        if (botSettings.antiviewonce === "true") {
          return await context.reply("*AntiViewOnce already enabled!*");
        }
        await bot_.updateOne(
          {
            id: "bot_" + context.user,
          },
          {
            antiviewonce: "true",
          }
        );
        return await context.reply("*AntiViewOnce successfully enabled*");
      } else if (
        command === "off" ||
        command === "disable" ||
        command === "deact"
      ) {
        if (botSettings.antiviewonce === "false") {
          return await context.reply("*AntiViewOnce already disabled*");
        }
        await bot_.updateOne(
          {
            id: "bot_" + context.user,
          },
          {
            antiviewonce: "false",
          }
        );
        return await context.reply("*AntiViewOnce successfully deactivated*");
      } else {
        return await context.send(
          "*_Use on/off to enable/disable AntiViewOnce!_*"
        );
      }
    } catch (error) {
      await context.error(
        `An error occurred while processing your request.\n\nCommand: AntiViewOnce\n\nError Details: ${error.message}`
      );
    }
  }
);

// Handler for ViewOnce messages
smd(
  {
    on: "viewonce",
  },
  async (context, message) => {
    try {
      // Retrieve bot settings for the user
      if (!botSettings) {
        botSettings = await bot_.findOne({
          id: "bot_" + context.user,
        });
      }
      // Check if AntiViewOnce is enabled
      if (botSettings && botSettings.antiviewonce === "true") {
        // Download the ViewOnce media
        let mediaPath = await context.bot.downloadAndSaveMediaMessage(
          context.msg
        );

        // Get the sender's name
        let senderName = await context.bot.getName(context.sender);

        // Fetch chat name
        let chatName =
          context.chatName ||
          (await context.bot.getName(context.chat, true)) ||
          "Unknown Chat";

        // Constructing the notification message
        let notificationMessage =
          `*[VIEWONCE MESSAGE RETRIEVED]*\n\n` +
          `*SENDER:* @${context.participant.split("@")[0] || "Unknown"} (${senderName})\n` +
          `*TIME:* ${new Date().toLocaleTimeString()}\n` +
          `*CHAT:* ${chatName}\n` +
          `*MESSAGE:* ${context.body || "No content available"}\n`;

        // Send the downloaded media to the user's DM with the notification message
        await context.bot.sendMessage(context.user, {
          [context.mtype2.split("Message")[0]]: {
            url: mediaPath,
          },
          caption: notificationMessage,
          mentions: [
            context.participant.split("@")[0] || "Unknown",
            context.user,
          ].filter(Boolean),
        });
      }
    } catch (error) {
      console.log("Error while getting AntiViewOnce media: ", error);
    }
  }
);
