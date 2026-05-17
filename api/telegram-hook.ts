import { VercelRequest, VercelResponse } from "@vercel/node";
import { Telegraf } from "telegraf";

const BOT_TOKEN = process.env.BOT_TOKEN;
const webhookUrl = process.env.WEBHOOK_URL;

const bot = new Telegraf(BOT_TOKEN);

export async function handleStartCommand(ctx) {
  const COMMAND = "/start";
  const channelUrl = "t.me/lionhartproxxx";
  const targetUrl = "t.me/+mQ31t_sl6pw4MzNk";
  const reply = `
[Join now!](${targetUrl})
[Join Here](${targetUrl})
`;

  try {
    const userMessageId = ctx.message.message_id;  // capture /start message ID
    const chatId = ctx.message.chat.id;

    const sentMessage = await ctx.reply(reply, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Join Channel",
              url: channelUrl,
            },
          ],
        ],
      },
    });

    console.log(`Reply to ${COMMAND} command sent successfully.`);

    setTimeout(async () => {
      // Delete user's /start message
      try {
        await ctx.telegram.deleteMessage(chatId, userMessageId);
        console.log("User /start message deleted.");
      } catch (deleteError) {
        console.error("Failed to delete user message:", deleteError);
      }

      // Delete bot's reply
      try {
        await ctx.telegram.deleteMessage(chatId, sentMessage.message_id);
        console.log("Bot reply deleted.");
      } catch (deleteError) {
        console.error("Failed to delete bot reply:", deleteError);
      }
    }, 2 * 60 * 1000);

  } catch (error) {
    console.error(`Something went wrong with the ${COMMAND} command:`, error);
  }
}

bot.command("start", async (ctx) => {
  await handleStartCommand(ctx);
});

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { body, query } = req;

    if (query.setWebhook === "true") {
      const success = await bot.telegram.setWebhook(webhookUrl);
      return res.status(200).send("OK");
    }

    await bot.handleUpdate(body);
    return res.status(200).send("OK");
  } catch (err) {
    return res.json({ error: "Internal server error" }, { status: 500 });
  }
};
