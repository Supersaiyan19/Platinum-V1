smd(
  {
    cmdname: "welcome",
    alias: ["setwelcome"],
    desc: "Set or toggle the welcome message for the group",
    fromMe: true,
    type: "group",
    use: "<on/off/set> [message]",
    filename: __filename,
  },
  async (context, message) => {
    try {
      const groupId = context.chatId;

      // Check if the user is an admin
      if (!context.isGroupAdmin) {
        return await context.reply("*Only group admins can manage the welcome message!*");
      }

      const [command, ...rest] = message.split(" ");
      const welcomeMessage = rest.join(" ").trim();

      const groupSettings =
        (await bot_.findOne({ id: "group_" + groupId })) ||
        (await bot_.new({ id: "group_" + groupId, welcomeEnabled: "false" }));

      if (command.toLowerCase() === "on") {
        if (groupSettings.welcomeEnabled === "true") {
          return await context.reply("*Welcome messages are already enabled!*");
        }
        await bot_.updateOne({ id: "group_" + groupId }, { welcomeEnabled: "true" });
        return await context.reply("*Welcome messages have been enabled!*");
      } else if (command.toLowerCase() === "off") {
        if (groupSettings.welcomeEnabled === "false") {
          return await context.reply("*Welcome messages are already disabled!*");
        }
        await bot_.updateOne({ id: "group_" + groupId }, { welcomeEnabled: "false" });
        return await context.reply("*Welcome messages have been disabled!*");
      } else if (command.toLowerCase() === "set") {
        if (!welcomeMessage) {
          return await context.reply(
            "*Please provide a welcome message to set!*\n" +
            "Placeholders you can use:\n" +
            "`{user}` - New member's name\n" +
            "`{group}` - Group name"
          );
        }
        await bot_.updateOne(
          { id: "group_" + groupId },
          { welcomeMessage: welcomeMessage }
        );
        return await context.reply("*Welcome message updated successfully!*");
      } else {
        return await context.reply(
          "*Invalid usage!*\n\nUse:\n" +
          "`!welcome on` - Enable welcome messages\n" +
          "`!welcome off` - Disable welcome messages\n" +
          "`!welcome set <message>` - Set a custom welcome message"
        );
      }
    } catch (error) {
      console.error("Error in welcome command: ", error);
      return await context.error("An error occurred while managing the welcome message.");
    }
  }
);
