import { VercelRequest, VercelResponse } from "@vercel/node";
import { Telegraf } from "telegraf";

const BOT_TOKEN = process.env.BOT_TOKEN;
const webhookUrl = process.env.WEBHOOK_URL;

const bot = new Telegraf(BOT_TOKEN);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function handleStartCommand(ctx) {
  const COMMAND = "/start";
  const channelUrl = "t.me/lionhartproxxx";
  const targetUrl = "t.me/+mQ31t_sl6pw4MzNk";

  const reply = `
[Join now!](${targetUrl})
[Join Here](${targetUrl})
`;

  try {
    const userMessageId = ctx.message.message_id;
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

    // Return chat IDs so the webhook handler can manage deletion
    return { chatId, userMessageId, botMessageId: sentMessage.message_id };

  } catch (error) {
    console.error(`Something went wrong with the ${COMMAND} command:`, error);
    return null;
  }
}

bot.command("start", async (ctx) => {
  await handleStartCommand(ctx);
});

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { body, query } = req;

    if (query.setWebhook === "true") {
      await bot.telegram.setWebhook(webhookUrl);
      return res.status(200).send("OK");
    }

    // Process the update and grab message IDs
    let messageIds: { chatId: number; userMessageId: number; botMessageId: number } | null = null;

    bot.command("start", async (ctx) => {
      const userMessageId = ctx.message.message_id;
      const chatId = ctx.message.chat.id;

      const sentMessage = await ctx.reply(`[Join now!](t.me/+mQ31t_sl6pw4MzNk)\n[Join Here](t.me/+mQ31t_sl6pw4MzNk)`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "Join Channel", url: "t.me/lionhartproxxx" }]],
        },
      });

      messageIds = { chatId, userMessageId, botMessageId: sentMessage.message_id };
    });

    await bot.handleUpdate(body);

    // Respond to Telegram immediately so it doesn't retry
    res.status(200).send("OK");

    // Now sleep and delete AFTER responding
    if (messageIds) {
      await sleep(60 * 1000); // 60 seconds

      const { chatId, userMessageId, botMessageId } = messageIds;

      try {
        await bot.telegram.deleteMessage(chatId, userMessageId);
        console.log("User message deleted.");
      } catch (err) {
        console.error("Failed to delete user message:", err);
      }

      try {
        await bot.telegram.deleteMessage(chatId, botMessageId);
        console.log("Bot reply deleted.");
      } catch (err) {
        console.error("Failed to delete bot reply:", err);
      }
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
