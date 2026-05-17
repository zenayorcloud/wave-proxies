import { VercelRequest, VercelResponse } from "@vercel/node";
import { Telegraf } from "telegraf";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const webhookUrl = process.env.WEBHOOK_URL!;
const bot = new Telegraf(BOT_TOKEN);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const config = {
  maxDuration: 60,
};

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { body, query } = req;

    if (query.setWebhook === "true") {
      await bot.telegram.setWebhook(`${webhookUrl}/api/telegram-hook`);
      return res.status(200).send("OK");
    }

    if (body?.message?.text === "/start") {
      const chatId = body.message.chat.id;
      const userMessageId = body.message.message_id;
      const targetUrl = "t.me/+mQ31t_sl6pw4MzNk";
      const channelUrl = "t.me/lionhartproxxx";

      // Send reply
      const sent = await bot.telegram.sendMessage(
        chatId,
        `[Join now!](${targetUrl})\n[Join Here](${targetUrl})`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [[{ text: "Join Channel", url: channelUrl }]],
          },
        }
      );

      console.log("Reply sent:", sent.message_id);

      // Respond to Telegram immediately
      res.status(200).send("OK");

      // Keep function alive and delete after 60s
      await sleep(60 * 1000);

      try {
        await bot.telegram.deleteMessage(chatId, userMessageId);
        console.log("User message deleted");
      } catch (err) {
        console.error("Failed to delete user message:", err);
      }

      try {
        await bot.telegram.deleteMessage(chatId, sent.message_id);
        console.log("Bot message deleted");
      } catch (err) {
        console.error("Failed to delete bot message:", err);
      }

      return;
    }

    // For all other updates
    await bot.handleUpdate(body);
    return res.status(200).send("OK");

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
