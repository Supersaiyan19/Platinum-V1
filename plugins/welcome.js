const { smd, bot_ } = require("../lib");

// Command to set or toggle the welcome message
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

      // Parse the command
      const [command, ...rest] = message.split(" ");
      const welcomeMessage = rest.join(" ").trim();

      // Fetch or initialize the group's settings
      const groupSettings =
        (await bot_.findOne({ id: "group_" + groupId })) ||
        (await bot_.new({ id: "group_" + groupId, welcomeEnabled: "false" }));

      if (command.toLowerCase() === "on") {
        if (groupSettings.welcomeEnabled === "true") {
          return await context.reply("*Welcome messages are already enabled!*");
        }

        // Enable welcome messages
        await bot_.updateOne({ id: "group_" + groupId }, { welcomeEnabled: "true" });
        return await context.reply("*Welcome messages have been enabled!*");
      } else if (command.toLowerCase() === "off") {
        if (groupSettings.welcomeEnabled === "false") {
          return await context.reply("*Welcome messages are already disabled!*");
        }

        // Disable welcome messages
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

        // Set the custom welcome message
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

// Trigger on new group members
smd(
  {
    on: "group_join",
  },
  async (context, message) => {
    try {
      const groupId = context.chatId;
      const newMembers = message.participants;

      // Retrieve group settings
      const groupSettings = await bot_.findOne({ id: "group_" + groupId });

      // Check if welcome messages are enabled
      if (!groupSettings || groupSettings.welcomeEnabled !== "true") return;

      const welcomeMessage = groupSettings.welcomeMessage || "Welcome {user} to {group}!";

      for (const member of newMembers) {
        const userName = `@${member.split("@")[0]}`; // Mention format for new member
        const groupName = context.groupName || "this group";

        // Replace placeholders with actual values
        const personalizedMessage = welcomeMessage
          .replace(/{user}/g, userName)
          .replace(/{group}/g, groupName);

        // Send the welcome message
        await context.reply(personalizedMessage, {
          mentions: [member],
        });
      }
    } catch (error) {
      console.error("Error in group_join handler: ", error);
    }
  }
);
